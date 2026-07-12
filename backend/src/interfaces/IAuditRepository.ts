import { Prisma, Audit } from "@prisma/client";

export interface IAuditRepository {
  create(data: Prisma.AuditUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Audit>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Audit | null>;
  findByCode(code: string, tx?: Prisma.TransactionClient): Promise<Audit | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Audit[]>;
  findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<Audit[]>;
  update(id: string, data: Prisma.AuditUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Audit>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Audit>;
}
