import { Prisma, Badge } from "@prisma/client";
import { IBadgeRepository } from "../interfaces/IBadgeRepository";
import { prisma } from "../database/db";

export class BadgeRepository implements IBadgeRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.BadgeUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Badge> {
    return this.getClient(tx).badge.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Badge | null> {
    return this.getClient(tx).badge.findFirst({
      where: { id, deletedAt: null },
      include: {
        employeeBadges: {
          where: { deletedAt: null },
          include: {
            employee: true,
          },
        },
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Badge[]> {
    return this.getClient(tx).badge.findMany({
      where: { deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.BadgeUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Badge> {
    return this.getClient(tx).badge.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Badge> {
    return this.getClient(tx).badge.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
