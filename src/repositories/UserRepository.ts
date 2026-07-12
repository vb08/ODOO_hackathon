import { Prisma, User } from "@prisma/client";
import { IUserRepository } from "../interfaces/IUserRepository";
import { prisma } from "../database/db";

/**
 * User Repository Implementation.
 * Encapsulates user queries, authentication relations, and soft deletes.
 */
export class UserRepository implements IUserRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient): Promise<User> {
    return this.getClient(tx).user.create({
      data,
      include: { role: true },
    });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, employee: true },
    });
  }

  public async findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    return this.getClient(tx).user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true, employee: true },
    });
  }

  public async update(id: string, data: Prisma.UserUpdateInput, tx?: Prisma.TransactionClient): Promise<User> {
    return this.getClient(tx).user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<User> {
    return this.getClient(tx).user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
