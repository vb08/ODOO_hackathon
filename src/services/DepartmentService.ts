import { Department } from "@prisma/client";
import { IDepartmentRepository } from "../interfaces/IDepartmentRepository";
import { DepartmentRepository } from "../repositories/DepartmentRepository";
import { AppError } from "../utils/AppError";
import { auditLogger } from "./ActivityLogService";

export interface CreateDepartmentDto {
  name: string;
  code: string;
  managerId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  managerId?: string;
}

export class DepartmentService {
  private departmentRepo: IDepartmentRepository;

  constructor(repo: IDepartmentRepository = new DepartmentRepository()) {
    this.departmentRepo = repo;
  }

  public async create(dto: CreateDepartmentDto, callerUserId: string): Promise<Department> {
    const existing = await this.departmentRepo.findByCode(dto.code);
    if (existing) {
      throw AppError.conflict(`Department with code ${dto.code} already exists.`);
    }

    const department = await this.departmentRepo.create({
      name: dto.name,
      code: dto.code,
      manager: dto.managerId ? { connect: { id: dto.managerId } } : undefined,
      createdByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "Department",
      entityId: department.id,
      newValue: department,
    });

    return department;
  }

  public async findById(id: string): Promise<Department> {
    const department = await this.departmentRepo.findById(id);
    if (!department) {
      throw AppError.notFound(`Department with ID ${id} not found.`);
    }
    return department;
  }

  public async findAll(): Promise<Department[]> {
    return this.departmentRepo.findAll();
  }

  public async update(id: string, dto: UpdateDepartmentDto, callerUserId: string): Promise<Department> {
    const oldState = await this.findById(id);

    if (dto.code && dto.code !== oldState.code) {
      const existing = await this.departmentRepo.findByCode(dto.code);
      if (existing) {
        throw AppError.conflict(`Department with code ${dto.code} already exists.`);
      }
    }

    const updated = await this.departmentRepo.update(id, {
      name: dto.name,
      code: dto.code,
      manager: dto.managerId ? { connect: { id: dto.managerId } } : dto.managerId === null ? { disconnect: true } : undefined,
      updatedByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "Department",
      entityId: id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async delete(id: string, callerUserId: string): Promise<Department> {
    // Assert existence
    const oldState = await this.findById(id);

    const deleted = await this.departmentRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "Department",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }
}
