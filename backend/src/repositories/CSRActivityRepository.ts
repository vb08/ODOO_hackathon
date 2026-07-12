import { Prisma, CSRActivity } from "@prisma/client";
import { ICSRActivityRepository } from "../interfaces/ICSRActivityRepository";
import { prisma } from "../database/db";

export class CSRActivityRepository implements ICSRActivityRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.CSRActivityUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<CSRActivity> {
    return this.getClient(tx).cSRActivity.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<CSRActivity | null> {
    return this.getClient(tx).cSRActivity.findFirst({
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

  public async findAll(tx?: Prisma.TransactionClient): Promise<CSRActivity[]> {
    return this.getClient(tx).cSRActivity.findMany({
      where: { deletedAt: null },
      include: {
        participations: {
          where: { deletedAt: null },
        },
      },
    });
  }

  public async update(id: string, data: Prisma.CSRActivityUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<CSRActivity> {
    return this.getClient(tx).cSRActivity.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<CSRActivity> {
    return this.getClient(tx).cSRActivity.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
