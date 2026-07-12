"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESGPolicyRepository = void 0;
const db_1 = require("../database/db");
class ESGPolicyRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).eSGPolicy.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).eSGPolicy.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findByCode(code, tx) {
        return this.getClient(tx).eSGPolicy.findFirst({
            where: { code, deletedAt: null },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).eSGPolicy.findMany({
            where: { deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).eSGPolicy.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).eSGPolicy.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.ESGPolicyRepository = ESGPolicyRepository;
