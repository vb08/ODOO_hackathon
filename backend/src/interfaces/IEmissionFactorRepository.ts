import { Prisma, EmissionFactor } from "@prisma/client";

/**
 * Interface contract for EmissionFactor Repository (SOLID).
 */
export interface IEmissionFactorRepository {
  create(data: Prisma.EmissionFactorCreateInput, tx?: Prisma.TransactionClient): Promise<EmissionFactor>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor | null>;
  findByName(name: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<EmissionFactor[]>;
  findBySourceType(sourceType: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor[]>;
  update(id: string, data: Prisma.EmissionFactorUpdateInput, tx?: Prisma.TransactionClient): Promise<EmissionFactor>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<EmissionFactor>;
}
