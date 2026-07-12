"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeRepository = void 0;
const db_1 = require("../database/db");
class ChallengeRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).challenge.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).challenge.findFirst({
            where: { id, deletedAt: null },
            include: {
                participations: {
                    where: { deletedAt: null },
                    include: {
                        employee: true,
                    },
                },
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).challenge.findMany({
            where: { deletedAt: null },
            include: {
                participations: {
                    where: { deletedAt: null },
                },
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).challenge.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).challenge.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.ChallengeRepository = ChallengeRepository;
