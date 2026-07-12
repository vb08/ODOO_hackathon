"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialGoalRepository = void 0;
const db_1 = require("../database/db");
class SocialGoalRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).socialGoal.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).socialGoal.findFirst({
            where: { id, deletedAt: null },
            include: {
                department: true,
            },
        });
    }
    async findByDepartmentAndYear(departmentId, year, tx) {
        return this.getClient(tx).socialGoal.findFirst({
            where: { departmentId, year, deletedAt: null },
            include: {
                department: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).socialGoal.findMany({
            where: { deletedAt: null },
            include: {
                department: true,
            },
        });
    }
    async findByDepartmentId(departmentId, tx) {
        return this.getClient(tx).socialGoal.findMany({
            where: { departmentId, deletedAt: null },
            include: {
                department: true,
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).socialGoal.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).socialGoal.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.SocialGoalRepository = SocialGoalRepository;
