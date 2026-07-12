import { Prisma, Challenge } from "@prisma/client";
import { IChallengeRepository } from "../interfaces/IChallengeRepository";
import { prisma } from "../database/db";

export class ChallengeRepository implements IChallengeRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.ChallengeUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Challenge> {
    return this.getClient(tx).challenge.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Challenge | null> {
    return this.getClient(tx).challenge.findFirst({
      where: { id, deletedAt: null },
      include: {
        participations: {
          where: { deletedAt: null },
          include: {
            employee: true,
          },
        },
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Challenge[]> {
    return this.getClient(tx).challenge.findMany({
      where: { deletedAt: null },
      include: {
        participations: {
          where: { deletedAt: null },
        },
      },
    });
  }

  public async update(id: string, data: Prisma.ChallengeUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Challenge> {
    return this.getClient(tx).challenge.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Challenge> {
    return this.getClient(tx).challenge.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
