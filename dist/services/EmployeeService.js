"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const EmployeeRepository_1 = require("../repositories/EmployeeRepository");
const AppError_1 = require("../utils/AppError");
const ActivityLogService_1 = require("./ActivityLogService");
class EmployeeService {
    employeeRepo;
    constructor(repo = new EmployeeRepository_1.EmployeeRepository()) {
        this.employeeRepo = repo;
    }
    async create(dto, callerUserId) {
        const existingEmpId = await this.employeeRepo.findByEmployeeId(dto.employeeId);
        if (existingEmpId) {
            throw AppError_1.AppError.conflict(`Employee with ID ${dto.employeeId} already exists.`);
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
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "Employee",
            entityId: employee.id,
            newValue: employee,
        });
        return employee;
    }
    async findById(id) {
        const employee = await this.employeeRepo.findById(id);
        if (!employee) {
            throw AppError_1.AppError.notFound(`Employee with ID ${id} not found.`);
        }
        return employee;
    }
    async findAll() {
        return this.employeeRepo.findAll();
    }
    async update(id, dto, callerUserId) {
        const oldState = await this.findById(id);
        if (dto.employeeId && dto.employeeId !== oldState.employeeId) {
            const existing = await this.employeeRepo.findByEmployeeId(dto.employeeId);
            if (existing) {
                throw AppError_1.AppError.conflict(`Employee with ID ${dto.employeeId} already exists.`);
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
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "Employee",
            entityId: id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.employeeRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
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
exports.EmployeeService = EmployeeService;
