import { Prisma, Department } from "@prisma/client";

/**
 * Interface contract for Department Repository (SOLID).
 */
export interface IDepartmentRepository {
  create(data: Prisma.DepartmentCreateInput, tx?: Prisma.TransactionClient): Promise<Department>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Department | null>;
  findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Department | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Department[]>;
  update(id: string, data: Prisma.DepartmentUpdateInput, tx?: Prisma.TransactionClient): Promise<Department>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Department>;
}
