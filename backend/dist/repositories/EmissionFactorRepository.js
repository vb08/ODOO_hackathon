"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmissionFactorRepository = void 0;
const db_1 = require("../database/db");
/**
 * EmissionFactor Repository Implementation.
 */
class EmissionFactorRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).emissionFactor.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).emissionFactor.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findByName(name, tx) {
        return this.getClient(tx).emissionFactor.findFirst({
            where: { name, deletedAt: null },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).emissionFactor.findMany({
            where: { deletedAt: null },
        });
    }
    async findBySourceType(sourceType, tx) {
        return this.getClient(tx).emissionFactor.findMany({
            where: { sourceType, deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).emissionFactor.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).emissionFactor.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.EmissionFactorRepository = EmissionFactorRepository;
