"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRActivityRepository = void 0;
const db_1 = require("../database/db");
class CSRActivityRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).cSRActivity.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).cSRActivity.findFirst({
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
        return this.getClient(tx).cSRActivity.findMany({
            where: { deletedAt: null },
            include: {
                participations: {
                    where: { deletedAt: null },
                },
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).cSRActivity.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).cSRActivity.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.CSRActivityRepository = CSRActivityRepository;
