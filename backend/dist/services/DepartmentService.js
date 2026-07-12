"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const DepartmentRepository_1 = require("../repositories/DepartmentRepository");
const AppError_1 = require("../utils/AppError");
const ActivityLogService_1 = require("./ActivityLogService");
class DepartmentService {
    departmentRepo;
    constructor(repo = new DepartmentRepository_1.DepartmentRepository()) {
        this.departmentRepo = repo;
    }
    async create(dto, callerUserId) {
        const existing = await this.departmentRepo.findByCode(dto.code);
        if (existing) {
            throw AppError_1.AppError.conflict(`Department with code ${dto.code} already exists.`);
        }
        const department = await this.departmentRepo.create({
            name: dto.name,
            code: dto.code,
            manager: dto.managerId ? { connect: { id: dto.managerId } } : undefined,
            createdByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "Department",
            entityId: department.id,
            newValue: department,
        });
        return department;
    }
    async findById(id) {
        const department = await this.departmentRepo.findById(id);
        if (!department) {
            throw AppError_1.AppError.notFound(`Department with ID ${id} not found.`);
        }
        return department;
    }
    async findAll() {
        return this.departmentRepo.findAll();
    }
    async update(id, dto, callerUserId) {
        const oldState = await this.findById(id);
        if (dto.code && dto.code !== oldState.code) {
            const existing = await this.departmentRepo.findByCode(dto.code);
            if (existing) {
                throw AppError_1.AppError.conflict(`Department with code ${dto.code} already exists.`);
            }
        }
        const updated = await this.departmentRepo.update(id, {
            name: dto.name,
            code: dto.code,
            manager: dto.managerId ? { connect: { id: dto.managerId } } : dto.managerId === null ? { disconnect: true } : undefined,
            updatedByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "Department",
            entityId: id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async delete(id, callerUserId) {
        // Assert existence
        const oldState = await this.findById(id);
        const deleted = await this.departmentRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
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
exports.DepartmentService = DepartmentService;
