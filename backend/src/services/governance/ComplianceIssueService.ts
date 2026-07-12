import { ComplianceIssue, Prisma } from "@prisma/client";
import { IComplianceIssueRepository } from "../../interfaces/IComplianceIssueRepository";
import { ComplianceIssueRepository } from "../../repositories/ComplianceIssueRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export interface CreateComplianceIssueDto {
  auditId?: string | null;
  title: string;
  description: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ownerId: string;
  dueDate: string;
}

export interface UpdateComplianceIssueDto {
  auditId?: string | null;
  title?: string;
  description?: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ownerId?: string;
  dueDate?: string;
}

export class ComplianceIssueService {
  private issueRepo: IComplianceIssueRepository;

  constructor(repo: IComplianceIssueRepository = new ComplianceIssueRepository()) {
    this.issueRepo = repo;
  }

  public async create(dto: CreateComplianceIssueDto, callerUserId: string): Promise<ComplianceIssue> {
    return prisma.$transaction(async (tx) => {
      // Validate owner
      const owner = await tx.employee.findFirst({
        where: { id: dto.ownerId, deletedAt: null },
      });
      if (!owner) {
        throw AppError.notFound(`Employee owner with ID ${dto.ownerId} not found.`);
      }

      if (dto.auditId) {
        const audit = await tx.audit.findFirst({
          where: { id: dto.auditId, deletedAt: null },
        });
        if (!audit) {
          throw AppError.notFound(`Audit reference with ID ${dto.auditId} not found.`);
        }
      }

      const issue = await this.issueRepo.create(
        {
          auditId: dto.auditId,
          title: dto.title,
          description: dto.description,
          status: dto.status || "OPEN",
          priority: dto.priority || "MEDIUM",
          severity: dto.severity || "MEDIUM",
          ownerId: dto.ownerId,
          dueDate: new Date(dto.dueDate),
          createdByUserId: callerUserId,
        },
        tx
      );

      // Log creation
      await auditLogger.log({
        userId: callerUserId,
        action: "CREATED",
        entity: "ComplianceIssue",
        entityId: issue.id,
        newValue: issue,
        tx,
      });

      // Send assignment notification
      await this.triggerAssignmentNotification(issue, tx, callerUserId);

      // Log ASSIGNED event in timeline
      await auditLogger.log({
        userId: callerUserId,
        action: "ASSIGNED",
        entity: "ComplianceIssue",
        entityId: issue.id,
        newValue: { ownerId: dto.ownerId },
        tx,
      });

      return issue;
    });
  }

  public async findById(id: string): Promise<ComplianceIssue> {
    const issue = await this.issueRepo.findById(id);
    if (!issue) {
      throw AppError.notFound(`Compliance issue with ID ${id} not found.`);
    }
    return issue;
  }

  public async findAll(): Promise<ComplianceIssue[]> {
    return this.issueRepo.findAll();
  }

  public async findByOwnerId(ownerId: string): Promise<ComplianceIssue[]> {
    return this.issueRepo.findByOwnerId(ownerId);
  }

  public async findByDepartmentId(departmentId: string): Promise<ComplianceIssue[]> {
    return this.issueRepo.findByDepartmentId(departmentId);
  }

