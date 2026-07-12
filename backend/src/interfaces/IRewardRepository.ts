import { Prisma, Reward } from "@prisma/client";

export interface IRewardRepository {
  create(data: Prisma.RewardUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Reward>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Reward | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Reward[]>;
  update(id: string, data: Prisma.RewardUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Reward>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Reward>;
}
