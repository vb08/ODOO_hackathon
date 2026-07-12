import { Prisma, Employee } from "@prisma/client";
import { IEmployeeRepository } from "../interfaces/IEmployeeRepository";
import { prisma } from "../database/db";

/**
 * Employee Repository Implementation.
 * Manages Employee master records and soft delete triggers.
 */
export class EmployeeRepository implements IEmployeeRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.EmployeeCreateInput, tx?: Prisma.TransactionClient): Promise<Employee> {
    return this.getClient(tx).employee.create({
      data,
      include: { department: true, user: true },
    });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Employee | null> {
    return this.getClient(tx).employee.findFirst({
      where: { id, deletedAt: null },
      include: { department: true, user: true },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<Employee | null> {
    return this.getClient(tx).employee.findFirst({
      where: { employeeId, deletedAt: null },
      include: { department: true, user: true },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Employee[]> {
    return this.getClient(tx).employee.findMany({
      where: { deletedAt: null },
      include: { department: true, user: true },
    });
  }

  public async update(id: string, data: Prisma.EmployeeUpdateInput, tx?: Prisma.TransactionClient): Promise<Employee> {
    return this.getClient(tx).employee.update({
      where: { id },
      data,
      include: { department: true, user: true },
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Employee> {
    return this.getClient(tx).employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
