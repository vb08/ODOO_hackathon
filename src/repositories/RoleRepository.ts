import { Prisma, Role } from "@prisma/client";
import { IRoleRepository } from "../interfaces/IRoleRepository";
import { prisma } from "../database/db";

/**
 * Role Repository Implementation.
 * Encapsulates role database queries, incorporating soft delete filtration.
 */
export class RoleRepository implements IRoleRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.RoleCreateInput, tx?: Prisma.TransactionClient): Promise<Role> {
    return this.getClient(tx).role.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Role | null> {
    return this.getClient(tx).role.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Role | null> {
    return this.getClient(tx).role.findFirst({
      where: { code, deletedAt: null },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Role[]> {
    return this.getClient(tx).role.findMany({
      where: { deletedAt: null },
    });
  }
}
