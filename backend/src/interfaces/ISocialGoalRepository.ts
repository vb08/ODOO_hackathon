import { Prisma, SocialGoal } from "@prisma/client";

export interface ISocialGoalRepository {
  create(data: Prisma.SocialGoalUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<SocialGoal>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<SocialGoal | null>;
  findByDepartmentAndYear(departmentId: string | null, year: number, tx?: Prisma.TransactionClient): Promise<SocialGoal | null>;
  findAll(tx?: Prisma.TransactionClient): Promise<SocialGoal[]>;
  findByDepartmentId(departmentId: string, tx?: Prisma.TransactionClient): Promise<SocialGoal[]>;
  update(id: string, data: Prisma.SocialGoalUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<SocialGoal>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<SocialGoal>;
}
