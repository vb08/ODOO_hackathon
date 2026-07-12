import { Prisma, EnvironmentalGoal } from "@prisma/client";

/**
 * Interface contract for EnvironmentalGoal Repository (SOLID).
 */
export interface IEnvironmentalGoalRepository {
  create(data: Prisma.EnvironmentalGoalUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal[]>;
  findByDepartmentAndYear(departmentId: string, year: number, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal | null>;
  findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal[]>;
  update(id: string, data: Prisma.EnvironmentalGoalUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal>;
}
