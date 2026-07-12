import { Prisma, RewardRedemption } from "@prisma/client";
import { IRewardRedemptionRepository } from "../interfaces/IRewardRedemptionRepository";
import { prisma } from "../database/db";

export class RewardRedemptionRepository implements IRewardRedemptionRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.RewardRedemptionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<RewardRedemption> {
    return this.getClient(tx).rewardRedemption.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<RewardRedemption | null> {
    return this.getClient(tx).rewardRedemption.findFirst({
      where: { id, deletedAt: null },
      include: {
        reward: true,
        employee: true,
      },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<RewardRedemption[]> {
    return this.getClient(tx).rewardRedemption.findMany({
      where: { employeeId, deletedAt: null },
      include: {
        reward: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<RewardRedemption[]> {
    return this.getClient(tx).rewardRedemption.findMany({
      where: { deletedAt: null },
      include: {
        reward: true,
        employee: true,
      },
    });
  }

  public async update(id: string, data: Prisma.RewardRedemptionUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<RewardRedemption> {
    return this.getClient(tx).rewardRedemption.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<RewardRedemption> {
    return this.getClient(tx).rewardRedemption.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
