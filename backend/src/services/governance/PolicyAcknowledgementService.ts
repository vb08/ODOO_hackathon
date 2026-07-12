import { PolicyAcknowledgement } from "@prisma/client";
import { IPolicyAcknowledgementRepository } from "../../interfaces/IPolicyAcknowledgementRepository";
import { PolicyAcknowledgementRepository } from "../../repositories/PolicyAcknowledgementRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";
import { prisma } from "../../database/db";

export class PolicyAcknowledgementService {
  private ackRepo: IPolicyAcknowledgementRepository;

  constructor(repo: IPolicyAcknowledgementRepository = new PolicyAcknowledgementRepository()) {
    this.ackRepo = repo;
  }

  public async acknowledge(id: string, callerUserId: string): Promise<PolicyAcknowledgement> {
    return prisma.$transaction(async (tx) => {
      // Find the employee profile associated with the user
      const employee = await tx.employee.findFirst({
        where: { userId: callerUserId, deletedAt: null },
      });

      if (!employee) {
        throw AppError.forbidden("A user must have an active employee profile to acknowledge policies.");
      }

      const ack = await this.ackRepo.findById(id, tx);
      if (!ack) {
        throw AppError.notFound(`Policy acknowledgement record with ID ${id} not found.`);
      }

      if (ack.employeeId !== employee.id) {
        throw AppError.forbidden("You are not authorized to acknowledge this policy on behalf of another employee.");
      }

      if (ack.status === "ACKNOWLEDGED") {
        return ack;
      }

      const oldState = { ...ack };
      const updated = await this.ackRepo.acknowledge(id, employee.id, tx);

      await auditLogger.log({
        userId: callerUserId,
        action: "ACKNOWLEDGE",
        entity: "PolicyAcknowledgement",
        entityId: id,
        oldValue: oldState,
        newValue: updated,
        tx,
      });

      return updated;
    });
  }

  public async findById(id: string): Promise<PolicyAcknowledgement> {
    const ack = await this.ackRepo.findById(id);
    if (!ack) {
      throw AppError.notFound(`Acknowledgement record with ID ${id} not found.`);
    }
    return ack;
  }

  public async findByEmployeeId(employeeId: string): Promise<PolicyAcknowledgement[]> {
    return this.ackRepo.findByEmployeeId(employeeId);
  }

  public async findByPolicyId(policyId: string): Promise<PolicyAcknowledgement[]> {
    return this.ackRepo.findByPolicyId(policyId);
  }

  public async findPendingByEmployeeId(employeeId: string): Promise<PolicyAcknowledgement[]> {
    return this.ackRepo.findPendingByEmployeeId(employeeId);
  }

  public async findAll(): Promise<PolicyAcknowledgement[]> {
    return this.ackRepo.findAll();
  }
}
