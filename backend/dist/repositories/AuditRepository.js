"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const db_1 = require("../database/db");
class AuditRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).audit.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).audit.findFirst({
            where: { id, deletedAt: null },
            include: {
                department: true,
                checklists: {
                    where: { deletedAt: null },
                },
                complianceIssues: {
                    where: { deletedAt: null },
                },
            },
        });
    }
    async findByCode(code, tx) {
        return this.getClient(tx).audit.findFirst({
            where: { code, deletedAt: null },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).audit.findMany({
            where: { deletedAt: null },
            include: {
                department: true,
                checklists: {
                    where: { deletedAt: null },
                },
            },
        });
    }
    async findByDepartmentId(departmentId, tx) {
        return this.getClient(tx).audit.findMany({
            where: { departmentId, deletedAt: null },
            include: {
                department: true,
                checklists: {
                    where: { deletedAt: null },
                },
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).audit.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).audit.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.AuditRepository = AuditRepository;
