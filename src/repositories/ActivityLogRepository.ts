import { Prisma, ActivityLog } from "@prisma/client";
import { IActivityLogRepository } from "../interfaces/IActivityLogRepository";
import { prisma } from "../database/db";

/**
 * ActivityLog Repository Implementation.
 * Write-heavy audit logger interface.
 */
export class ActivityLogRepository implements IActivityLogRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.ActivityLogUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ActivityLog> {
    return this.getClient(tx).activityLog.create({ data });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<ActivityLog[]> {
    return this.getClient(tx).activityLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });
  }
}
