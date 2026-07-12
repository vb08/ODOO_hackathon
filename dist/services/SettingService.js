"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingService = void 0;
const SettingRepository_1 = require("../repositories/SettingRepository");
const AppError_1 = require("../utils/AppError");
const ActivityLogService_1 = require("./ActivityLogService");
class SettingService {
    settingRepo;
    constructor(repo = new SettingRepository_1.SettingRepository()) {
        this.settingRepo = repo;
    }
    async create(dto, callerUserId) {
        const existing = await this.settingRepo.findByKey(dto.key);
        if (existing) {
            throw AppError_1.AppError.conflict(`Setting configuration with key ${dto.key} already exists.`);
        }
        const setting = await this.settingRepo.create({
            key: dto.key,
            value: dto.value,
            description: dto.description,
            createdByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "Setting",
            entityId: setting.id,
            newValue: setting,
        });
        return setting;
    }
    async findByKey(key) {
        const setting = await this.settingRepo.findByKey(key);
        if (!setting) {
            throw AppError_1.AppError.notFound(`System setting '${key}' not found.`);
        }
        return setting;
    }
    async update(key, value, callerUserId) {
        const oldState = await this.findByKey(key);
        const updated = await this.settingRepo.update(oldState.id, {
            value,
            updatedByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "Setting",
            entityId: oldState.id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async findAll() {
        return this.settingRepo.findAll();
    }
}
exports.SettingService = SettingService;
