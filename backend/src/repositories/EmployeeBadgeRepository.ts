import { Prisma, EmployeeBadge } from "@prisma/client";
import { IEmployeeBadgeRepository } from "../interfaces/IEmployeeBadgeRepository";
import { prisma } from "../database/db";

export class EmployeeBadgeRepository implements IEmployeeBadgeRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.EmployeeBadgeUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<EmployeeBadge> {
    return this.getClient(tx).employeeBadge.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge | null> {
    return this.getClient(tx).employeeBadge.findFirst({
      where: { id, deletedAt: null },
      include: {
        badge: true,
        employee: true,
      },
    });
  }

  public async findByEmployeeAndBadge(employeeId: string, badgeId: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge | null> {
    return this.getClient(tx).employeeBadge.findFirst({
      where: { employeeId, badgeId, deletedAt: null },
      include: {
        badge: true,
        employee: true,
      },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge[]> {
    return this.getClient(tx).employeeBadge.findMany({
      where: { employeeId, deletedAt: null },
      include: {
        badge: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<EmployeeBadge[]> {
    return this.getClient(tx).employeeBadge.findMany({
      where: { deletedAt: null },
      include: {
        badge: true,
        employee: true,
      },
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge> {
    return this.getClient(tx).employeeBadge.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
