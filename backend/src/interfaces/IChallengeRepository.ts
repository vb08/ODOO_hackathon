import { Prisma, Challenge } from "@prisma/client";

export interface IChallengeRepository {
  create(data: Prisma.ChallengeUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Challenge>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Challenge | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Challenge[]>;
  update(id: string, data: Prisma.ChallengeUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Challenge>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Challenge>;
}
