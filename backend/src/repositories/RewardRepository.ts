import { Prisma, Reward } from "@prisma/client";
import { IRewardRepository } from "../interfaces/IRewardRepository";
import { prisma } from "../database/db";

export class RewardRepository implements IRewardRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.RewardUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Reward> {
    return this.getClient(tx).reward.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Reward | null> {
    return this.getClient(tx).reward.findFirst({
      where: { id, deletedAt: null },
      include: {
        redemptions: {
          where: { deletedAt: null },
          include: {
            employee: true,
          },
        },
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Reward[]> {
    return this.getClient(tx).reward.findMany({
      where: { deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.RewardUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Reward> {
    return this.getClient(tx).reward.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Reward> {
    return this.getClient(tx).reward.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
