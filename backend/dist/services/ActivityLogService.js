"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.ActivityLogService = void 0;
const client_1 = require("@prisma/client");
const ActivityLogRepository_1 = require("../repositories/ActivityLogRepository");
/**
 * Service to handle creation and retrieval of system audit logs.
 */
class ActivityLogService {
    activityLogRepository;
    constructor(repository = new ActivityLogRepository_1.ActivityLogRepository()) {
        this.activityLogRepository = repository;
    }
    /**
     * Logs a CRUD activity to the database.
     */
    async log({ userId, action, entity, entityId, oldValue, newValue, tx, }) {
        return this.activityLogRepository.create({
            userId,
            action,
            entity,
            entityId,
            oldValue: oldValue ? oldValue : client_1.Prisma.DbNull,
            newValue: newValue ? newValue : client_1.Prisma.DbNull,
        }, tx);
    }
    /**
     * Fetches all logs.
     */
    async getAllLogs(tx) {
        return this.activityLogRepository.findAll(tx);
    }
}
exports.ActivityLogService = ActivityLogService;
// Export a singleton instance of the service for convenient application-wide logging
exports.auditLogger = new ActivityLogService();
