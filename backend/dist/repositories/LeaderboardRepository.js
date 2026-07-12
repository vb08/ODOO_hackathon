"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardRepository = void 0;
const db_1 = require("../database/db");
class LeaderboardRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async upsert(employeeId, xp, rank, tx) {
        return this.getClient(tx).leaderboard.upsert({
            where: { employeeId },
            update: { xp, rank },
            create: { employeeId, xp, rank },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).leaderboard.findMany({
            orderBy: { rank: "asc" },
            include: {
                employee: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).leaderboard.findUnique({
            where: { employeeId },
            include: {
                employee: true,
            },
        });
    }
    async clearAll(tx) {
        return this.getClient(tx).leaderboard.deleteMany({});
    }
    async createMany(data, tx) {
        return this.getClient(tx).leaderboard.createMany({ data });
    }
}
exports.LeaderboardRepository = LeaderboardRepository;
