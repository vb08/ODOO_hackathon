import { Prisma, EmployeeBadge } from "@prisma/client";

export interface IEmployeeBadgeRepository {
  create(data: Prisma.EmployeeBadgeUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<EmployeeBadge>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge | null>;
  findByEmployeeAndBadge(employeeId: string, badgeId: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge | null>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge[]>;
  findAll(tx?: Prisma.TransactionClient): Promise<EmployeeBadge[]>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<EmployeeBadge>;
}
