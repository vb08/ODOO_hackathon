import { Setting } from "@prisma/client";
import { ISettingRepository } from "../interfaces/ISettingRepository";
import { SettingRepository } from "../repositories/SettingRepository";
import { AppError } from "../utils/AppError";
import { auditLogger } from "./ActivityLogService";

export interface CreateSettingDto {
  key: string;
  value: string;
  description?: string;
}

export class SettingService {
  private settingRepo: ISettingRepository;

  constructor(repo: ISettingRepository = new SettingRepository()) {
    this.settingRepo = repo;
  }

  public async create(dto: CreateSettingDto, callerUserId: string): Promise<Setting> {
    const existing = await this.settingRepo.findByKey(dto.key);
    if (existing) {
      throw AppError.conflict(`Setting configuration with key ${dto.key} already exists.`);
    }

    const setting = await this.settingRepo.create({
      key: dto.key,
      value: dto.value,
      description: dto.description,
      createdByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "Setting",
      entityId: setting.id,
      newValue: setting,
    });

    return setting;
  }

  public async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepo.findByKey(key);
    if (!setting) {
      throw AppError.notFound(`System setting '${key}' not found.`);
    }
    return setting;
  }

  public async update(key: string, value: string, callerUserId: string): Promise<Setting> {
    const oldState = await this.findByKey(key);

    const updated = await this.settingRepo.update(oldState.id, {
      value,
      updatedByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "Setting",
      entityId: oldState.id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async findAll(): Promise<Setting[]> {
    return this.settingRepo.findAll();
  }
}
