"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditChecklistRepository = void 0;
const db_1 = require("../database/db");
class AuditChecklistRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).auditChecklist.create({ data });
    }
    async createMany(data, tx) {
        return this.getClient(tx).auditChecklist.createMany({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).auditChecklist.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findByAuditId(auditId, tx) {
        return this.getClient(tx).auditChecklist.findMany({
            where: { auditId, deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).auditChecklist.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).auditChecklist.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.AuditChecklistRepository = AuditChecklistRepository;
