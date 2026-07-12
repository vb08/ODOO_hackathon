"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeRepository = void 0;
const db_1 = require("../database/db");
class BadgeRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).badge.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).badge.findFirst({
            where: { id, deletedAt: null },
            include: {
                employeeBadges: {
                    where: { deletedAt: null },
                    include: {
                        employee: true,
                    },
                },
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).badge.findMany({
            where: { deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).badge.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).badge.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.BadgeRepository = BadgeRepository;
