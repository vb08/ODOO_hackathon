import { Prisma, PolicyAcknowledgement } from "@prisma/client";

export interface IPolicyAcknowledgementRepository {
  createMany(data: Prisma.PolicyAcknowledgementUncheckedCreateInput[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]>;
  findByPolicyId(policyId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]>;
  findPendingByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement[]>;
  update(id: string, data: Prisma.PolicyAcknowledgementUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement>;
  acknowledge(id: string, employeeId: string, tx?: Prisma.TransactionClient): Promise<PolicyAcknowledgement>;
}
