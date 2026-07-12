"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const db_1 = require("../database/db");
/**
 * Department Repository Implementation.
 * Encapsulates department CRUD and soft delete mechanics.
 */
class DepartmentRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).department.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).department.findFirst({
            where: { id, deletedAt: null },
            include: {
                manager: true,
                employees: {
                    where: { deletedAt: null },
                },
            },
        });
    }
    async findByCode(code, tx) {
        return this.getClient(tx).department.findFirst({
            where: { code, deletedAt: null },
            include: { manager: true },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).department.findMany({
            where: { deletedAt: null },
            include: { manager: true },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).department.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).department.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.DepartmentRepository = DepartmentRepository;
