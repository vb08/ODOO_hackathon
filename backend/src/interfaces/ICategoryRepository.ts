import { Prisma, Category } from "@prisma/client";

/**
 * Interface contract for Category Repository (SOLID).
 */
export interface ICategoryRepository {
  create(data: Prisma.CategoryCreateInput, tx?: Prisma.TransactionClient): Promise<Category>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Category | null>;
  findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Category | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Category[]>;
  update(id: string, data: Prisma.CategoryUpdateInput, tx?: Prisma.TransactionClient): Promise<Category>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Category>;
}
