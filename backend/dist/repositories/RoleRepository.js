"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const db_1 = require("../database/db");
/**
 * Role Repository Implementation.
 * Encapsulates role database queries, incorporating soft delete filtration.
 */
class RoleRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).role.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).role.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findByCode(code, tx) {
        return this.getClient(tx).role.findFirst({
            where: { code, deletedAt: null },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).role.findMany({
            where: { deletedAt: null },
        });
    }
}
exports.RoleRepository = RoleRepository;
