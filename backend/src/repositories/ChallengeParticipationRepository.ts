import { Prisma, ChallengeParticipation } from "@prisma/client";
import { IChallengeParticipationRepository } from "../interfaces/IChallengeParticipationRepository";
import { prisma } from "../database/db";

export class ChallengeParticipationRepository implements IChallengeParticipationRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.ChallengeParticipationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation> {
    return this.getClient(tx).challengeParticipation.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation | null> {
    return this.getClient(tx).challengeParticipation.findFirst({
      where: { id, deletedAt: null },
      include: {
        challenge: true,
        employee: true,
      },
    });
  }

  public async findByChallengeAndEmployee(challengeId: string, employeeId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation | null> {
    return this.getClient(tx).challengeParticipation.findFirst({
      where: { challengeId, employeeId, deletedAt: null },
      include: {
        challenge: true,
        employee: true,
      },
    });
  }

  public async findByChallengeId(challengeId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation[]> {
    return this.getClient(tx).challengeParticipation.findMany({
      where: { challengeId, deletedAt: null },
      include: {
        employee: true,
      },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation[]> {
    return this.getClient(tx).challengeParticipation.findMany({
      where: { employeeId, deletedAt: null },
      include: {
        challenge: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<ChallengeParticipation[]> {
    return this.getClient(tx).challengeParticipation.findMany({
      where: { deletedAt: null },
      include: {
        challenge: true,
        employee: true,
      },
    });
  }

  public async update(id: string, data: Prisma.ChallengeParticipationUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation> {
    return this.getClient(tx).challengeParticipation.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<ChallengeParticipation> {
    return this.getClient(tx).challengeParticipation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
