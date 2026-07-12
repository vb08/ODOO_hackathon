import { Prisma, PolicyAcknowledgement } from "@prisma/client";
import { IPolicyAcknowledgementRepository } from "../interfaces/IPolicyAcknowledgementRepository";
import { prisma } from "../database/db";

export class PolicyAcknowledgementRepository implements IPolicyAcknowledgementRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async createMany(data: Prisma.PolicyAcknowledgementUncheckedCreateInput[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    return this.getClient(tx).policyAcknowledgement.createMany({ data, skipDuplicates: true });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement | null> {
    return this.getClient(tx).policyAcknowledgement.findFirst({
      where: { id, deletedAt: null },
      include: {
        policy: true,
        employee: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]> {
    return this.getClient(tx).policyAcknowledgement.findMany({
      where: { deletedAt: null },
      include: {
        policy: true,
        employee: true,
      },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]> {
    return this.getClient(tx).policyAcknowledgement.findMany({
      where: { employeeId, deletedAt: null },
      include: {
        policy: true,
        employee: true,
      },
    });
  }

  public async findByPolicyId(policyId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]> {
    return this.getClient(tx).policyAcknowledgement.findMany({
      where: { policyId, deletedAt: null },
      include: {
        policy: true,
        employee: true,
      },
    });
  }

  public async findPendingByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]> {
    return this.getClient(tx).policyAcknowledgement.findMany({
      where: { employeeId, status: "PENDING", deletedAt: null },
      include: {
        policy: true,
      },
    });
  }

  public async update(id: string, data: Prisma.PolicyAcknowledgementUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement> {
    return this.getClient(tx).policyAcknowledgement.update({
      where: { id },
      data,
    });
  }

  public async acknowledge(id: string, employeeId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement> {
    return this.getClient(tx).policyAcknowledgement.update({
      where: { id, employeeId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
      },
    });
  }
}
