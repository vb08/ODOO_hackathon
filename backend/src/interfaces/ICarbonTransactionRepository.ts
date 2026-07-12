import { Prisma, CarbonTransaction } from "@prisma/client";

/**
 * Interface contract for CarbonTransaction Repository (SOLID).
 */
export interface ICarbonTransactionRepository {
  create(data: Prisma.CarbonTransactionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<CarbonTransaction>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<CarbonTransaction | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<CarbonTransaction[]>;
  findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<CarbonTransaction[]>;
  update(id: string, data: Prisma.CarbonTransactionUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<CarbonTransaction>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<CarbonTransaction>;

  // Analytics & Aggregations
  getTotalApprovedEmissions(tx?: Prisma.TransactionClient): Promise<number>;
  getDepartmentApprovedEmissions(tx?: Prisma.TransactionClient): Promise<{ departmentId: string; departmentName: string; emissions: number }[]>;
  getMonthlyApprovedEmissions(year: number, tx?: Prisma.TransactionClient): Promise<{ month: number; emissions: number }[]>;
  getMonthlyApprovedEmissionsBySource(year: number, tx?: Prisma.TransactionClient): Promise<{ month: number; sourceType: string; emissions: number }[]>;
}
