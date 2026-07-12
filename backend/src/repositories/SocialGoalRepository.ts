import { Prisma, SocialGoal } from "@prisma/client";
import { ISocialGoalRepository } from "../interfaces/ISocialGoalRepository";
import { prisma } from "../database/db";

export class SocialGoalRepository implements ISocialGoalRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.SocialGoalUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<SocialGoal> {
    return this.getClient(tx).socialGoal.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<SocialGoal | null> {
    return this.getClient(tx).socialGoal.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
      },
    });
  }

  public async findByDepartmentAndYear(departmentId: string | null, year: number, tx?: Prisma.TransactionClient): Promise<SocialGoal | null> {
    return this.getClient(tx).socialGoal.findFirst({
      where: { departmentId, year, deletedAt: null },
      include: {
        department: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<SocialGoal[]> {
    return this.getClient(tx).socialGoal.findMany({
      where: { deletedAt: null },
      include: {
        department: true,
      },
    });
  }

  public async findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<SocialGoal[]> {
    return this.getClient(tx).socialGoal.findMany({
      where: { departmentId, deletedAt: null },
      include: {
        department: true,
      },
    });
  }

  public async update(id: string, data: Prisma.SocialGoalUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<SocialGoal> {
    return this.getClient(tx).socialGoal.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<SocialGoal> {
    return this.getClient(tx).socialGoal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
