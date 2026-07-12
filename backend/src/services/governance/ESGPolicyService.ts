import { ESGPolicy, Prisma } from "@prisma/client";
import { IESGPolicyRepository } from "../../interfaces/IESGPolicyRepository";
import { IPolicyAcknowledgementRepository } from "../../interfaces/IPolicyAcknowledgementRepository";
import { ESGPolicyRepository } from "../../repositories/ESGPolicyRepository";
import { PolicyAcknowledgementRepository } from "../../repositories/PolicyAcknowledgementRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export interface CreateESGPolicyDto {
  title: string;
  code: string;
  content: string;
  effectiveDate?: string;
  version?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

export interface UpdateESGPolicyDto {
  title?: string;
  code?: string;
  content?: string;
  effectiveDate?: string;
  version?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

export class ESGPolicyService {
  private policyRepo: IESGPolicyRepository;
  private ackRepo: IPolicyAcknowledgementRepository;

  constructor(
    policyRepo: IESGPolicyRepository = new ESGPolicyRepository(),
    ackRepo: IPolicyAcknowledgementRepository = new PolicyAcknowledgementRepository()
  ) {
    this.policyRepo = policyRepo;
    this.ackRepo = ackRepo;
  }

  public async create(dto: CreateESGPolicyDto, callerUserId: string): Promise<ESGPolicy> {
    return prisma.$transaction(async (tx) => {
      const existing = await this.policyRepo.findByCode(dto.code, tx);
      if (existing) {
        throw AppError.conflict(`Policy with code ${dto.code} already exists.`);
      }

      const policy = await this.policyRepo.create(
        {
          title: dto.title,
          code: dto.code,
          content: dto.content,
          effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
          version: dto.version || "1.0",
          status: dto.status || "DRAFT",
          createdByUserId: callerUserId,
        },
        tx
      );

      // If created directly in ACTIVE status, auto-generate acknowledgements
      if (policy.status === "ACTIVE") {
        await this.generateAcknowledgements(policy.id, tx);
      }

      await auditLogger.log({
        userId: callerUserId,
        action: "CREATE",
        entity: "ESGPolicy",
        entityId: policy.id,
        newValue: policy,
        tx,
      });

      return policy;
    });
  }

  public async findById(id: string): Promise<ESGPolicy> {
    const policy = await this.policyRepo.findById(id);
    if (!policy) {
      throw AppError.notFound(`Policy with ID ${id} not found.`);
    }
    return policy;
  }

  public async findByCode(code: string): Promise<ESGPolicy> {
    const policy = await this.policyRepo.findByCode(code);
    if (!policy) {
      throw AppError.notFound(`Policy with code ${code} not found.`);
    }
    return policy;
  }

  public async findAll(): Promise<ESGPolicy[]> {
    return this.policyRepo.findAll();
  }

  public async update(id: string, dto: UpdateESGPolicyDto, callerUserId: string): Promise<ESGPolicy> {
    return prisma.$transaction(async (tx) => {
      const oldState = await this.policyRepo.findById(id, tx);
      if (!oldState) {
        throw AppError.notFound(`Policy with ID ${id} not found.`);
      }

      if (dto.code && dto.code !== oldState.code) {
        const existing = await this.policyRepo.findByCode(dto.code, tx);
        if (existing) {
          throw AppError.conflict(`Policy with code ${dto.code} already exists.`);
        }
      }

      const updated = await this.policyRepo.update(
        id,
        {
          title: dto.title,
          code: dto.code,
          content: dto.content,
          effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
          version: dto.version,
          status: dto.status,
          updatedByUserId: callerUserId,
        },
        tx
      );

      // Trigger acknowledgements if transitioned from DRAFT to ACTIVE
      if (oldState.status !== "ACTIVE" && updated.status === "ACTIVE") {
        await this.generateAcknowledgements(updated.id, tx);
        
        await auditLogger.log({
          userId: callerUserId,
          action: "PUBLISH",
          entity: "ESGPolicy",
          entityId: id,
          oldValue: oldState,
          newValue: updated,
          tx,
        });
      } else {
        await auditLogger.log({
          userId: callerUserId,
          action: "UPDATE",
          entity: "ESGPolicy",
          entityId: id,
          oldValue: oldState,
          newValue: updated,
          tx,
        });
      }

      return updated;
    });
  }

  public async delete(id: string, callerUserId: string): Promise<ESGPolicy> {
    const oldState = await this.findById(id);
    const deleted = await this.policyRepo.delete(id, callerUserId);

    await auditLogger.log({
      userId: callerUserId,
      action: "DELETE",
      entity: "ESGPolicy",
      entityId: id,
      oldValue: oldState,
      newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
    });

    return deleted;
  }

  private async generateAcknowledgements(policyId: string, tx: Prisma.TransactionClient): Promise<void> {
    // Fetch all active employees
    const employees = await tx.employee.findMany({
      where: { deletedAt: null },
    });

    if (employees.length === 0) return;

    const data = employees.map((emp) => ({
      policyId,
      employeeId: emp.id,
      status: "PENDING",
    }));

    await this.ackRepo.createMany(data, tx);

    // Create a policy reminder notification for each employee
    for (const emp of employees) {
      if (emp.userId) {
        await tx.notification.create({
          data: {
            userId: emp.userId,
            title: "New Policy Acknowledgement Required",
            message: `A new ESG Policy (ID: ${policyId}) has been published. Please read and acknowledge it.`,
            type: "INFO",
          },
        });
      }
    }
  }
}