  public async update(id: string, dto: UpdateComplianceIssueDto, callerUserId: string): Promise<ComplianceIssue> {
    return prisma.$transaction(async (tx) => {
      const oldState = await this.issueRepo.findById(id, tx);
      if (!oldState) {
        throw AppError.notFound(`Compliance issue with ID ${id} not found.`);
      }

      if (dto.ownerId && dto.ownerId !== oldState.ownerId) {
        const owner = await tx.employee.findFirst({
          where: { id: dto.ownerId, deletedAt: null },
        });
        if (!owner) {
          throw AppError.notFound(`Employee owner with ID ${dto.ownerId} not found.`);
        }
      }

      let resolvedAt = oldState.resolvedAt;
      if (dto.status && ["RESOLVED", "CLOSED"].includes(dto.status) && !oldState.resolvedAt) {
        resolvedAt = new Date();
      }

      const updated = await this.issueRepo.update(
        id,
        {
          auditId: dto.auditId,
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          severity: dto.severity,
          ownerId: dto.ownerId,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          resolvedAt,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // Activity timeline logging
      const statusChanged = dto.status && dto.status !== oldState.status;
      const actionLabel = statusChanged ? dto.status! : "UPDATED";

      await auditLogger.log({
        userId: callerUserId,
        action: actionLabel,
        entity: "ComplianceIssue",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      // Assignment notification if owner changed
      if (dto.ownerId && dto.ownerId !== oldState.ownerId) {
        await this.triggerAssignmentNotification(updated, tx, callerUserId);
        await auditLogger.log({
          userId: callerUserId,
          action: "ASSIGNED",
          entity: "ComplianceIssue",
          entityId: id,
          newValue: { ownerId: dto.ownerId },
          tx,
        });
      }

      // Resolution notification if status transitioned to RESOLVED
      if (oldState.status !== "RESOLVED" && updated.status === "RESOLVED") {
        await this.triggerResolutionNotification(updated, tx, callerUserId);
      }

      return updated;
    });
  }

  public async delete(id: string, callerUserId: string): Promise<ComplianceIssue> {
    const oldState = await this.findById(id);
    const deleted = await this.issueRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "ComplianceIssue",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }

  /**
   * Scans the system for active compliance issues past due date and dispatches reminders
   */
  public async flagOverdueIssues(callerUserId: string): Promise<number> {
    return prisma.$transaction(async (tx) => {
      const overdue = await this.issueRepo.getOverdueIssues(tx);
      
      let count = 0;
      for (const issue of overdue) {
        // Send notification to Owner
        const ownerEmp = await tx.employee.findFirst({
          where: { id: issue.ownerId, deletedAt: null },
        });

        if (ownerEmp && ownerEmp.userId) {
          // Log timeline event
          await auditLogger.log({
            userId: callerUserId,
            action: "COMPLIANCE_ISSUE_OVERDUE",
            entity: "ComplianceIssue",
            entityId: issue.id,
            newValue: { dueDate: issue.dueDate },
            tx,
          });

          await tx.notification.create({
            data: {
              userId: ownerEmp.userId,
              title: "Compliance Issue OVERDUE",
              message: `Your assigned compliance issue: '${issue.title}' is overdue (Due Date was: ${issue.dueDate.toDateString()}). Please resolve it immediately.`,
              type: "ERROR",
            },
          });
          count++;
        }
      }
      return count;
    });
  }

  private async triggerAssignmentNotification(issue: ComplianceIssue, tx: Prisma.TransactionClient, callerUserId: string): Promise<void> {
    const ownerEmp = await tx.employee.findFirst({
      where: { id: issue.ownerId, deletedAt: null },
    });

    if (ownerEmp && ownerEmp.userId) {
      await tx.notification.create({
        data: {
          userId: ownerEmp.userId,
          title: "Compliance Issue Assigned",
          message: `A new compliance issue: '${issue.title}' has been assigned to you. Due Date: ${issue.dueDate.toDateString()}.`,
          type: "WARNING",
          createdByUserId: callerUserId,
        },
      });
    }
  }

  private async triggerResolutionNotification(issue: ComplianceIssue, tx: Prisma.TransactionClient, callerUserId: string): Promise<void> {
    // Notify ESG Managers and Admin
    const administrators = await tx.user.findMany({
      where: {
        deletedAt: null,
        role: {
          code: { in: ["ADMIN", "ESG_MANAGER"] },
        },
      },
    });

    const title = "Compliance Issue Resolved";
    const message = `Compliance issue: '${issue.title}' has been resolved by owner employee ID: ${issue.ownerId}.`;

    for (const admin of administrators) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          title,
          message,
          type: "SUCCESS",
          createdByUserId: callerUserId,
        },
      });
    }
  }
}
