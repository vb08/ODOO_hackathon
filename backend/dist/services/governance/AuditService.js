"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const AuditRepository_1 = require("../../repositories/AuditRepository");
const AuditChecklistRepository_1 = require("../../repositories/AuditChecklistRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const db_1 = require("../../database/db");
class AuditService {
    auditRepo;
    checklistRepo;
    constructor(auditRepo = new AuditRepository_1.AuditRepository(), checklistRepo = new AuditChecklistRepository_1.AuditChecklistRepository()) {
        this.auditRepo = auditRepo;
        this.checklistRepo = checklistRepo;
    }
    async create(dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const existing = await this.auditRepo.findByCode(dto.code, tx);
            if (existing) {
                throw AppError_1.AppError.conflict(`Audit with code ${dto.code} already exists.`);
            }
            // Verify department
            const department = await tx.department.findFirst({
                where: { id: dto.departmentId, deletedAt: null },
            });
            if (!department) {
                throw AppError_1.AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
            }
            // Calculate initial percentage if score and maxScore are provided
            let percentage = null;
            if (dto.score !== undefined && dto.maxScore !== undefined && dto.maxScore > 0) {
                percentage = Math.round((dto.score / dto.maxScore) * 100 * 100) / 100;
            }
            const audit = await this.auditRepo.create({
                title: dto.title,
                code: dto.code,
                departmentId: dto.departmentId,
                auditorName: dto.auditorName,
                auditDate: new Date(dto.auditDate),
                status: dto.status || "PLANNED",
                score: dto.score,
                maxScore: dto.maxScore,
                percentage,
                findings: dto.findings,
                createdByUserId: callerUserId,
            }, tx);
            // Create checklist items if provided
            if (dto.checklists && dto.checklists.length > 0) {
                const checklistsData = dto.checklists.map((c) => ({
                    auditId: audit.id,
                    title: c.title,
                    status: c.status || "PENDING",
                    remarks: c.remarks,
                    createdByUserId: callerUserId,
                }));
                await this.checklistRepo.createMany(checklistsData, tx);
                await this.recalculateAuditScore(audit.id, tx);
            }
            const finalizedAudit = await this.auditRepo.findById(audit.id, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CREATE",
                entity: "Audit",
                entityId: audit.id,
                newValue: finalizedAudit,
                tx,
            });
            return finalizedAudit || audit;
        });
    }
    async findById(id) {
        const audit = await this.auditRepo.findById(id);
        if (!audit) {
            throw AppError_1.AppError.notFound(`Audit with ID ${id} not found.`);
        }
        return audit;
    }
    async findAll() {
        return this.auditRepo.findAll();
    }
    async findByDepartmentId(departmentId) {
        return this.auditRepo.findByDepartmentId(departmentId);
    }
    async update(id, dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.auditRepo.findById(id, tx);
            if (!oldState) {
                throw AppError_1.AppError.notFound(`Audit with ID ${id} not found.`);
            }
            if (dto.code && dto.code !== oldState.code) {
                const existing = await this.auditRepo.findByCode(dto.code, tx);
                if (existing) {
                    throw AppError_1.AppError.conflict(`Audit with code ${dto.code} already exists.`);
                }
            }
            let percentage = oldState.percentage;
            const finalScore = dto.score !== undefined ? dto.score : oldState.score;
            const finalMaxScore = dto.maxScore !== undefined ? dto.maxScore : oldState.maxScore;
            if (finalScore !== null && finalMaxScore !== null && finalMaxScore > 0) {
                percentage = Math.round((finalScore / finalMaxScore) * 100 * 100) / 100;
            }
            const updated = await this.auditRepo.update(id, {
                title: dto.title,
                code: dto.code,
                departmentId: dto.departmentId,
                auditorName: dto.auditorName,
                auditDate: dto.auditDate ? new Date(dto.auditDate) : undefined,
                status: dto.status,
                score: dto.score,
                maxScore: dto.maxScore,
                percentage,
                findings: dto.findings,
                updatedByUserId: callerUserId,
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE",
                entity: "Audit",
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
        const deleted = await this.auditRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "Audit",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
    /**
     * Update Checklist Item status/remarks and trigger score recalculation
     */
    async updateChecklistItem(id, dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const checklist = await this.checklistRepo.findById(id, tx);
            if (!checklist) {
                throw AppError_1.AppError.notFound(`Checklist item with ID ${id} not found.`);
            }
            const oldState = { ...checklist };
            const updated = await this.checklistRepo.update(id, {
                status: dto.status,
                remarks: dto.remarks,
                verifiedBy: dto.verifiedBy,
                updatedByUserId: callerUserId,
            }, tx);
            // Trigger recalculation on parent audit
            await this.recalculateAuditScore(checklist.auditId, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE",
                entity: "AuditChecklist",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    /**
     * Helper to recalculate audit scores based on checklists verified
     */
    async recalculateAuditScore(auditId, tx) {
        const checklists = await tx.auditChecklist.findMany({
            where: { auditId, deletedAt: null },
        });
        if (checklists.length === 0)
            return;
        const verifiedCount = checklists.filter((c) => c.status === "VERIFIED").length;
        const totalCount = checklists.length;
        const percentage = Math.round((verifiedCount / totalCount) * 100 * 100) / 100;
        await tx.audit.update({
            where: { id: auditId },
            data: {
                score: verifiedCount,
                maxScore: totalCount,
                percentage,
            },
        });
    }
}
exports.AuditService = AuditService;
