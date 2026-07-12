import { Prisma, Setting } from "@prisma/client";

/**
 * Interface contract for Setting Repository (SOLID).
 */
export interface ISettingRepository {
  create(data: Prisma.SettingCreateInput, tx?: Prisma.TransactionClient): Promise<Setting>;
  findByKey(key: string, tx?: Prisma.TransactionClient): Promise<Setting | null>;
  update(id: string, data: Prisma.SettingUpdateInput, tx?: Prisma.TransactionClient): Promise<Setting>;
  findAll(tx?: Prisma.TransactionClient): Promise<Setting[]>;
}
