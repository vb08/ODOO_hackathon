"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const db_1 = require("../database/db");
/**
 * Category Repository Implementation.
 * Manages ESG metrics categorization data.
 */
class CategoryRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).category.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).category.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findByCode(code, tx) {
        return this.getClient(tx).category.findFirst({
            where: { code, deletedAt: null },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).category.findMany({
            where: { deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).category.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).category.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.CategoryRepository = CategoryRepository;
