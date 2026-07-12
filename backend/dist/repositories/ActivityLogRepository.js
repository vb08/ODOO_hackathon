"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogRepository = void 0;
const db_1 = require("../database/db");
/**
 * ActivityLog Repository Implementation.
 * Write-heavy audit logger interface.
 */
class ActivityLogRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).activityLog.create({ data });
    }
    async findAll(tx) {
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
exports.ActivityLogRepository = ActivityLogRepository;
