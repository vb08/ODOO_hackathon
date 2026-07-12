import { Reward, RewardRedemption } from "@prisma/client";
import { IRewardRepository } from "../../interfaces/IRewardRepository";
import { IRewardRedemptionRepository } from "../../interfaces/IRewardRedemptionRepository";
import { RewardRepository } from "../../repositories/RewardRepository";
import { RewardRedemptionRepository } from "../../repositories/RewardRedemptionRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { GamificationService } from "./GamificationService";
import { prisma } from "../../database/db";

export interface CreateRewardDto {
  title: string;
  description: string;
  xpCost: number;
  stock: number;
}

export class RewardService {
  private rewardRepo: IRewardRepository;
  private redemptionRepo: IRewardRedemptionRepository;
  private gamificationService: GamificationService;

  constructor(
    rewardRepo: IRewardRepository = new RewardRepository(),
    redemptionRepo: IRewardRedemptionRepository = new RewardRedemptionRepository(),
    gamificationService: GamificationService = new GamificationService()
  ) {
    this.rewardRepo = rewardRepo;
    this.redemptionRepo = redemptionRepo;
    this.gamificationService = gamificationService;
  }

  public async create(dto: CreateRewardDto, callerUserId: string): Promise<Reward> {
    const reward = await this.rewardRepo.create({
      title: dto.title,
      description: dto.description,
      xpCost: dto.xpCost,
      stock: dto.stock,
      createdByUserId: callerUserId,
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "Reward",
      entityId: reward.id,
      newValue: reward,
    });

    return reward;
  }

  public async findById(id: string): Promise<Reward> {
    const reward = await this.rewardRepo.findById(id);
    if (!reward) throw AppError.notFound(`Reward with ID ${id} not found.`);
    return reward;
  }

  public async findAll(): Promise<Reward[]> {
    return this.rewardRepo.findAll();
  }

  public async update(id: string, dto: Partial<CreateRewardDto>, callerUserId: string): Promise<Reward> {
    const oldState = await this.findById(id);
    const updated = await this.rewardRepo.update(id, { ...dto, updatedByUserId: callerUserId });

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "Reward",
      entityId: id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async delete(id: string, callerUserId: string): Promise<Reward> {
    const oldState = await this.findById(id);
    const deleted = await this.rewardRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "Reward",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }

  // --- Redemption Workflows ---

  public async redeem(rewardId: string, callerUserId: string): Promise<RewardRedemption> {
    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findFirst({
        where: { userId: callerUserId, deletedAt: null },
      });
      if (!employee) throw AppError.forbidden("Active employee profile required for redemptions.");

      const reward = await this.rewardRepo.findById(rewardId, tx);
      if (!reward) throw AppError.notFound(`Reward with ID ${rewardId} not found.`);

      if (reward.stock <= 0) {
        throw AppError.conflict(`Reward '${reward.title}' is currently out of stock.`);
      }

      if (employee.xp < reward.xpCost) {
        throw AppError.badRequest(`Insufficient XP balance. Cost: ${reward.xpCost} XP, Balance: ${employee.xp} XP.`);
      }

      // Deduct XP (locks rank update)
      await this.gamificationService.deductXp(employee.id, reward.xpCost, tx);

      // Decrement stock
      await tx.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });

      // Create redemption in PENDING state
      const redemption = await this.redemptionRepo.create(
        {
          rewardId,
          employeeId: employee.id,
          status: "PENDING",
          createdByUserId: callerUserId,
        },
        tx
      );

      // Log redemption
      await auditLogger.log({
        userId: callerUserId,
        action: "REWARD_REDEEMED",
        entity: "RewardRedemption",
        entityId: redemption.id,
        newValue: redemption,
        tx,
      });

      // Dispatch alert
      await tx.notification.create({
        data: {
          userId: callerUserId,
          title: "Reward Redemption Logged",
          message: `Your request to redeem '${reward.title}' has been submitted. Status: PENDING (Locked: ${reward.xpCost} XP).`,
          type: "INFO",
          createdByUserId: callerUserId,
        },
      });

      return redemption;
    });
  }

  public async approveRedemption(id: string, status: "APPROVED" | "REJECTED" | "DELIVERED", callerUserId: string): Promise<RewardRedemption> {
    return prisma.$transaction(async (tx) => {
      const redemption: any = await this.redemptionRepo.findById(id, tx);
      if (!redemption) throw AppError.notFound(`Redemption record with ID ${id} not found.`);
      if (redemption.status === status) return redemption;

      const oldState = { ...redemption };
      const reward = redemption.reward;
      const employee = redemption.employee;

      // Handle Reject (refund XP + return stock)
      if (status === "REJECTED" && redemption.status === "PENDING") {
        await tx.employee.update({
          where: { id: employee.id },
          data: { xp: { increment: reward.xpCost } },
        });

        await tx.reward.update({
          where: { id: reward.id },
          data: { stock: { increment: 1 } },
        });

        // Trigger leaderboard refresh
        await this.gamificationService.updateLeaderboard(tx);

        // Notify employee of rejection
        if (employee.userId) {
          await tx.notification.create({
            data: {
              userId: employee.userId,
              title: "Redemption Rejected ❌",
              message: `Your redemption request for '${reward.title}' has been rejected. Cost: ${reward.xpCost} XP refunded.`,
              type: "ERROR",
              createdByUserId: callerUserId,
            },
          });
        }
      }

      // Handle Deliver/Approve
      if (["APPROVED", "DELIVERED"].includes(status) && employee.userId) {
        await tx.notification.create({
          data: {
            userId: employee.userId,
            title: `Redemption Status: ${status} 🎉`,
            message: `Your reward request: '${reward.title}' has been marked as ${status.toLowerCase()}!`,
            type: "SUCCESS",
            createdByUserId: callerUserId,
          },
        });
      }

      const updated = await this.redemptionRepo.update(
        id,
        {
          status,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // Log status transition in audit trail
      await auditLogger.log({
        userId: callerUserId,
        action: `REDEMPTION_${status}`,
        entity: "RewardRedemption",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async findRedemptionsByEmployee(employeeId: string): Promise<RewardRedemption[]> {
    return this.redemptionRepo.findByEmployeeId(employeeId);
  }

  public async findAllRedemptions(): Promise<RewardRedemption[]> {
    return this.redemptionRepo.findAll();
  }
}
