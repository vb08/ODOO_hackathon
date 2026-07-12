"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_1 = require("../database/db");
/**
 * User Repository Implementation.
 * Encapsulates user queries, authentication relations, and soft deletes.
 */
class UserRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).user.create({
            data,
            include: { role: true },
        });
    }
    async findById(id, tx) {
        return this.getClient(tx).user.findFirst({
            where: { id, deletedAt: null },
            include: { role: true, employee: true },
        });
    }
    async findByEmail(email, tx) {
        return this.getClient(tx).user.findFirst({
            where: { email, deletedAt: null },
            include: { role: true, employee: true },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).user.update({
            where: { id },
            data,
            include: { role: true },
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.UserRepository = UserRepository;
