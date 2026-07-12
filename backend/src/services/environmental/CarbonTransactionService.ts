import { CarbonTransaction, Prisma } from "@prisma/client";
import { ICarbonTransactionRepository } from "../../interfaces/ICarbonTransactionRepository";
import { IEmissionFactorRepository } from "../../interfaces/IEmissionFactorRepository";
import { IDepartmentRepository } from "../../interfaces/IDepartmentRepository";
import { IEnvironmentalGoalRepository } from "../../interfaces/IEnvironmentalGoalRepository";
import { CarbonTransactionRepository } from "../../repositories/CarbonTransactionRepository";
import { EmissionFactorRepository } from "../../repositories/EmissionFactorRepository";
import { DepartmentRepository } from "../../repositories/DepartmentRepository";
import { EnvironmentalGoalRepository } from "../../repositories/EnvironmentalGoalRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export interface CreateCarbonTransactionDto {
  departmentId: string;
  emissionFactorId: string;
  quantity: number;
  evidenceUrl?: string;
  transactionDate?: string;
  description?: string;
}

export interface UpdateCarbonTransactionDto {
  departmentId?: string;
  emissionFactorId?: string;
  quantity?: number;
  evidenceUrl?: string;
  transactionDate?: string;
  description?: string;
}

export class CarbonTransactionService {
  private transactionRepo: ICarbonTransactionRepository;
  private factorRepo: IEmissionFactorRepository;
  private departmentRepo: IDepartmentRepository;
  private goalRepo: IEnvironmentalGoalRepository;

  constructor(
    txRepo: ICarbonTransactionRepository = new CarbonTransactionRepository(),
    factorRepo: IEmissionFactorRepository = new EmissionFactorRepository(),
    deptRepo: IDepartmentRepository = new DepartmentRepository(),
    goalRepo: IEnvironmentalGoalRepository = new EnvironmentalGoalRepository()
  ) {
    this.transactionRepo = txRepo;
    this.factorRepo = factorRepo;
    this.departmentRepo = deptRepo;
    this.goalRepo = goalRepo;
  }

  public async create(dto: CreateCarbonTransactionDto, callerUserId: string): Promise<CarbonTransaction> {
    if (dto.quantity < 0) {
      throw AppError.badRequest("Quantity cannot be negative.");
    }

    return prisma.$transaction(async (tx) => {
      // Validate department
      const department = await this.departmentRepo.findById(dto.departmentId, tx);
      if (!department) {
        throw AppError.notFound(`Department with ID ${dto.departmentId} not found.`);
      }

      // Validate emission factor
      const factor = await this.factorRepo.findById(dto.emissionFactorId, tx);
      if (!factor) {
        throw AppError.notFound(`Emission factor with ID ${dto.emissionFactorId} not found.`);
      }

      // Calculate emissions
      const emissions = dto.quantity * factor.factor;

      const transaction = await this.transactionRepo.create(
        {
          departmentId: dto.departmentId,
          emissionFactorId: dto.emissionFactorId,
          quantity: dto.quantity,
          emissions,
          evidenceUrl: dto.evidenceUrl,
          transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
          description: dto.description,
          status: "PENDING", // Always PENDING initially
          createdByUserId: callerUserId,
        },
        tx
      );

      await auditLogger.log({
        userId: callerUserId,
        action: "CREATE",
        entity: "CarbonTransaction",
        entityId: transaction.id,
        newValue: transaction,
        tx,
      });

      return transaction;
    });
  }

