"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardRedemptionRepository = void 0;
const db_1 = require("../database/db");
class RewardRedemptionRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).rewardRedemption.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).rewardRedemption.findFirst({
            where: { id, deletedAt: null },
            include: {
                reward: true,
                employee: true,
            },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).rewardRedemption.findMany({
            where: { employeeId, deletedAt: null },
            include: {
                reward: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).rewardRedemption.findMany({
            where: { deletedAt: null },
            include: {
                reward: true,
                employee: true,
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).rewardRedemption.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).rewardRedemption.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.RewardRedemptionRepository = RewardRedemptionRepository;
