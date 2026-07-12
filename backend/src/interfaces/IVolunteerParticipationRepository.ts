import { Prisma, VolunteerParticipation } from "@prisma/client";

export interface IVolunteerParticipationRepository {
  create(data: Prisma.VolunteerParticipationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation | null>;
  findByActivityAndEmployee(activityId: string, employeeId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation | null>;
  findByActivityId(activityId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation[]>;
  findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation[]>;
  findAll(tx?: Prisma.TransactionClient): Promise<VolunteerParticipation[]>;
  update(id: string, data: Prisma.VolunteerParticipationUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation>;
  delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation>;
}
