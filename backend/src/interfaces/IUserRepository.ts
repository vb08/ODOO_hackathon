import { Prisma, User } from "@prisma/client";

/**
 * Interface contract for User Repository (SOLID).
 */
export interface IUserRepository {
  create(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient): Promise<User>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<User | null>;
  findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null>;
  update(id: string, data: Prisma.UserUpdateInput, tx?: Prisma.TransactionClient): Promise<User>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<User>;
}
