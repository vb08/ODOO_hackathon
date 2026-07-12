"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRepository = void 0;
const db_1 = require("../database/db");
/**
 * Employee Repository Implementation.
 * Manages Employee master records and soft delete triggers.
 */
class EmployeeRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).employee.create({
            data,
            include: { department: true, user: true },
        });
    }
    async findById(id, tx) {
        return this.getClient(tx).employee.findFirst({
            where: { id, deletedAt: null },
            include: { department: true, user: true },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).employee.findFirst({
            where: { employeeId, deletedAt: null },
            include: { department: true, user: true },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).employee.findMany({
            where: { deletedAt: null },
            include: { department: true, user: true },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).employee.update({
            where: { id },
            data,
            include: { department: true, user: true },
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).employee.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.EmployeeRepository = EmployeeRepository;
