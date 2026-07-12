import { Prisma, ComplianceIssue } from "@prisma/client";

export interface IComplianceIssueRepository {
  create(data: Prisma.ComplianceIssueUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ComplianceIssue>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]>;
  findByOwnerId(ownerId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]>;
  findByAuditId(auditId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]>;
  findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]>;
  update(id: string, data: Prisma.ComplianceIssueUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<ComplianceIssue>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<ComplianceIssue>;
  getOverdueIssues(tx?: Prisma.TransactionClient): Promise<ComplianceIssue[]>;
}
