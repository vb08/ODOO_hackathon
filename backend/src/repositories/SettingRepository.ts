import { Prisma, Setting } from "@prisma/client";
import { ISettingRepository } from "../interfaces/ISettingRepository";
import { prisma } from "../database/db";

/**
 * Setting Repository Implementation.
 * Manages key-value system settings configurations.
 */
export class SettingRepository implements ISettingRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.SettingCreateInput, tx?: Prisma.TransactionClient): Promise<Setting> {
    return this.getClient(tx).setting.create({ data });
  }

  public async findByKey(key: string, tx?: Prisma.TransactionClient): Promise<Setting | null> {
    return this.getClient(tx).setting.findFirst({
      where: { key, deletedAt: null },
    });
  }

  public async update(id: string, data: Prisma.SettingUpdateInput, tx?: Prisma.TransactionClient): Promise<Setting> {
    return this.getClient(tx).setting.update({
      where: { id },
      data,
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Setting[]> {
    return this.getClient(tx).setting.findMany({
      where: { deletedAt: null },
    });
  }
}
