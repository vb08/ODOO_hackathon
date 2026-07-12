import { Prisma, Leaderboard } from "@prisma/client";

export interface ILeaderboardRepository {
  upsert(employeeId: string, xp: number, rank: number, tx?: Prisma.TransactionClient): Promise<Leaderboard>;
  findAll(tx?: Prisma.TransactionClient): Promise<Leaderboard[]>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<Leaderboard | null>;
  clearAll(tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
  createMany(data: Prisma.LeaderboardUncheckedCreateInput[], tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
