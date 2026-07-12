import { Prisma, AuditChecklist } from "@prisma/client";
import { IAuditChecklistRepository } from "../interfaces/IAuditChecklistRepository";
import { prisma } from "../database/db";

export class AuditChecklistRepository implements IAuditChecklistRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.AuditChecklistUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<AuditChecklist> {
    return this.getClient(tx).auditChecklist.create({ data });
  }

  public async createMany(data: Prisma.AuditChecklistUncheckedCreateInput[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    return this.getClient(tx).auditChecklist.createMany({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<AuditChecklist | null> {
    return this.getClient(tx).auditChecklist.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findByAuditId(auditId: string, tx?: Prisma.TransactionClient): Promise<AuditChecklist[]> {
    return this.getClient(tx).auditChecklist.findMany({
      where: { auditId, deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.AuditChecklistUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<AuditChecklist> {
    return this.getClient(tx).auditChecklist.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<AuditChecklist> {
    return this.getClient(tx).auditChecklist.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
