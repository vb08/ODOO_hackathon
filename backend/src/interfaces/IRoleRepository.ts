import { Prisma, Role } from "@prisma/client";

/**
 * Interface contract for Role Repository (SOLID).
 */
export interface IRoleRepository {
  create(data: Prisma.RoleCreateInput, tx?: Prisma.TransactionClient): Promise<Role>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Role | null>;
  findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Role | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Role[]>;
}
