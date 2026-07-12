import { Prisma, Badge } from "@prisma/client";

export interface IBadgeRepository {
  create(data: Prisma.BadgeUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<Badge>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Badge | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<Badge[]>;
  update(id: string, data: Prisma.BadgeUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Badge>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<Badge>;
}
