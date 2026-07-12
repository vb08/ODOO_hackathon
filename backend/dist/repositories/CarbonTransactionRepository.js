"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonTransactionRepository = void 0;
const db_1 = require("../database/db");
/**
 * CarbonTransaction Repository Implementation.
 */
class CarbonTransactionRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).carbonTransaction.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).carbonTransaction.findFirst({
            where: { id, deletedAt: null },
            include: {
                department: true,
                emissionFactor: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).carbonTransaction.findMany({
            where: { deletedAt: null },
            include: {
                department: true,
                emissionFactor: true,
            },
        });
    }
    async findByDepartmentId(departmentId, tx) {
        return this.getClient(tx).carbonTransaction.findMany({
            where: { departmentId, deletedAt: null },
            include: {
                department: true,
                emissionFactor: true,
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).carbonTransaction.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).carbonTransaction.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
    // Analytics & Aggregations
    async getTotalApprovedEmissions(tx) {
        const result = await this.getClient(tx).carbonTransaction.aggregate({
            where: { status: "APPROVED", deletedAt: null },
            _sum: { emissions: true },
        });
        return result._sum.emissions || 0;
    }
    async getDepartmentApprovedEmissions(tx) {
        const result = await this.getClient(tx).carbonTransaction.groupBy({
            by: ["departmentId"],
            where: { status: "APPROVED", deletedAt: null },
            _sum: { emissions: true },
        });
        const departments = await this.getClient(tx).department.findMany({
            where: { deletedAt: null },
        });
        return departments.map((d) => {
            const match = result.find((r) => r.departmentId === d.id);
            return {
                departmentId: d.id,
                departmentName: d.name,
                emissions: match?._sum.emissions || 0,
            };
        });
    }
    async getMonthlyApprovedEmissions(year, tx) {
        const transactions = await this.getClient(tx).carbonTransaction.findMany({
            where: {
                status: "APPROVED",
                deletedAt: null,
                transactionDate: {
                    gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    lte: new Date(`${year}-12-31T23:59:59.999Z`),
                },
            },
        });
        const monthlySums = {};
        for (let i = 1; i <= 12; i++) {
            monthlySums[i] = 0;
        }
        transactions.forEach((t) => {
            const month = new Date(t.transactionDate).getUTCMonth() + 1;
            monthlySums[month] += t.emissions;
        });
        return Object.keys(monthlySums).map((m) => ({
            month: parseInt(m),
            emissions: monthlySums[parseInt(m)],
        }));
    }
    async getMonthlyApprovedEmissionsBySource(year, tx) {
        const transactions = await this.getClient(tx).carbonTransaction.findMany({
            where: {
                status: "APPROVED",
                deletedAt: null,
                transactionDate: {
                    gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    lte: new Date(`${year}-12-31T23:59:59.999Z`),
                },
            },
            include: {
                emissionFactor: true,
            },
        });
        const groups = {};
        transactions.forEach((t) => {
            const month = new Date(t.transactionDate).getUTCMonth() + 1;
            const sourceType = t.emissionFactor.sourceType;
            const key = `${month}-${sourceType}`;
            if (!groups[key]) {
                groups[key] = { month, sourceType, emissions: 0 };
            }
            groups[key].emissions += t.emissions;
        });
        return Object.values(groups);
    }
}
exports.CarbonTransactionRepository = CarbonTransactionRepository;
