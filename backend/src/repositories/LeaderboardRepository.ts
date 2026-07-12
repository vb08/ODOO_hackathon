import { Prisma, Leaderboard } from "@prisma/client";
import { ILeaderboardRepository } from "../interfaces/ILeaderboardRepository";
import { prisma } from "../database/db";

export class LeaderboardRepository implements ILeaderboardRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async upsert(employeeId: string, xp: number, rank: number, tx?: Prisma.TransactionClient): Promise<Leaderboard> {
    return this.getClient(tx).leaderboard.upsert({
      where: { employeeId },
      update: { xp, rank },
      create: { employeeId, xp, rank },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<Leaderboard[]> {
    return this.getClient(tx).leaderboard.findMany({
      orderBy: { rank: "asc" },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<Leaderboard | null> {
    return this.getClient(tx).leaderboard.findUnique({
      where: { employeeId },
      include: {
        employee: true,
      },
    });
  }

  public async clearAll(tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    return this.getClient(tx).leaderboard.deleteMany({});
  }

  public async createMany(data: Prisma.LeaderboardUncheckedCreateInput[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    return this.getClient(tx).leaderboard.createMany({ data });
  }
}
