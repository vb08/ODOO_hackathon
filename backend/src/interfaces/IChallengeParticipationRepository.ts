import { Prisma, ChallengeParticipation } from "@prisma/client";

export interface IChallengeParticipationRepository {
  create(data: Prisma.ChallengeParticipationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation | null>;
  findByChallengeAndEmployee(challengeId: string, employeeId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation | null>;
  findByChallengeId(challengeId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation[]>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation[]>;
  findAll(tx?: Prisma.TransactionClient): Promise<ChallengeParticipation[]>;
  update(id: string, data: Prisma.ChallengeParticipationUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation>;
}
