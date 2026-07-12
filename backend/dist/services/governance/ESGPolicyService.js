"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESGPolicyService = void 0;
const ESGPolicyRepository_1 = require("../../repositories/ESGPolicyRepository");
const PolicyAcknowledgementRepository_1 = require("../../repositories/PolicyAcknowledgementRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const db_1 = require("../../database/db");
class ESGPolicyService {
    policyRepo;
    ackRepo;
    constructor(policyRepo = new ESGPolicyRepository_1.ESGPolicyRepository(), ackRepo = new PolicyAcknowledgementRepository_1.PolicyAcknowledgementRepository()) {
        this.policyRepo = policyRepo;
        this.ackRepo = ackRepo;
    }
    async create(dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const existing = await this.policyRepo.findByCode(dto.code, tx);
            if (existing) {
                throw AppError_1.AppError.conflict(`Policy with code ${dto.code} already exists.`);
            }
            const policy = await this.policyRepo.create({
                title: dto.title,
                code: dto.code,
                content: dto.content,
                effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
                version: dto.version || "1.0",
                status: dto.status || "DRAFT",
                createdByUserId: callerUserId,
            }, tx);
            // If created directly in ACTIVE status, auto-generate acknowledgements
            if (policy.status === "ACTIVE") {
                await this.generateAcknowledgements(policy.id, tx);
            }
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CREATE",
                entity: "ESGPolicy",
                entityId: policy.id,
                newValue: policy,
                tx,
            });
            return policy;
        });
    }
    async findById(id) {
        const policy = await this.policyRepo.findById(id);
        if (!policy) {
            throw AppError_1.AppError.notFound(`Policy with ID ${id} not found.`);
        }
        return policy;
    }
    async findByCode(code) {
        const policy = await this.policyRepo.findByCode(code);
        if (!policy) {
            throw AppError_1.AppError.notFound(`Policy with code ${code} not found.`);
        }
        return policy;
    }
    async findAll() {
        return this.policyRepo.findAll();
    }
    async update(id, dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.policyRepo.findById(id, tx);
            if (!oldState) {
                throw AppError_1.AppError.notFound(`Policy with ID ${id} not found.`);
            }
            if (dto.code && dto.code !== oldState.code) {
                const existing = await this.policyRepo.findByCode(dto.code, tx);
                if (existing) {
                    throw AppError_1.AppError.conflict(`Policy with code ${dto.code} already exists.`);
                }
            }
            const updated = await this.policyRepo.update(id, {
                title: dto.title,
                code: dto.code,
                content: dto.content,
                effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
                version: dto.version,
                status: dto.status,
                updatedByUserId: callerUserId,
            }, tx);
            // Trigger acknowledgements if transitioned from DRAFT to ACTIVE
            if (oldState.status !== "ACTIVE" && updated.status === "ACTIVE") {
                await this.generateAcknowledgements(updated.id, tx);
                await ActivityLogService_1.auditLogger.log({
                    userId: callerUserId,
                    action: "PUBLISH",
                    entity: "ESGPolicy",
                    entityId: id,
                    oldValue: oldState,
                    newValue: updated,
                    tx,
                });
            }
            else {
                await ActivityLogService_1.auditLogger.log({
                    userId: callerUserId,
                    action: "UPDATE",
                    entity: "ESGPolicy",
                    entityId: id,
                    oldValue: oldState,
                    newValue: updated,
                    tx,
                });
            }
            return updated;
        });
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.policyRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "ESGPolicy",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
    async generateAcknowledgements(policyId, tx) {
        // Fetch all active employees
        const employees = await tx.employee.findMany({
            where: { deletedAt: null },
        });
        if (employees.length === 0)
            return;
        const data = employees.map((emp) => ({
            policyId,
            employeeId: emp.id,
            status: "PENDING",
        }));
        await this.ackRepo.createMany(data, tx);
        // Create a policy reminder notification for each employee
        for (const emp of employees) {
            if (emp.userId) {
                await tx.notification.create({
                    data: {
                        userId: emp.userId,
                        title: "New Policy Acknowledgement Required",
                        message: `A new ESG Policy (ID: ${policyId}) has been published. Please read and acknowledge it.`,
                        type: "INFO",
                    },
                });
            }
        }
    }
}
exports.ESGPolicyService = ESGPolicyService;
