"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeBadgeRepository = void 0;
const db_1 = require("../database/db");
class EmployeeBadgeRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).employeeBadge.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).employeeBadge.findFirst({
            where: { id, deletedAt: null },
            include: {
                badge: true,
                employee: true,
            },
        });
    }
    async findByEmployeeAndBadge(employeeId, badgeId, tx) {
        return this.getClient(tx).employeeBadge.findFirst({
            where: { employeeId, badgeId, deletedAt: null },
            include: {
                badge: true,
                employee: true,
            },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).employeeBadge.findMany({
            where: { employeeId, deletedAt: null },
            include: {
                badge: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).employeeBadge.findMany({
            where: { deletedAt: null },
            include: {
                badge: true,
                employee: true,
            },
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).employeeBadge.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.EmployeeBadgeRepository = EmployeeBadgeRepository;
