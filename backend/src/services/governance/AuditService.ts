import { Audit, AuditChecklist, Prisma } from "@prisma/client";
import { IAuditRepository } from "../../interfaces/IAuditRepository";
import { IAuditChecklistRepository } from "../../interfaces/IAuditChecklistRepository";
import { AuditRepository } from "../../repositories/AuditRepository";
import { AuditChecklistRepository } from "../../repositories/AuditChecklistRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export interface CreateChecklistItemDto {
  title: string;
  status?: "PENDING" | "VERIFIED" | "FAILED";
  remarks?: string;
}

export interface CreateAuditDto {
  title: string;
  code: string;
  departmentId: string;
  auditorName: string;
  auditDate: string;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  score?: number;
  maxScore?: number;
  findings?: string;
  checklists?: CreateChecklistItemDto[];
}

export interface UpdateAuditDto {
  title?: string;
  code?: string;
  departmentId?: string;
  auditorName?: string;
  auditDate?: string;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  score?: number;
  maxScore?: number;
  findings?: string;
}

export interface UpdateChecklistItemDto {
  status?: "PENDING" | "VERIFIED" | "FAILED";
  remarks?: string;
  verifiedBy?: string;
}

export class AuditService {
  private auditRepo: IAuditRepository;
  private checklistRepo: IAuditChecklistRepository;

  constructor(
    auditRepo: IAuditRepository = new AuditRepository(),
    checklistRepo: IAuditChecklistRepository = new AuditChecklistRepository()
  ) {
    this.auditRepo = auditRepo;
    this.checklistRepo = checklistRepo;
  }

  public async create(dto: CreateAuditDto, callerUserId: string): Promise<Audit> {
    return prisma.$transaction(async (tx) => {
      const existing = await this.auditRepo.findByCode(dto.code, tx);
      if (existing) {
        throw AppError.conflict(`Audit with code ${dto.code} already exists.`);
      }

      // Verify department
      const department = await tx.department.findFirst({
        where: { id: dto.departmentId, deletedAt: null },
      });
      if (!department) {
        throw AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
      }

      // Calculate initial percentage if score and maxScore are provided
      let percentage: number | null = null;
      if (dto.score !== undefined && dto.maxScore !== undefined && dto.maxScore > 0) {
        percentage = Math.round((dto.score / dto.maxScore) * 100 * 100) / 100;
      }

      const audit = await this.auditRepo.create(
        {
          title: dto.title,
          code: dto.code,
          departmentId: dto.departmentId,
          auditorName: dto.auditorName,
          auditDate: new Date(dto.auditDate),
          status: dto.status || "PLANNED",
          score: dto.score,
          maxScore: dto.maxScore,
          percentage,
          findings: dto.findings,
          createdByUserId: callerUserId,
        },
        tx
      );

      // Create checklist items if provided
      if (dto.checklists && dto.checklists.length > 0) {
        const checklistsData = dto.checklists.map((c) => ({
          auditId: audit.id,
          title: c.title,
          status: c.status || "PENDING",
          remarks: c.remarks,
          createdByUserId: callerUserId,
        }));

        await this.checklistRepo.createMany(checklistsData, tx);
        await this.recalculateAuditScore(audit.id, tx);
      }

      const finalizedAudit = await this.auditRepo.findById(audit.id, tx);

      await auditLogger.log({
        userId: callerUserId,
        action: "CREATE",
        entity: "Audit",
        entityId: audit.id,
        newValue: finalizedAudit,
        tx,
      });

      return finalizedAudit || audit;
    });
  }

  public async findById(id: string): Promise<Audit> {
    const audit = await this.auditRepo.findById(id);
    if (!audit) {
      throw AppError.notFound(`Audit with ID ${id} not found.`);
    }
    return audit;
  }

  public async findAll(): Promise<Audit[]> {
    return this.auditRepo.findAll();
  }

  public async findByDepartmentId(departmentId: string): Promise<Audit[]> {
    return this.auditRepo.findByDepartmentId(departmentId);
  }

  public async update(id: string, dto: UpdateAuditDto, callerUserId: string): Promise<Audit> {
    return prisma.$transaction(async (tx) => {
      const oldState = await this.auditRepo.findById(id, tx);
      if (!oldState) {
        throw AppError.notFound(`Audit with ID ${id} not found.`);
      }

      if (dto.code && dto.code !== oldState.code) {
        const existing = await this.auditRepo.findByCode(dto.code, tx);
        if (existing) {
          throw AppError.conflict(`Audit with code ${dto.code} already exists.`);
        }
      }

      let percentage = oldState.percentage;
      const finalScore = dto.score !== undefined ? dto.score : oldState.score;
      const finalMaxScore = dto.maxScore !== undefined ? dto.maxScore : oldState.maxScore;
      
      if (finalScore !== null && finalMaxScore !== null && finalMaxScore > 0) {
        percentage = Math.round((finalScore / finalMaxScore) * 100 * 100) / 100;
      }

      const updated = await this.auditRepo.update(
        id,
        {
          title: dto.title,
          code: dto.code,
          departmentId: dto.departmentId,
          auditorName: dto.auditorName,
          auditDate: dto.auditDate ? new Date(dto.auditDate) : undefined,
          status: dto.status,
          score: dto.score,
          maxScore: dto.maxScore,
          percentage,
          findings: dto.findings,
          updatedByUserId: callerUserId,
        },
        tx
      );

      await auditLogger.log({
        userId: callerUserId,
        action: "UPDATE",
        entity: "Audit",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async delete(id: string, callerUserId: string): Promise<Audit> {
    const oldState = await this.findById(id);
    const deleted = await this.auditRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "Audit",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }

  /**
   * Update Checklist Item status/remarks and trigger score recalculation
   */
  public async updateChecklistItem(id: string, dto: UpdateChecklistItemDto, callerUserId: string): Promise<AuditChecklist> {
    return prisma.$transaction(async (tx) => {
      const checklist = await this.checklistRepo.findById(id, tx);
      if (!checklist) {
        throw AppError.notFound(`Checklist item with ID ${id} not found.`);
      }

      const oldState = { ...checklist };
      const updated = await this.checklistRepo.update(
        id,
        {
          status: dto.status,
          remarks: dto.remarks,
          verifiedBy: dto.verifiedBy,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // Trigger recalculation on parent audit
      await this.recalculateAuditScore(checklist.auditId, tx);

      await auditLogger.log({
        userId: callerUserId,
        action: "UPDATE",
        entity: "AuditChecklist",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  /**
   * Helper to recalculate audit scores based on checklists verified
   */
  private async recalculateAuditScore(auditId: string, tx: Prisma.TransactionClient): Promise<void> {
    const checklists = await tx.auditChecklist.findMany({
      where: { auditId, deletedAt: null },
    });

    if (checklists.length === 0) return;

    const verifiedCount = checklists.filter((c) => c.status === "VERIFIED").length;
    const totalCount = checklists.length;
    const percentage = Math.round((verifiedCount / totalCount) * 100 * 100) / 100;

    await tx.audit.update({
      where: { id: auditId },
      data: {
        score: verifiedCount,
        maxScore: totalCount,
        percentage,
      },
    });
  }
}
