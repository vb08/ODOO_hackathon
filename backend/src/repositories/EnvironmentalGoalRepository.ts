import { Prisma, EnvironmentalGoal } from "@prisma/client";
import { IEnvironmentalGoalRepository } from "../interfaces/IEnvironmentalGoalRepository";
import { prisma } from "../database/db";

/**
 * EnvironmentalGoal Repository Implementation.
 */
export class EnvironmentalGoalRepository implements IEnvironmentalGoalRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.EnvironmentalGoalUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal> {
    return this.getClient(tx).environmentalGoal.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal | null> {
    return this.getClient(tx).environmentalGoal.findFirst({
      where: { id, deletedAt: null },
      include: { department: true },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal[]> {
    return this.getClient(tx).environmentalGoal.findMany({
      where: { deletedAt: null },
      include: { department: true },
    });
  }

  public async findByDepartmentAndYear(departmentId: string, year: number, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal | null> {
    return this.getClient(tx).environmentalGoal.findFirst({
      where: { departmentId, year, deletedAt: null },
      include: { department: true },
    });
  }

  public async findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal[]> {
    return this.getClient(tx).environmentalGoal.findMany({
      where: { departmentId, deletedAt: null },
      include: { department: true },
    });
  }

  public async update(id: string, data: Prisma.EnvironmentalGoalUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal> {
    return this.getClient(tx).environmentalGoal.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<EnvironmentalGoal> {
    return this.getClient(tx).environmentalGoal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
