import { Prisma, CarbonTransaction } from "@prisma/client";
import { ICarbonTransactionRepository } from "../interfaces/ICarbonTransactionRepository";
import { prisma } from "../database/db";

/**
 * CarbonTransaction Repository Implementation.
 */
export class CarbonTransactionRepository implements ICarbonTransactionRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.CarbonTransactionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<CarbonTransaction> {
    return this.getClient(tx).carbonTransaction.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<CarbonTransaction | null> {
    return this.getClient(tx).carbonTransaction.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
        emissionFactor: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<CarbonTransaction[]> {
    return this.getClient(tx).carbonTransaction.findMany({
      where: { deletedAt: null },
      include: {
        department: true,
        emissionFactor: true,
      },
    });
  }

  public async findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<CarbonTransaction[]> {
    return this.getClient(tx).carbonTransaction.findMany({
      where: { departmentId, deletedAt: null },
      include: {
        department: true,
        emissionFactor: true,
      },
    });
  }

  public async update(id: string, data: Prisma.CarbonTransactionUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<CarbonTransaction> {
    return this.getClient(tx).carbonTransaction.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<CarbonTransaction> {
    return this.getClient(tx).carbonTransaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }

  // Analytics & Aggregations
  public async getTotalApprovedEmissions(tx?: Prisma.TransactionClient): Promise<number> {
    const result = await this.getClient(tx).carbonTransaction.aggregate({
      where: { status: "APPROVED", deletedAt: null },
      _sum: { emissions: true },
    });
    return result._sum.emissions || 0;
  }

  public async getDepartmentApprovedEmissions(tx?: Prisma.TransactionClient): Promise<{ departmentId: string; departmentName: string; emissions: number }[]> {
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

  public async getMonthlyApprovedEmissions(year: number, tx?: Prisma.TransactionClient): Promise<{ month: number; emissions: number }[]> {
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

    const monthlySums: { [key: number]: number } = {};
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

  public async getMonthlyApprovedEmissionsBySource(year: number, tx?: Prisma.TransactionClient): Promise<{ month: number; sourceType: string; emissions: number }[]> {
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

    const groups: { [key: string]: { month: number; sourceType: string; emissions: number } } = {};

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
