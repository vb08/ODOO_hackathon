import { Prisma, ESGPolicy } from "@prisma/client";

export interface IESGPolicyRepository {
  create(data: Prisma.ESGPolicyUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ESGPolicy>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<ESGPolicy | null>;
  findByCode(code: string, tx?: Prisma.TransactionClient): Promise<ESGPolicy | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<ESGPolicy[]>;
  update(id: string, data: Prisma.ESGPolicyUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<ESGPolicy>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<ESGPolicy>;
}
