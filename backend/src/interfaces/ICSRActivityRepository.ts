import { Prisma, CSRActivity } from "@prisma/client";

export interface ICSRActivityRepository {
  create(data: Prisma.CSRActivityUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<CSRActivity>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<CSRActivity | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<CSRActivity[]>;
  update(id: string, data: Prisma.CSRActivityUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<CSRActivity>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<CSRActivity>;
}
