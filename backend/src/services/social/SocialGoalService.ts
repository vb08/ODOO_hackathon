import { SocialGoal } from "@prisma/client";
import { ISocialGoalRepository } from "../../interfaces/ISocialGoalRepository";
import { SocialGoalRepository } from "../../repositories/SocialGoalRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export interface CreateSocialGoalDto {
  title: string;
  description?: string | null;
  targetVolunteerHours: number;
  year: number;
  departmentId?: string | null;
  status?: "ACTIVE" | "ACHIEVED" | "EXCEEDED";
}

export class SocialGoalService {
  private goalRepo: ISocialGoalRepository;

  constructor(repo: ISocialGoalRepository = new SocialGoalRepository()) {
    this.goalRepo = repo;
  }

  public async create(dto: CreateSocialGoalDto, callerUserId: string): Promise<SocialGoal> {
    return prisma.$transaction(async (tx) => {
      // Check duplicate goal for department and year
      const existing = await this.goalRepo.findByDepartmentAndYear(dto.departmentId || null, dto.year, tx);
      if (existing) {
        throw AppError.conflict(`Social goal for department and year ${dto.year} already exists.`);
      }

      if (dto.departmentId) {
        const dept = await tx.department.findFirst({ where: { id: dto.departmentId, deletedAt: null } });
        if (!dept) throw AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
      }

      const goal = await this.goalRepo.create(
        {
          title: dto.title,
          description: dto.description,
          targetVolunteerHours: dto.targetVolunteerHours,
          year: dto.year,
          departmentId: dto.departmentId,
          status: dto.status || "ACTIVE",
          createdByUserId: callerUserId,
        },
        tx
      );

      await auditLogger.log({
        userId: callerUserId,
        action: "CREATE",
        entity: "SocialGoal",
        entityId: goal.id,
        newValue: goal,
        tx,
      });

      return goal;
    });
  }

  public async findById(id: string): Promise<SocialGoal> {
    const goal = await this.goalRepo.findById(id);
    if (!goal) throw AppError.notFound(`Social Goal with ID ${id} not found.`);
    return goal;
  }

  public async findAll(): Promise<SocialGoal[]> {
    return this.goalRepo.findAll();
  }

  public async findByDepartmentId(departmentId: string): Promise<SocialGoal[]> {
    return this.goalRepo.findByDepartmentId(departmentId);
  }

  public async update(id: string, dto: Partial<CreateSocialGoalDto>, callerUserId: string): Promise<SocialGoal> {
    return prisma.$transaction(async (tx) => {
      const oldState = await this.goalRepo.findById(id, tx);
      if (!oldState) throw AppError.notFound(`Social Goal with ID ${id} not found.`);

      const updated = await this.goalRepo.update(
        id,
        {
          title: dto.title,
          description: dto.description,
          targetVolunteerHours: dto.targetVolunteerHours,
          year: dto.year,
          departmentId: dto.departmentId,
          status: dto.status,
          updatedByUserId: callerUserId,
        },
        tx
      );

      await auditLogger.log({
        userId: callerUserId,
        action: "UPDATE",
        entity: "SocialGoal",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async delete(id: string, callerUserId: string): Promise<SocialGoal> {
    const oldState = await this.findById(id);
    const deleted = await this.goalRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "SocialGoal",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }
}
