import { Prisma, AuditChecklist } from "@prisma/client";

export interface IAuditChecklistRepository {
  create(data: Prisma.AuditChecklistUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<AuditChecklist>;
  createMany(data: Prisma.AuditChecklistUncheckedCreateInput[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<AuditChecklist | null>;
  findByAuditId(auditId: string, tx?: Prisma.TransactionClient): Promise<AuditChecklist[]>;
  update(id: string, data: Prisma.AuditChecklistUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<AuditChecklist>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<AuditChecklist>;
}
