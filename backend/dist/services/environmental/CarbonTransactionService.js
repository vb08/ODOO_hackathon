"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonTransactionService = void 0;
const CarbonTransactionRepository_1 = require("../../repositories/CarbonTransactionRepository");
const EmissionFactorRepository_1 = require("../../repositories/EmissionFactorRepository");
const DepartmentRepository_1 = require("../../repositories/DepartmentRepository");
const EnvironmentalGoalRepository_1 = require("../../repositories/EnvironmentalGoalRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const db_1 = require("../../database/db");
class CarbonTransactionService {
    transactionRepo;
    factorRepo;
    departmentRepo;
    goalRepo;
    constructor(txRepo = new CarbonTransactionRepository_1.CarbonTransactionRepository(), factorRepo = new EmissionFactorRepository_1.EmissionFactorRepository(), deptRepo = new DepartmentRepository_1.DepartmentRepository(), goalRepo = new EnvironmentalGoalRepository_1.EnvironmentalGoalRepository()) {
        this.transactionRepo = txRepo;
        this.factorRepo = factorRepo;
        this.departmentRepo = deptRepo;
        this.goalRepo = goalRepo;
    }
    async create(dto, callerUserId) {
        if (dto.quantity < 0) {
            throw AppError_1.AppError.badRequest("Quantity cannot be negative.");
        }
        return db_1.prisma.$transaction(async (tx) => {
            // Validate department
            const department = await this.departmentRepo.findById(dto.departmentId, tx);
            if (!department) {
                throw AppError_1.AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
            }
            // Validate emission factor
            const factor = await this.factorRepo.findById(dto.emissionFactorId, tx);
            if (!factor) {
                throw AppError_1.AppError.notFound(`Emission factor with ID ${dto.emissionFactorId} not found.`);
            }
            // Calculate emissions
            const emissions = dto.quantity * factor.factor;
            const transaction = await this.transactionRepo.create({
                departmentId: dto.departmentId,
                emissionFactorId: dto.emissionFactorId,
                quantity: dto.quantity,
                emissions,
                evidenceUrl: dto.evidenceUrl,
                transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
                description: dto.description,
                status: "PENDING", // Always PENDING initially
                createdByUserId: callerUserId,
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CREATE",
                entity: "CarbonTransaction",
                entityId: transaction.id,
                newValue: transaction,
                tx,
            });
            return transaction;
        });
    }
    async findById(id) {
        const transaction = await this.transactionRepo.findById(id);
        if (!transaction) {
            throw AppError_1.AppError.notFound(`Carbon transaction with ID ${id} not found.`);
        }
        return transaction;
    }
    async findAll() {
        return this.transactionRepo.findAll();
    }
    async findByDepartmentId(departmentId) {
        const department = await this.departmentRepo.findById(departmentId);
        if (!department) {
            throw AppError_1.AppError.notFound(`Department with ID ${departmentId} not found.`);
        }
        return this.transactionRepo.findByDepartmentId(departmentId);
    }
    async update(id, dto, callerUserId) {
        if (dto.quantity !== undefined && dto.quantity < 0) {
            throw AppError_1.AppError.badRequest("Quantity cannot be negative.");
        }
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.transactionRepo.findById(id, tx);
            if (!oldState) {
                throw AppError_1.AppError.notFound(`Carbon transaction with ID ${id} not found.`);
            }
            let newDeptId = dto.departmentId || oldState.departmentId;
            let newFactorId = dto.emissionFactorId || oldState.emissionFactorId;
            let newQuantity = dto.quantity !== undefined ? dto.quantity : oldState.quantity;
            const department = await this.departmentRepo.findById(newDeptId, tx);
            if (!department) {
                throw AppError_1.AppError.notFound(`Department with ID ${newDeptId} not found.`);
            }
            const factor = await this.factorRepo.findById(newFactorId, tx);
            if (!factor) {
                throw AppError_1.AppError.notFound(`Emission factor with ID ${newFactorId} not found.`);
            }
            const emissions = newQuantity * factor.factor;
            const updated = await this.transactionRepo.update(id, {
                departmentId: newDeptId,
                emissionFactorId: newFactorId,
                quantity: newQuantity,
                emissions,
                evidenceUrl: dto.evidenceUrl,
                transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
                description: dto.description,
                updatedByUserId: callerUserId,
            }, tx);
            // If the transaction was APPROVED, recheck goal targets
            if (oldState.status === "APPROVED") {
                await this.checkAndTriggerTargetNotifications(newDeptId, updated.transactionDate.getFullYear(), tx, callerUserId);
            }
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE",
                entity: "CarbonTransaction",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    async approve(id, status, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const transaction = await this.transactionRepo.findById(id, tx);
            if (!transaction) {
                throw AppError_1.AppError.notFound(`Carbon transaction with ID ${id} not found.`);
            }
            if (transaction.status === status) {
                return transaction;
            }
            const oldState = { ...transaction };
            const updated = await this.transactionRepo.update(id, {
                status,
                updatedByUserId: callerUserId,
            }, tx);
            // Trigger target limit notifications if transitioning to APPROVED
            if (status === "APPROVED") {
                await this.checkAndTriggerTargetNotifications(transaction.departmentId, transaction.transactionDate.getFullYear(), tx, callerUserId);
            }
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE_STATUS",
                entity: "CarbonTransaction",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    async delete(id, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.transactionRepo.findById(id, tx);
            if (!oldState) {
                throw AppError_1.AppError.notFound(`Carbon transaction with ID ${id} not found.`);
            }
            const deleted = await this.transactionRepo.delete(id, callerUserId, tx);
            // No department metrics update needed due to dynamic calculation
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "DELETE",
                entity: "CarbonTransaction",
                entityId: id,
                oldValue: oldState,
                newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
                tx,
            });
            return deleted;
        });
    }
    /**
     * Helper method to verify if a department's current year emissions exceed its goal target,
     * and triggers warning notifications to Department Head and ESG Manager / Admin.
     */
    async checkAndTriggerTargetNotifications(departmentId, year, tx, callerUserId) {
        const department = await this.departmentRepo.findById(departmentId, tx);
        if (!department)
            return;
        const goal = await this.goalRepo.findByDepartmentAndYear(departmentId, year, tx);
        if (!goal || goal.status === "EXCEEDED")
            return;
        const totalResult = await tx.carbonTransaction.aggregate({
            where: {
                departmentId,
                status: "APPROVED",
                deletedAt: null,
                transactionDate: {
                    gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    lte: new Date(`${year}-12-31T23:59:59.999Z`),
                },
            },
            _sum: { emissions: true },
        });
        const currentEmissions = totalResult._sum.emissions || 0;
        if (currentEmissions > goal.targetEmissions) {
            // Set status to EXCEEDED
            await this.goalRepo.update(goal.id, { status: "EXCEEDED" }, tx);
            // Find all Admins & ESG Managers
            const recipients = await tx.user.findMany({
                where: {
                    deletedAt: null,
                    role: {
                        code: { in: ["ADMIN", "ESG_MANAGER"] },
                    },
                },
            });
            // Add Department Manager (Department Head) if exists
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
            // Send warning notifications
            const title = "Emissions Target Exceeded";
            const message = `Department '${department.name}' has exceeded its target limit of ${goal.targetEmissions} CO2 for the year ${year}. Current total: ${currentEmissions} CO2.`;
            for (const user of recipients) {
                await tx.notification.create({
                    data: {
                        userId: user.id,
                        title,
                        message,
                        type: "WARNING",
                        createdByUserId: callerUserId,
                    },
                });
            }
        }
    }
}
exports.CarbonTransactionService = CarbonTransactionService;
