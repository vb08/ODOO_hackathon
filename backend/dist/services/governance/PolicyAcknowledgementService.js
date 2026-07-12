"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyAcknowledgementService = void 0;
const PolicyAcknowledgementRepository_1 = require("../../repositories/PolicyAcknowledgementRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const db_1 = require("../../database/db");
class PolicyAcknowledgementService {
    ackRepo;
    constructor(repo = new PolicyAcknowledgementRepository_1.PolicyAcknowledgementRepository()) {
        this.ackRepo = repo;
    }
    async acknowledge(id, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            // Find the employee profile associated with the user
            const employee = await tx.employee.findFirst({
                where: { userId: callerUserId, deletedAt: null },
            });
            if (!employee) {
                throw AppError_1.AppError.forbidden("A user must have an active employee profile to acknowledge policies.");
            }
            const ack = await this.ackRepo.findById(id, tx);
            if (!ack) {
                throw AppError_1.AppError.notFound(`Policy acknowledgement record with ID ${id} not found.`);
            }
            if (ack.employeeId !== employee.id) {
                throw AppError_1.AppError.forbidden("You are not authorized to acknowledge this policy on behalf of another employee.");
            }
            if (ack.status === "ACKNOWLEDGED") {
                return ack;
            }
            const oldState = { ...ack };
            const updated = await this.ackRepo.acknowledge(id, employee.id, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "ACKNOWLEDGE",
                entity: "PolicyAcknowledgement",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    async findById(id) {
        const ack = await this.ackRepo.findById(id);
        if (!ack) {
            throw AppError_1.AppError.notFound(`Acknowledgement record with ID ${id} not found.`);
        }
        return ack;
    }
    async findByEmployeeId(employeeId) {
        return this.ackRepo.findByEmployeeId(employeeId);
    }
    async findByPolicyId(policyId) {
        return this.ackRepo.findByPolicyId(policyId);
    }
    async findPendingByEmployeeId(employeeId) {
        return this.ackRepo.findPendingByEmployeeId(employeeId);
    }
    async findAll() {
        return this.ackRepo.findAll();
    }
}
exports.PolicyAcknowledgementService = PolicyAcknowledgementService;
