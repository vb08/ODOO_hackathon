"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyAcknowledgementRepository = void 0;
const db_1 = require("../database/db");
class PolicyAcknowledgementRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async createMany(data, tx) {
        return this.getClient(tx).policyAcknowledgement.createMany({ data, skipDuplicates: true });
    }
    async findById(id, tx) {
        return this.getClient(tx).policyAcknowledgement.findFirst({
            where: { id, deletedAt: null },
            include: {
                policy: true,
                employee: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).policyAcknowledgement.findMany({
            where: { deletedAt: null },
            include: {
                policy: true,
                employee: true,
            },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).policyAcknowledgement.findMany({
            where: { employeeId, deletedAt: null },
            include: {
                policy: true,
                employee: true,
            },
        });
    }
    async findByPolicyId(policyId, tx) {
        return this.getClient(tx).policyAcknowledgement.findMany({
            where: { policyId, deletedAt: null },
            include: {
                policy: true,
                employee: true,
            },
        });
    }
    async findPendingByEmployeeId(employeeId, tx) {
        return this.getClient(tx).policyAcknowledgement.findMany({
            where: { employeeId, status: "PENDING", deletedAt: null },
            include: {
                policy: true,
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).policyAcknowledgement.update({
            where: { id },
            data,
        });
    }
    async acknowledge(id, employeeId, tx) {
        return this.getClient(tx).policyAcknowledgement.update({
            where: { id, employeeId },
            data: {
                status: "ACKNOWLEDGED",
                acknowledgedAt: new Date(),
            },
        });
    }
}
exports.PolicyAcknowledgementRepository = PolicyAcknowledgementRepository;
