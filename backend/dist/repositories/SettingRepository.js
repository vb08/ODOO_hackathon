"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingRepository = void 0;
const db_1 = require("../database/db");
/**
 * Setting Repository Implementation.
 * Manages key-value system settings configurations.
 */
class SettingRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).setting.create({ data });
    }
    async findByKey(key, tx) {
        return this.getClient(tx).setting.findFirst({
            where: { key, deletedAt: null },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).setting.update({
            where: { id },
            data,
        });
    }
    async findAll(tx) {
        return this.getClient(tx).setting.findMany({
            where: { deletedAt: null },
        });
    }
}
exports.SettingRepository = SettingRepository;
