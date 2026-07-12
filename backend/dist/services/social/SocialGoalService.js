"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialGoalService = void 0;
const SocialGoalRepository_1 = require("../../repositories/SocialGoalRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const db_1 = require("../../database/db");
class SocialGoalService {
    goalRepo;
    constructor(repo = new SocialGoalRepository_1.SocialGoalRepository()) {
        this.goalRepo = repo;
    }
    async create(dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            // Check duplicate goal for department and year
            const existing = await this.goalRepo.findByDepartmentAndYear(dto.departmentId || null, dto.year, tx);
            if (existing) {
                throw AppError_1.AppError.conflict(`Social goal for department and year ${dto.year} already exists.`);
            }
            if (dto.departmentId) {
                const dept = await tx.department.findFirst({ where: { id: dto.departmentId, deletedAt: null } });
                if (!dept)
                    throw AppError_1.AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
            }
            const goal = await this.goalRepo.create({
                title: dto.title,
                description: dto.description,
                targetVolunteerHours: dto.targetVolunteerHours,
                year: dto.year,
                departmentId: dto.departmentId,
                status: dto.status || "ACTIVE",
                createdByUserId: callerUserId,
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CREATE",
                entity: "SocialGoal",
                entityId: goal.id,
                newValue: goal,
                tx,
            });
            return goal;
        });
    }
    async findById(id) {
        const goal = await this.goalRepo.findById(id);
        if (!goal)
            throw AppError_1.AppError.notFound(`Social Goal with ID ${id} not found.`);
        return goal;
    }
    async findAll() {
        return this.goalRepo.findAll();
    }
    async findByDepartmentId(departmentId) {
        return this.goalRepo.findByDepartmentId(departmentId);
    }
    async update(id, dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.goalRepo.findById(id, tx);
            if (!oldState)
                throw AppError_1.AppError.notFound(`Social Goal with ID ${id} not found.`);
            const updated = await this.goalRepo.update(id, {
                title: dto.title,
                description: dto.description,
                targetVolunteerHours: dto.targetVolunteerHours,
                year: dto.year,
                departmentId: dto.departmentId,
                status: dto.status,
                updatedByUserId: callerUserId,
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE",
                entity: "SocialGoal",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.goalRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "SocialGoal",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
}
exports.SocialGoalService = SocialGoalService;
