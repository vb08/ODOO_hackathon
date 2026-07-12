"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceIssueRepository = void 0;
const db_1 = require("../database/db");
class ComplianceIssueRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).complianceIssue.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).complianceIssue.findFirst({
            where: { id, deletedAt: null },
            include: {
                owner: true,
                audit: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).complianceIssue.findMany({
            where: { deletedAt: null },
            include: {
                owner: true,
                audit: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    async findByOwnerId(ownerId, tx) {
        return this.getClient(tx).complianceIssue.findMany({
            where: { ownerId, deletedAt: null },
            include: {
                owner: true,
                audit: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    async findByAuditId(auditId, tx) {
        return this.getClient(tx).complianceIssue.findMany({
            where: { auditId, deletedAt: null },
            include: {
                owner: true,
                audit: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    async findByDepartmentId(departmentId, tx) {
        return this.getClient(tx).complianceIssue.findMany({
            where: {
                deletedAt: null,
                audit: {
                    departmentId,
                },
            },
            include: {
                owner: true,
                audit: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).complianceIssue.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).complianceIssue.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
    async getOverdueIssues(tx) {
        return this.getClient(tx).complianceIssue.findMany({
            where: {
                status: { notIn: ["RESOLVED", "CLOSED"] },
                dueDate: { lt: new Date() },
                deletedAt: null,
            },
            include: {
                owner: true,
                audit: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
}
exports.ComplianceIssueRepository = ComplianceIssueRepository;
