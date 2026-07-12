import { Prisma, Department } from "@prisma/client";
import { IDepartmentRepository } from "../interfaces/IDepartmentRepository";
import { prisma } from "../database/db";

/**
 * Department Repository Implementation.
 * Encapsulates department CRUD and soft delete mechanics.
 */
export class DepartmentRepository implements IDepartmentRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.DepartmentCreateInput, tx?: Prisma.TransactionClient): Promise<Department> {
    return this.getClient(tx).department.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Department | null> {
    return this.getClient(tx).department.findFirst({
      where: { id, deletedAt: null },
      include: {
        manager: true,
        employees: {
          where: { deletedAt: null },
        },
      },
    });
  }

  public async findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Department | null> {
    return this.getClient(tx).department.findFirst({
      where: { code, deletedAt: null },
      include: { manager: true },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Department[]> {
    return this.getClient(tx).department.findMany({
      where: { deletedAt: null },
      include: { manager: true },
    });
  }

  public async update(id: string, data: Prisma.DepartmentUpdateInput, tx?: Prisma.TransactionClient): Promise<Department> {
    return this.getClient(tx).department.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Department> {
    return this.getClient(tx).department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