  public async findById(id: string): Promise<CarbonTransaction> {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw AppError.notFound(`Carbon transaction with ID ${id} not found.`);
    }
    return transaction;
  }

  public async findAll(): Promise<CarbonTransaction[]> {
    return this.transactionRepo.findAll();
  }

  public async findByDepartmentId(departmentId: string): Promise<CarbonTransaction[]> {
    const department = await this.departmentRepo.findById(departmentId);
    if (!department) {
      throw AppError.notFound(`Department with ID ${departmentId} not found.`);
    }
    return this.transactionRepo.findByDepartmentId(departmentId);
  }

  public async update(id: string, dto: UpdateCarbonTransactionDto, callerUserId: string): Promise<CarbonTransaction> {
    if (dto.quantity !== undefined && dto.quantity < 0) {
      throw AppError.badRequest("Quantity cannot be negative.");
    }

    return prisma.$transaction(async (tx) => {
      const oldState = await this.transactionRepo.findById(id, tx);
      if (!oldState) {
        throw AppError.notFound(`Carbon transaction with ID ${id} not found.`);
      }

      let newDeptId = dto.departmentId || oldState.departmentId;
      let newFactorId = dto.emissionFactorId || oldState.emissionFactorId;
      let newQuantity = dto.quantity !== undefined ? dto.quantity : oldState.quantity;

      const department = await this.departmentRepo.findById(newDeptId, tx);
      if (!department) {
        throw AppError.notFound(`Department with ID ${newDeptId} not found.`);
      }

      const factor = await this.factorRepo.findById(newFactorId, tx);
      if (!factor) {
        throw AppError.notFound(`Emission factor with ID ${newFactorId} not found.`);
      }

      const emissions = newQuantity * factor.factor;

      const updated = await this.transactionRepo.update(
        id,
        {
          departmentId: newDeptId,
          emissionFactorId: newFactorId,
          quantity: newQuantity,
          emissions,
          evidenceUrl: dto.evidenceUrl,
          transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
          description: dto.description,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // If the transaction was APPROVED, recheck goal targets
      if (oldState.status === "APPROVED") {
        await this.checkAndTriggerTargetNotifications(newDeptId, updated.transactionDate.getFullYear(), tx, callerUserId);
      }

      await auditLogger.log({
        userId: callerUserId,
        action: "UPDATE",
        entity: "CarbonTransaction",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async approve(id: string, status: "APPROVED" | "REJECTED", callerUserId: string): Promise<CarbonTransaction> {
    return prisma.$transaction(async (tx) => {
      const transaction = await this.transactionRepo.findById(id, tx);
      if (!transaction) {
        throw AppError.notFound(`Carbon transaction with ID ${id} not found.`);
      }

      if (transaction.status === status) {
        return transaction;
      }

      const oldState = { ...transaction };

      const updated = await this.transactionRepo.update(
        id,
        {
          status,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // Trigger target limit notifications if transitioning to APPROVED
      if (status === "APPROVED") {
        await this.checkAndTriggerTargetNotifications(
          transaction.departmentId,
          transaction.transactionDate.getFullYear(),
          tx,
          callerUserId
        );
      }

      await auditLogger.log({
        userId: callerUserId,
        action: "UPDATE_STATUS",
        entity: "CarbonTransaction",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async delete(id: string, callerUserId: string): Promise<CarbonTransaction> {
    return prisma.$transaction(async (tx) => {
      const oldState = await this.transactionRepo.findById(id, tx);
      if (!oldState) {
        throw AppError.notFound(`Carbon transaction with ID ${id} not found.`);
      }

      const deleted = await this.transactionRepo.delete(id, callerUserId, tx);

      // No department metrics update needed due to dynamic calculation

      await auditLogger.log({
        userId: callerUserId,
        action: "DELETE",
        entity: "CarbonTransaction",
        entityId: id,
        oldValue: oldState,
        newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        tx,
      });

      return deleted;
    });
  }

  /**
   * Helper method to verify if a department's current year emissions exceed its goal target,
   * and triggers warning notifications to Department Head and ESG Manager / Admin.
   */
  private async checkAndTriggerTargetNotifications(
    departmentId: string,
    year: number,
    tx: Prisma.TransactionClient,
    callerUserId: string
  ): Promise<void> {
    const department = await this.departmentRepo.findById(departmentId, tx) as any;
    if (!department) return;

    const goal = await this.goalRepo.findByDepartmentAndYear(departmentId, year, tx);
    if (!goal || goal.status === "EXCEEDED") return;

    const totalResult = await tx.carbonTransaction.aggregate({
      where: {
        departmentId,
        status: "APPROVED",
        deletedAt: null,
        transactionDate: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
      _sum: { emissions: true },
    });
    const currentEmissions = totalResult._sum.emissions || 0;

    if (currentEmissions > goal.targetEmissions) {
      // Set status to EXCEEDED
      await this.goalRepo.update(goal.id, { status: "EXCEEDED" }, tx);

      // Find all Admins & ESG Managers
      const recipients = await tx.user.findMany({
        where: {
          deletedAt: null,
          role: {
            code: { in: ["ADMIN", "ESG_MANAGER"] },
          },
        },
      });

      // Add Department Manager (Department Head) if exists
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

      // Send warning notifications
      const title = "Emissions Target Exceeded";
      const message = `Department '${department.name}' has exceeded its target limit of ${goal.targetEmissions} CO2 for the year ${year}. Current total: ${currentEmissions} CO2.`;

      for (const user of recipients) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title,
            message,
            type: "WARNING",
            createdByUserId: callerUserId,
          },
        });
      }
    }
  }
}
