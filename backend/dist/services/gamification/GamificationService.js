"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const BadgeRepository_1 = require("../../repositories/BadgeRepository");
const EmployeeBadgeRepository_1 = require("../../repositories/EmployeeBadgeRepository");
const LeaderboardRepository_1 = require("../../repositories/LeaderboardRepository");
const ActivityLogService_1 = require("../ActivityLogService");
class GamificationService {
    badgeRepo;
    employeeBadgeRepo;
    leaderboardRepo;
    constructor(badgeRepo = new BadgeRepository_1.BadgeRepository(), employeeBadgeRepo = new EmployeeBadgeRepository_1.EmployeeBadgeRepository(), leaderboardRepo = new LeaderboardRepository_1.LeaderboardRepository()) {
        this.badgeRepo = badgeRepo;
        this.employeeBadgeRepo = employeeBadgeRepo;
        this.leaderboardRepo = leaderboardRepo;
    }
    /**
     * Core XP crediting system. Atomically adds XP, checks for badge unlocks, and recalculates leaderboards.
     */
    async addXp(employeeId, amount, tx, callerUserId) {
        // 1. Increment employee XP
        const employee = await tx.employee.update({
            where: { id: employeeId },
            data: { xp: { increment: amount } },
        });
        // 2. Check and unlock badges
        await this.checkAndUnlockBadges(employee, tx, callerUserId);
        // 3. Update leaderboard
        await this.updateLeaderboard(tx);
        return employee;
    }
    /**
     * Deducts XP from employee (e.g. for reward redemption)
     */
    async deductXp(employeeId, amount, tx) {
        const employee = await tx.employee.update({
            where: { id: employeeId },
            data: { xp: { decrement: amount } },
        });
        // Update leaderboard
        await this.updateLeaderboard(tx);
        return employee;
    }
    /**
     * Scans badge thresholds and unlocks badges automatically
     */
    async checkAndUnlockBadges(employee, tx, callerUserId) {
        // Get all badges
        const allBadges = await this.badgeRepo.findAll(tx);
        // Get badges unlocked by this employee
        const unlockedBadges = await this.employeeBadgeRepo.findByEmployeeId(employee.id, tx);
        const unlockedBadgeIds = unlockedBadges.map((ub) => ub.badgeId);
        // Find badges employee qualifies for but hasn't unlocked
        const newBadges = allBadges.filter((badge) => badge.xpThreshold <= employee.xp && !unlockedBadgeIds.includes(badge.id));
        for (const badge of newBadges) {
            // Create EmployeeBadge record
            const employeeBadge = await this.employeeBadgeRepo.create({
                employeeId: employee.id,
                badgeId: badge.id,
                createdByUserId: callerUserId,
            }, tx);
            // Log unlock activity
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "BADGE_UNLOCKED",
                entity: "EmployeeBadge",
                entityId: employeeBadge.id,
                newValue: employeeBadge,
                tx,
            });
            // Send badge notification
            if (employee.userId) {
                await tx.notification.create({
                    data: {
                        userId: employee.userId,
                        title: "🏆 Badge Unlocked!",
                        message: `Congratulations! You unlocked the badge: '${badge.name}' (${badge.description}).`,
                        type: "SUCCESS",
                        createdByUserId: callerUserId,
                    },
                });
            }
        }
    }
    /**
     * Recalculates and updates Leaderboard table ranks
     */
    async updateLeaderboard(tx) {
        // Get all active employees sorted by XP descending
        const employees = await tx.employee.findMany({
            where: { deletedAt: null },
            orderBy: { xp: "desc" },
        });
        // Clear leaderboard first inside transaction
        await this.leaderboardRepo.clearAll(tx);
        if (employees.length === 0)
            return;
        // Create new ranks mapping
        const leaderboardData = employees.map((emp, index) => ({
            employeeId: emp.id,
            xp: emp.xp,
            rank: index + 1,
        }));
        await this.leaderboardRepo.createMany(leaderboardData, tx);
    }
    // --- Badge CRUD endpoints helper ---
    async createBadge(data, callerUserId) {
        const badge = await this.badgeRepo.create({ ...data, createdByUserId: callerUserId });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "Badge",
            entityId: badge.id,
            newValue: badge,
        });
        return badge;
    }
    async findBadgeById(id) {
        const badge = await this.badgeRepo.findById(id);
        if (!badge)
            throw AppError_1.AppError.notFound(`Badge with ID ${id} not found.`);
        return badge;
    }
    async findAllBadges() {
        return this.badgeRepo.findAll();
    }
    async updateBadge(id, data, callerUserId) {
        const oldState = await this.findBadgeById(id);
        const updated = await this.badgeRepo.update(id, { ...data, updatedByUserId: callerUserId });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "Badge",
            entityId: id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async deleteBadge(id, callerUserId) {
        const oldState = await this.findBadgeById(id);
        const deleted = await this.badgeRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "Badge",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
}
exports.GamificationService = GamificationService;
const AppError_1 = require("../../utils/AppError");
