import { Prisma, ActivityLog } from "@prisma/client";

/**
 * Interface contract for ActivityLog Repository (SOLID).
 */
export interface IActivityLogRepository {
  create(data: Prisma.ActivityLogUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ActivityLog>;
  findAll(tx?: Prisma.TransactionClient): Promise<ActivityLog[]>;
}
