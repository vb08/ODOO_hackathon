import { Prisma, ActivityLog } from "@prisma/client";
import { IActivityLogRepository } from "../interfaces/IActivityLogRepository";
import { ActivityLogRepository } from "../repositories/ActivityLogRepository";

/**
 * Service to handle creation and retrieval of system audit logs.
 */
export class ActivityLogService {
  private activityLogRepository: IActivityLogRepository;

  constructor(repository: IActivityLogRepository = new ActivityLogRepository()) {
    this.activityLogRepository = repository;
  }

  /**
   * Logs a CRUD activity to the database.
   */
  public async log({
    userId,
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    tx,
  }: {
    userId: string | null;
    action: string;
    entity: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
    tx?: Prisma.TransactionClient;
  }): Promise<ActivityLog> {
    return this.activityLogRepository.create(
      {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ? (oldValue as Prisma.InputJsonValue) : Prisma.DbNull,
        newValue: newValue ? (newValue as Prisma.InputJsonValue) : Prisma.DbNull,
      },
      tx
    );
  }

  /**
   * Fetches all logs.
   */
  public async getAllLogs(tx?: Prisma.TransactionClient): Promise<ActivityLog[]> {
    return this.activityLogRepository.findAll(tx);
  }
}

// Export a singleton instance of the service for convenient application-wide logging
export const auditLogger = new ActivityLogService();
