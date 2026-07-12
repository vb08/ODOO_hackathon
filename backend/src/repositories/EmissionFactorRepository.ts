import { Prisma, EmissionFactor } from "@prisma/client";
import { IEmissionFactorRepository } from "../interfaces/IEmissionFactorRepository";
import { prisma } from "../database/db";

/**
 * EmissionFactor Repository Implementation.
 */
export class EmissionFactorRepository implements IEmissionFactorRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.EmissionFactorCreateInput, tx?: Prisma.TransactionClient): Promise<EmissionFactor> {
    return this.getClient(tx).emissionFactor.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor | null> {
    return this.getClient(tx).emissionFactor.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByName(name: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor | null> {
    return this.getClient(tx).emissionFactor.findFirst({
      where: { name, deletedAt: null },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<EmissionFactor[]> {
    return this.getClient(tx).emissionFactor.findMany({
      where: { deletedAt: null },
    });
  }

  public async findBySourceType(sourceType: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor[]> {
    return this.getClient(tx).emissionFactor.findMany({
      where: { sourceType, deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.EmissionFactorUpdateInput, tx?: Prisma.TransactionClient): Promise<EmissionFactor> {
    return this.getClient(tx).emissionFactor.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor> {
    return this.getClient(tx).emissionFactor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
