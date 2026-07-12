import { Prisma, ComplianceIssue } from "@prisma/client";
import { IComplianceIssueRepository } from "../interfaces/IComplianceIssueRepository";
import { prisma } from "../database/db";

export class ComplianceIssueRepository implements IComplianceIssueRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.ComplianceIssueUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ComplianceIssue> {
    return this.getClient(tx).complianceIssue.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue | null> {
    return this.getClient(tx).complianceIssue.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: true,
        audit: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]> {
    return this.getClient(tx).complianceIssue.findMany({
      where: { deletedAt: null },
      include: {
        owner: true,
        audit: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  public async findByOwnerId(ownerId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]> {
    return this.getClient(tx).complianceIssue.findMany({
      where: { ownerId, deletedAt: null },
      include: {
        owner: true,
        audit: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  public async findByAuditId(auditId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]> {
    return this.getClient(tx).complianceIssue.findMany({
      where: { auditId, deletedAt: null },
      include: {
        owner: true,
        audit: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  public async findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]> {
    return this.getClient(tx).complianceIssue.findMany({
      where: {
        deletedAt: null,
        audit: {
          departmentId,
        },
      },
      include: {
        owner: true,
        audit: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  public async update(id: string, data: Prisma.ComplianceIssueUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<ComplianceIssue> {
    return this.getClient(tx).complianceIssue.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue> {
    return this.getClient(tx).complianceIssue.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }

  public async getOverdueIssues(tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]> {
    return this.getClient(tx).complianceIssue.findMany({
      where: {
        status: { notIn: ["RESOLVED", "CLOSED"] },
        dueDate: { lt: new Date() },
        deletedAt: null,
      },
      include: {
        owner: true,
        audit: {
          include: {
            department: true,
          },
        },
      },
    });
  }
}
