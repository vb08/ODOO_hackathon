"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardRepository = void 0;
const db_1 = require("../database/db");
class RewardRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).reward.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).reward.findFirst({
            where: { id, deletedAt: null },
            include: {
                redemptions: {
                    where: { deletedAt: null },
                    include: {
                        employee: true,
                    },
                },
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).reward.findMany({
            where: { deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).reward.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).reward.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.RewardRepository = RewardRepository;
