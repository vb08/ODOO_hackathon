import { Employee } from "@prisma/client";
import { IEmployeeRepository } from "../interfaces/IEmployeeRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { AppError } from "../utils/AppError";
import { auditLogger } from "./ActivityLogService";

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone?: string;
  departmentId?: string;
  userId?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  userId?: string;
}

export class EmployeeService {
  private employeeRepo: IEmployeeRepository;

  constructor(repo: IEmployeeRepository = new EmployeeRepository()) {
    this.employeeRepo = repo;
  }

  public async create(dto: CreateEmployeeDto, callerUserId: string): Promise<Employee> {
    const existingEmpId = await this.employeeRepo.findByEmployeeId(dto.employeeId);
    if (existingEmpId) {
      throw AppError.conflict(`Employee with ID ${dto.employeeId} already exists.`);
    }

    const employee = await this.employeeRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      employeeId: dto.employeeId,
      email: dto.email,
      phone: dto.phone,
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
      user: dto.userId ? { connect: { id: dto.userId } } : undefined,
      createdByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "Employee",
      entityId: employee.id,
      newValue: employee,
    });

    return employee;
  }

  public async findById(id: string): Promise<Employee> {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw AppError.notFound(`Employee with ID ${id} not found.`);
    }
    return employee;
  }

  public async findAll(): Promise<Employee[]> {
    return this.employeeRepo.findAll();
  }

  public async update(id: string, dto: UpdateEmployeeDto, callerUserId: string): Promise<Employee> {
    const oldState = await this.findById(id);

    if (dto.employeeId && dto.employeeId !== oldState.employeeId) {
      const existing = await this.employeeRepo.findByEmployeeId(dto.employeeId);
      if (existing) {
        throw AppError.conflict(`Employee with ID ${dto.employeeId} already exists.`);
      }
    }

    const updated = await this.employeeRepo.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      employeeId: dto.employeeId,
      email: dto.email,
      phone: dto.phone,
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : dto.departmentId === null ? { disconnect: true } : undefined,
      user: dto.userId ? { connect: { id: dto.userId } } : dto.userId === null ? { disconnect: true } : undefined,
      updatedByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "Employee",
      entityId: id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async delete(id: string, callerUserId: string): Promise<Employee> {
    const oldState = await this.findById(id);

    const deleted = await this.employeeRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "Employee",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }
}
