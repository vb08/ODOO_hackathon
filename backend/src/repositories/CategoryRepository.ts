import { Prisma, Category } from "@prisma/client";
import { ICategoryRepository } from "../interfaces/ICategoryRepository";
import { prisma } from "../database/db";

/**
 * Category Repository Implementation.
 * Manages ESG metrics categorization data.
 */
export class CategoryRepository implements ICategoryRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.CategoryCreateInput, tx?: Prisma.TransactionClient): Promise<Category> {
    return this.getClient(tx).category.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Category | null> {
    return this.getClient(tx).category.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Category | null> {
    return this.getClient(tx).category.findFirst({
      where: { code, deletedAt: null },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Category[]> {
    return this.getClient(tx).category.findMany({
      where: { deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.CategoryUpdateInput, tx?: Prisma.TransactionClient): Promise<Category> {
    return this.getClient(tx).category.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Category> {
    return this.getClient(tx).category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
