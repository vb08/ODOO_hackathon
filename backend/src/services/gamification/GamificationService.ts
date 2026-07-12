import { Employee, Badge, Prisma } from "@prisma/client";
import { IBadgeRepository } from "../../interfaces/IBadgeRepository";
import { IEmployeeBadgeRepository } from "../../interfaces/IEmployeeBadgeRepository";
import { ILeaderboardRepository } from "../../interfaces/ILeaderboardRepository";
import { BadgeRepository } from "../../repositories/BadgeRepository";
import { EmployeeBadgeRepository } from "../../repositories/EmployeeBadgeRepository";
import { LeaderboardRepository } from "../../repositories/LeaderboardRepository";
import { auditLogger } from "../ActivityLogService";

export class GamificationService {
  private badgeRepo: IBadgeRepository;
  private employeeBadgeRepo: IEmployeeBadgeRepository;
  private leaderboardRepo: ILeaderboardRepository;

  constructor(
    badgeRepo: IBadgeRepository = new BadgeRepository(),
    employeeBadgeRepo: IEmployeeBadgeRepository = new EmployeeBadgeRepository(),
    leaderboardRepo: ILeaderboardRepository = new LeaderboardRepository()
  ) {
    this.badgeRepo = badgeRepo;
    this.employeeBadgeRepo = employeeBadgeRepo;
    this.leaderboardRepo = leaderboardRepo;
  }

  /**
   * Core XP crediting system. Atomically adds XP, checks for badge unlocks, and recalculates leaderboards.
   */
  public async addXp(employeeId: string, amount: number, tx: Prisma.TransactionClient, callerUserId: string): Promise<Employee> {
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
  public async deductXp(employeeId: string, amount: number, tx: Prisma.TransactionClient): Promise<Employee> {
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
  private async checkAndUnlockBadges(employee: Employee, tx: Prisma.TransactionClient, callerUserId: string): Promise<void> {
    // Get all badges
    const allBadges = await this.badgeRepo.findAll(tx);
    // Get badges unlocked by this employee
    const unlockedBadges = await this.employeeBadgeRepo.findByEmployeeId(employee.id, tx);
    const unlockedBadgeIds = unlockedBadges.map((ub) => ub.badgeId);

    // Find badges employee qualifies for but hasn't unlocked
    const newBadges = allBadges.filter(
      (badge) => badge.xpThreshold <= employee.xp && !unlockedBadgeIds.includes(badge.id)
    );

    for (const badge of newBadges) {
      // Create EmployeeBadge record
      const employeeBadge = await this.employeeBadgeRepo.create(
        {
          employeeId: employee.id,
          badgeId: badge.id,
          createdByUserId: callerUserId,
        },
        tx
      );

      // Log unlock activity
      await auditLogger.log({
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
  public async updateLeaderboard(tx: Prisma.TransactionClient): Promise<void> {
    // Get all active employees sorted by XP descending
    const employees = await tx.employee.findMany({
      where: { deletedAt: null },
      orderBy: { xp: "desc" },
    });

    // Clear leaderboard first inside transaction
    await this.leaderboardRepo.clearAll(tx);

    if (employees.length === 0) return;

    // Create new ranks mapping
    const leaderboardData = employees.map((emp, index) => ({
      employeeId: emp.id,
      xp: emp.xp,
      rank: index + 1,
    }));

    await this.leaderboardRepo.createMany(leaderboardData, tx);
  }

  // --- Badge CRUD endpoints helper ---

  public async createBadge(data: Prisma.BadgeUncheckedCreateInput, callerUserId: string): Promise<Badge> {
    const badge = await this.badgeRepo.create({ ...data, createdByUserId: callerUserId });
    
    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "Badge",
      entityId: badge.id,
      newValue: badge,
    });
    
    return badge;
  }

  public async findBadgeById(id: string): Promise<Badge> {
    const badge = await this.badgeRepo.findById(id);
    if (!badge) throw AppError.notFound(`Badge with ID ${id} not found.`);
    return badge;
  }

  public async findAllBadges(): Promise<Badge[]> {
    return this.badgeRepo.findAll();
  }

  public async updateBadge(id: string, data: Prisma.BadgeUncheckedUpdateInput, callerUserId: string): Promise<Badge> {
    const oldState = await this.findBadgeById(id);
    const updated = await this.badgeRepo.update(id, { ...data, updatedByUserId: callerUserId });

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "Badge",
      entityId: id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async deleteBadge(id: string, callerUserId: string): Promise<Badge> {
    const oldState = await this.findBadgeById(id);
    const deleted = await this.badgeRepo.delete(id, callerUserId);

    await auditLogger.log({
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

import { AppError } from "../../utils/AppError";
