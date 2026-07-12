"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentalGoalRepository = void 0;
const db_1 = require("../database/db");
/**
 * EnvironmentalGoal Repository Implementation.
 */
class EnvironmentalGoalRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).environmentalGoal.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).environmentalGoal.findFirst({
            where: { id, deletedAt: null },
            include: { department: true },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).environmentalGoal.findMany({
            where: { deletedAt: null },
            include: { department: true },
        });
    }
    async findByDepartmentAndYear(departmentId, year, tx) {
        return this.getClient(tx).environmentalGoal.findFirst({
            where: { departmentId, year, deletedAt: null },
            include: { department: true },
        });
    }
    async findByDepartmentId(departmentId, tx) {
        return this.getClient(tx).environmentalGoal.findMany({
            where: { departmentId, deletedAt: null },
            include: { department: true },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).environmentalGoal.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).environmentalGoal.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.EnvironmentalGoalRepository = EnvironmentalGoalRepository;
