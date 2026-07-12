"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentalGoalService = void 0;
const EnvironmentalGoalRepository_1 = require("../../repositories/EnvironmentalGoalRepository");
const DepartmentRepository_1 = require("../../repositories/DepartmentRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const db_1 = require("../../database/db");
class EnvironmentalGoalService {
    goalRepo;
    departmentRepo;
    constructor(goalRepo = new EnvironmentalGoalRepository_1.EnvironmentalGoalRepository(), deptRepo = new DepartmentRepository_1.DepartmentRepository()) {
        this.goalRepo = goalRepo;
        this.departmentRepo = deptRepo;
    }
    async create(dto, callerUserId) {
        const existing = await this.goalRepo.findByDepartmentAndYear(dto.departmentId, dto.year);
        if (existing) {
            throw AppError_1.AppError.conflict(`Environmental goal for department ID ${dto.departmentId} and year ${dto.year} already exists.`);
        }
        const department = await this.departmentRepo.findById(dto.departmentId);
        if (!department) {
            throw AppError_1.AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
        }
        const goal = await this.goalRepo.create({
            departmentId: dto.departmentId,
            targetEmissions: dto.targetEmissions,
            year: dto.year,
            status: "ACTIVE",
            description: dto.description,
            createdByUserId: callerUserId,
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "EnvironmentalGoal",
            entityId: goal.id,
            newValue: goal,
        });
        return goal;
    }
    async findById(id) {
        const goal = await this.goalRepo.findById(id);
        if (!goal) {
            throw AppError_1.AppError.notFound(`Environmental goal with ID ${id} not found.`);
        }
        return goal;
    }
    async findAll() {
        return this.goalRepo.findAll();
    }
    async findByDepartmentId(departmentId) {
        const department = await this.departmentRepo.findById(departmentId);
        if (!department) {
            throw AppError_1.AppError.notFound(`Department with ID ${departmentId} not found.`);
        }
        return this.goalRepo.findByDepartmentId(departmentId);
    }
    async update(id, dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.goalRepo.findById(id, tx);
            if (!oldState) {
                throw AppError_1.AppError.notFound(`Environmental goal with ID ${id} not found.`);
            }
            if (dto.year && dto.departmentId) {
                const existing = await this.goalRepo.findByDepartmentAndYear(dto.departmentId, dto.year, tx);
                if (existing && existing.id !== id) {
                    throw AppError_1.AppError.conflict(`Environmental goal for department ID ${dto.departmentId} and year ${dto.year} already exists.`);
                }
            }
            const updated = await this.goalRepo.update(id, {
                departmentId: dto.departmentId,
                targetEmissions: dto.targetEmissions,
                year: dto.year,
                status: dto.status,
                description: dto.description,
                updatedByUserId: callerUserId,
            }, tx);
            // If status transitioned to ACHIEVED, notify department manager and ESG managers
            if (oldState.status !== "ACHIEVED" && dto.status === "ACHIEVED") {
                await this.triggerGoalAchievedNotifications(updated, tx, callerUserId);
            }
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE",
                entity: "EnvironmentalGoal",
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
            entity: "EnvironmentalGoal",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
    async triggerGoalAchievedNotifications(goal, tx, callerUserId) {
        const department = await this.departmentRepo.findById(goal.departmentId, tx);
        if (!department)
            return;
        // Find all Admins & ESG Managers
        const recipients = await tx.user.findMany({
            where: {
                deletedAt: null,
                role: {
                    code: { in: ["ADMIN", "ESG_MANAGER"] },
                },
            },
        });
        // Add Department Head
        if (department.manager && department.manager.userId) {
            const hasManager = recipients.some((r) => r.id === department.manager?.userId);
            if (!hasManager) {
                const managerUser = await tx.user.findFirst({
                    where: { id: department.manager.userId, deletedAt: null },
                });
                if (managerUser) {
                    recipients.push(managerUser);
                }
            }
        }
        const title = "Goal Achieved Successfully";
        const message = `Department '${department.name}' has achieved its environmental goal of staying below ${goal.targetEmissions} CO2 for the year ${goal.year}.`;
        for (const user of recipients) {
            await tx.notification.create({
                data: {
                    userId: user.id,
                    title,
                    message,
                    type: "SUCCESS",
                    createdByUserId: callerUserId,
                },
            });
        }
    }
}
exports.EnvironmentalGoalService = EnvironmentalGoalService;
