import { Prisma, Audit } from "@prisma/client";
import { IAuditRepository } from "../interfaces/IAuditRepository";
import { prisma } from "../database/db";

export class AuditRepository implements IAuditRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.AuditUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Audit> {
    return this.getClient(tx).audit.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<Audit | null> {
    return this.getClient(tx).audit.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
        checklists: {
          where: { deletedAt: null },
        },
        complianceIssues: {
          where: { deletedAt: null },
        },
      },
    });
  }

  public async findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Audit | null> {
    return this.getClient(tx).audit.findFirst({
      where: { code, deletedAt: null },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Audit[]> {
    return this.getClient(tx).audit.findMany({
      where: { deletedAt: null },
      include: {
        department: true,
        checklists: {
          where: { deletedAt: null },
        },
      },
    });
  }

  public async findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<Audit[]> {
    return this.getClient(tx).audit.findMany({
      where: { departmentId, deletedAt: null },
      include: {
        department: true,
        checklists: {
          where: { deletedAt: null },
        },
      },
    });
  }

  public async update(id: string, data: Prisma.AuditUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Audit> {
    return this.getClient(tx).audit.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Audit> {
    return this.getClient(tx).audit.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
