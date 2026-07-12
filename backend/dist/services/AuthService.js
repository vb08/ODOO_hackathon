"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const RoleRepository_1 = require("../repositories/RoleRepository");
const EmployeeRepository_1 = require("../repositories/EmployeeRepository");
const bcrypt_1 = require("../helpers/bcrypt");
const jwt_1 = require("../helpers/jwt");
const AppError_1 = require("../utils/AppError");
const roles_1 = require("../constants/roles");
const db_1 = require("../database/db");
const ActivityLogService_1 = require("./ActivityLogService");
class AuthService {
    userRepository;
    roleRepository;
    employeeRepository;
    constructor(userRepo = new UserRepository_1.UserRepository(), roleRepo = new RoleRepository_1.RoleRepository(), employeeRepo = new EmployeeRepository_1.EmployeeRepository()) {
        this.userRepository = userRepo;
        this.roleRepository = roleRepo;
        this.employeeRepository = employeeRepo;
    }
    /**
     * Registers a user and creates their associated HR employee record.
     * Executed atomically inside a database transaction.
     */
    async signup(input) {
        // 1. Transaction to guarantee atomicity of User and Employee creation
        return db_1.prisma.$transaction(async (tx) => {
            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(input.email, tx);
            if (existingUser) {
                throw AppError_1.AppError.conflict("A user with this email address already exists.");
            }
            // Check if employee already exists
            const existingEmp = await this.employeeRepository.findByEmployeeId(input.employeeId, tx);
            if (existingEmp) {
                throw AppError_1.AppError.conflict("An employee with this Employee ID already exists.");
            }
            // Find Default Role (EMPLOYEE)
            const employeeRole = await this.roleRepository.findByCode(roles_1.RoleCode.EMPLOYEE, tx);
            if (!employeeRole) {
                throw AppError_1.AppError.internal("Default system role 'EMPLOYEE' not found.");
            }
            // Hash password
            const passwordHash = await bcrypt_1.BcryptHelper.hash(input.passwordHash);
            // Create User
            const createdUser = await this.userRepository.create({
                email: input.email,
                passwordHash,
                role: { connect: { id: employeeRole.id } },
            }, tx);
            // Create Employee profile linked 1-to-1 with the created User
            const createdEmployee = await this.employeeRepository.create({
                firstName: input.firstName,
                lastName: input.lastName,
                employeeId: input.employeeId,
                email: input.email,
                user: { connect: { id: createdUser.id } },
            }, tx);
            // Create system logs
            await ActivityLogService_1.auditLogger.log({
                userId: createdUser.id,
                action: "CREATE",
                entity: "User",
                entityId: createdUser.id,
                newValue: { id: createdUser.id, email: createdUser.email, roleId: createdUser.roleId },
                tx,
            });
            await ActivityLogService_1.auditLogger.log({
                userId: createdUser.id,
                action: "CREATE",
                entity: "Employee",
                entityId: createdEmployee.id,
                newValue: { id: createdEmployee.id, employeeId: createdEmployee.employeeId, email: createdEmployee.email },
                tx,
            });
            // Token payloads
            const payload = {
                userId: createdUser.id,
                email: createdUser.email,
                role: employeeRole.code,
                employeeId: createdEmployee.id,
            };
            const accessToken = jwt_1.JwtHelper.generateAccessToken(payload);
            const refreshToken = jwt_1.JwtHelper.generateRefreshToken({ userId: createdUser.id });
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
    async login(email, rawPassword) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw AppError_1.AppError.unauthorized("Invalid email or password.");
        }
        if (!user.isActive) {
            throw AppError_1.AppError.unauthorized("This user account is inactive. Contact Administrator.");
        }
        const isPasswordValid = await bcrypt_1.BcryptHelper.compare(rawPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw AppError_1.AppError.unauthorized("Invalid email or password.");
        }
        // Resolve Role and Employee from user relations
        const userRole = user.role;
        const userEmployee = user.employee;
        // Sign tokens
        const payload = {
            userId: user.id,
            email: user.email,
            role: userRole.code,
            employeeId: userEmployee?.id,
        };
        const accessToken = jwt_1.JwtHelper.generateAccessToken(payload);
        const refreshToken = jwt_1.JwtHelper.generateRefreshToken({ userId: user.id });
        // System log
        await ActivityLogService_1.auditLogger.log({
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
    async refresh(token) {
        try {
            const decoded = jwt_1.JwtHelper.verifyRefreshToken(token);
            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                throw AppError_1.AppError.unauthorized("User record not found.");
            }
            if (!user.isActive) {
                throw AppError_1.AppError.unauthorized("User account has been deactivated.");
            }
            const userRole = user.role;
            const userEmployee = user.employee;
            const payload = {
                userId: user.id,
                email: user.email,
                role: userRole.code,
                employeeId: userEmployee?.id,
            };
            const accessToken = jwt_1.JwtHelper.generateAccessToken(payload);
            return { accessToken };
        }
        catch (error) {
            throw AppError_1.AppError.unauthorized("Refresh token is invalid or expired.");
        }
    }
}
exports.AuthService = AuthService;
