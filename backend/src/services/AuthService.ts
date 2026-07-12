import { IUserRepository } from "../interfaces/IUserRepository";
import { IRoleRepository } from "../interfaces/IRoleRepository";
import { IEmployeeRepository } from "../interfaces/IEmployeeRepository";
import { UserRepository } from "../repositories/UserRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { BcryptHelper } from "../helpers/bcrypt";
import { JwtHelper, UserTokenPayload } from "../helpers/jwt";
import { AppError } from "../utils/AppError";
import { RoleCode } from "../constants/roles";
import { prisma } from "../database/db";
import { auditLogger } from "./ActivityLogService";

export interface SignupInput {
  email: string;
  passwordHash: string; // pre-hashed or raw? We will receive plain text and hash it here
  firstName: string;
  lastName: string;
  employeeId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
      employeeId: string;
    } | null;
  };
}

export class AuthService {
  private userRepository: IUserRepository;
  private roleRepository: IRoleRepository;
  private employeeRepository: IEmployeeRepository;

  constructor(
    userRepo: IUserRepository = new UserRepository(),
    roleRepo: IRoleRepository = new RoleRepository(),
    employeeRepo: IEmployeeRepository = new EmployeeRepository()
  ) {
    this.userRepository = userRepo;
    this.roleRepository = roleRepo;
    this.employeeRepository = employeeRepo;
  }

  /**
   * Registers a user and creates their associated HR employee record.
   * Executed atomically inside a database transaction.
   */
  public async signup(input: SignupInput): Promise<LoginResponse> {
    // 1. Transaction to guarantee atomicity of User and Employee creation
    return prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(input.email, tx);
      if (existingUser) {
        throw AppError.conflict("A user with this email address already exists.");
      }

      // Check if employee already exists
      const existingEmp = await this.employeeRepository.findByEmployeeId(input.employeeId, tx);
      if (existingEmp) {
        throw AppError.conflict("An employee with this Employee ID already exists.");
      }

      // Find Default Role (EMPLOYEE)
      const employeeRole = await this.roleRepository.findByCode(RoleCode.EMPLOYEE, tx);
      if (!employeeRole) {
        throw AppError.internal("Default system role 'EMPLOYEE' not found.");
      }

      // Hash password
      const passwordHash = await BcryptHelper.hash(input.passwordHash);

      // Create User
      const createdUser = await this.userRepository.create(
        {
          email: input.email,
          passwordHash,
          role: { connect: { id: employeeRole.id } },
        },
        tx
      );

      // Create Employee profile linked 1-to-1 with the created User
      const createdEmployee = await this.employeeRepository.create(
        {
          firstName: input.firstName,
          lastName: input.lastName,
          employeeId: input.employeeId,
          email: input.email,
          user: { connect: { id: createdUser.id } },
        },
        tx
      );

      // Create system logs
      await auditLogger.log({
        userId: createdUser.id,
        action: "CREATE",
        entity: "User",
        entityId: createdUser.id,
        newValue: { id: createdUser.id, email: createdUser.email, roleId: createdUser.roleId },
        tx,
      });

      await auditLogger.log({
        userId: createdUser.id,
        action: "CREATE",
        entity: "Employee",
        entityId: createdEmployee.id,
        newValue: { id: createdEmployee.id, employeeId: createdEmployee.employeeId, email: createdEmployee.email },
        tx,
      });

      // Token payloads
      const payload: UserTokenPayload = {
        userId: createdUser.id,
        email: createdUser.email,
        role: employeeRole.code,
        employeeId: createdEmployee.id,
      };

      const accessToken = JwtHelper.generateAccessToken(payload);
      const refreshToken = JwtHelper.generateRefreshToken({ userId: createdUser.id });

      return {
        accessToken,
        refreshToken,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: employeeRole.code,
          employee: {
            id: createdEmployee.id,
            firstName: createdEmployee.firstName,
            lastName: createdEmployee.lastName,
            employeeId: createdEmployee.employeeId,
          },
        },
      };
    });
  }

  /**
   * Logins a user, verifies credentials, and issues access/refresh tokens.
   */
  public async login(email: string, rawPassword: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    if (!user.isActive) {
      throw AppError.unauthorized("This user account is inactive. Contact Administrator.");
    }

    const isPasswordValid = await BcryptHelper.compare(rawPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    // Resolve Role and Employee from user relations
    const userRole = (user as unknown as { role: { code: string } }).role;
    const userEmployee = (user as unknown as { employee?: { id: string; firstName: string; lastName: string; employeeId: string } | null }).employee;

    // Sign tokens
    const payload: UserTokenPayload = {
      userId: user.id,
      email: user.email,
      role: userRole.code,
      employeeId: userEmployee?.id,
    };

    const accessToken = JwtHelper.generateAccessToken(payload);
    const refreshToken = JwtHelper.generateRefreshToken({ userId: user.id });

    // System log
    await auditLogger.log({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      newValue: { loginTime: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: userRole.code,
        employee: userEmployee
          ? {
              id: userEmployee.id,
              firstName: userEmployee.firstName,
              lastName: userEmployee.lastName,
              employeeId: userEmployee.employeeId,
            }
          : null,
      },
    };
  }

  /**
   * Reissues access token given a valid refresh token.
   */
  public async refresh(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = JwtHelper.verifyRefreshToken(token);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw AppError.unauthorized("User record not found.");
      }

      if (!user.isActive) {
        throw AppError.unauthorized("User account has been deactivated.");
      }

      const userRole = (user as unknown as { role: { code: string } }).role;
      const userEmployee = (user as unknown as { employee?: { id: string } | null }).employee;

      const payload: UserTokenPayload = {
        userId: user.id,
        email: user.email,
        role: userRole.code,
        employeeId: userEmployee?.id,
      };

      const accessToken = JwtHelper.generateAccessToken(payload);

      return { accessToken };
    } catch (error) {
      throw AppError.unauthorized("Refresh token is invalid or expired.");
    }
  }
}
