import { EnvironmentalGoal, Prisma } from "@prisma/client";
import { IEnvironmentalGoalRepository } from "../../interfaces/IEnvironmentalGoalRepository";
import { IDepartmentRepository } from "../../interfaces/IDepartmentRepository";
import { EnvironmentalGoalRepository } from "../../repositories/EnvironmentalGoalRepository";
import { DepartmentRepository } from "../../repositories/DepartmentRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export interface CreateEnvironmentalGoalDto {
  departmentId: string;
  targetEmissions: number;
  year: number;
  description?: string;
}

export interface UpdateEnvironmentalGoalDto {
  departmentId?: string;
  targetEmissions?: number;
  year?: number;
  description?: string;
  status?: "ACTIVE" | "ACHIEVED" | "EXCEEDED";
}

export class EnvironmentalGoalService {
  private goalRepo: IEnvironmentalGoalRepository;
  private departmentRepo: IDepartmentRepository;

  constructor(
    goalRepo: IEnvironmentalGoalRepository = new EnvironmentalGoalRepository(),
    deptRepo: IDepartmentRepository = new DepartmentRepository()
  ) {
    this.goalRepo = goalRepo;
    this.departmentRepo = deptRepo;
  }

  public async create(dto: CreateEnvironmentalGoalDto, callerUserId: string): Promise<EnvironmentalGoal> {
    const existing = await this.goalRepo.findByDepartmentAndYear(dto.departmentId, dto.year);
    if (existing) {
      throw AppError.conflict(`Environmental goal for department ID ${dto.departmentId} and year ${dto.year} already exists.`);
    }

    const department = await this.departmentRepo.findById(dto.departmentId);
    if (!department) {
      throw AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
    }

    const goal = await this.goalRepo.create({
      departmentId: dto.departmentId,
      targetEmissions: dto.targetEmissions,
      year: dto.year,
      status: "ACTIVE",
      description: dto.description,
      createdByUserId: callerUserId,
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "EnvironmentalGoal",
      entityId: goal.id,
      newValue: goal,
    });

    return goal;
  }

  public async findById(id: string): Promise<EnvironmentalGoal> {
    const goal = await this.goalRepo.findById(id);
    if (!goal) {
      throw AppError.notFound(`Environmental goal with ID ${id} not found.`);
    }
    return goal;
  }

  public async findAll(): Promise<EnvironmentalGoal[]> {
    return this.goalRepo.findAll();
  }

  public async findByDepartmentId(departmentId: string): Promise<EnvironmentalGoal[]> {
    const department = await this.departmentRepo.findById(departmentId);
    if (!department) {
      throw AppError.notFound(`Department with ID ${departmentId} not found.`);
    }
    return this.goalRepo.findByDepartmentId(departmentId);
  }

  public async update(id: string, dto: UpdateEnvironmentalGoalDto, callerUserId: string): Promise<EnvironmentalGoal> {
    return prisma.$transaction(async (tx) => {
      const oldState = await this.goalRepo.findById(id, tx);
      if (!oldState) {
        throw AppError.notFound(`Environmental goal with ID ${id} not found.`);
      }

      if (dto.year && dto.departmentId) {
        const existing = await this.goalRepo.findByDepartmentAndYear(dto.departmentId, dto.year, tx);
        if (existing && existing.id !== id) {
          throw AppError.conflict(`Environmental goal for department ID ${dto.departmentId} and year ${dto.year} already exists.`);
        }
      }

      const updated = await this.goalRepo.update(
        id,
        {
          departmentId: dto.departmentId,
          targetEmissions: dto.targetEmissions,
          year: dto.year,
          status: dto.status,
          description: dto.description,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // If status transitioned to ACHIEVED, notify department manager and ESG managers
      if (oldState.status !== "ACHIEVED" && dto.status === "ACHIEVED") {
        await this.triggerGoalAchievedNotifications(updated, tx, callerUserId);
      }

      await auditLogger.log({
        userId: callerUserId,
        action: "UPDATE",
        entity: "EnvironmentalGoal",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async delete(id: string, callerUserId: string): Promise<EnvironmentalGoal> {
    const oldState = await this.findById(id);
    const deleted = await this.goalRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "EnvironmentalGoal",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }

  private async triggerGoalAchievedNotifications(
    goal: EnvironmentalGoal,
    tx: Prisma.TransactionClient,
    callerUserId: string
  ): Promise<void> {
    const department = await this.departmentRepo.findById(goal.departmentId, tx) as any;
    if (!department) return;

    // Find all Admins & ESG Managers
    const recipients = await tx.user.findMany({
      where: {
        deletedAt: null,
        role: {
          code: { in: ["ADMIN", "ESG_MANAGER"] },
        },
      },
    });

    // Add Department Head
    if (department.manager && department.manager.userId) {
      const hasManager = recipients.some((r) => r.id === department.manager?.userId);
      if (!hasManager) {
        const managerUser = await tx.user.findFirst({
          where: { id: department.manager.userId, deletedAt: null },
        });
        if (managerUser) {
          recipients.push(managerUser);
        }
      }
    }

    const title = "Goal Achieved Successfully";
    const message = `Department '${department.name}' has achieved its environmental goal of staying below ${goal.targetEmissions} CO2 for the year ${goal.year}.`;

    for (const user of recipients) {
      await tx.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type: "SUCCESS",
          createdByUserId: callerUserId,
        },
      });
    }
  }
}
