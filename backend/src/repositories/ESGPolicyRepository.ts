import { Prisma, ESGPolicy } from "@prisma/client";
import { IESGPolicyRepository } from "../interfaces/IESGPolicyRepository";
import { prisma } from "../database/db";

export class ESGPolicyRepository implements IESGPolicyRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.ESGPolicyUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ESGPolicy> {
    return this.getClient(tx).eSGPolicy.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<ESGPolicy | null> {
    return this.getClient(tx).eSGPolicy.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByCode(code: string, tx?: Prisma.TransactionClient): Promise<ESGPolicy | null> {
    return this.getClient(tx).eSGPolicy.findFirst({
      where: { code, deletedAt: null },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<ESGPolicy[]> {
    return this.getClient(tx).eSGPolicy.findMany({
      where: { deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.ESGPolicyUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<ESGPolicy> {
    return this.getClient(tx).eSGPolicy.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<ESGPolicy> {
    return this.getClient(tx).eSGPolicy.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
