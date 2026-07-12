import { Prisma, RewardRedemption } from "@prisma/client";

export interface IRewardRedemptionRepository {
  create(data: Prisma.RewardRedemptionUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<RewardRedemption>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<RewardRedemption | null>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<RewardRedemption[]>;
  findAll(tx?: Prisma.TransactionClient): Promise<RewardRedemption[]>;
  update(id: string, data: Prisma.RewardRedemptionUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<RewardRedemption>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<RewardRedemption>;
}
