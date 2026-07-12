import { Prisma, VolunteerParticipation } from "@prisma/client";
import { IVolunteerParticipationRepository } from "../interfaces/IVolunteerParticipationRepository";
import { prisma } from "../database/db";

export class VolunteerParticipationRepository implements IVolunteerParticipationRepository {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(data: Prisma.VolunteerParticipationUncheckedCreateInput, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation> {
    return this.getClient(tx).volunteerParticipation.create({ data });
  }

  public async findById(id: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation | null> {
    return this.getClient(tx).volunteerParticipation.findFirst({
      where: { id, deletedAt: null },
      include: {
        csrActivity: true,
        employee: true,
      },
    });
  }

  public async findByActivityAndEmployee(activityId: string, employeeId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation | null> {
    return this.getClient(tx).volunteerParticipation.findFirst({
      where: { csrActivityId: activityId, employeeId, deletedAt: null },
      include: {
        csrActivity: true,
        employee: true,
      },
    });
  }

  public async findByActivityId(activityId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation[]> {
    return this.getClient(tx).volunteerParticipation.findMany({
      where: { csrActivityId: activityId, deletedAt: null },
      include: {
        employee: true,
      },
    });
  }

  public async findByEmployeeId(employeeId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation[]> {
    return this.getClient(tx).volunteerParticipation.findMany({
      where: { employeeId, deletedAt: null },
      include: {
        csrActivity: true,
      },
    });
  }

  public async findAll(tx?: Prisma.TransactionClient): Promise<VolunteerParticipation[]> {
    return this.getClient(tx).volunteerParticipation.findMany({
      where: { deletedAt: null },
      include: {
        csrActivity: true,
        employee: true,
      },
    });
  }

  public async update(id: string, data: Prisma.VolunteerParticipationUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation> {
    return this.getClient(tx).volunteerParticipation.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, deletedByUserId: string, tx?: Prisma.TransactionClient): Promise<VolunteerParticipation> {
    return this.getClient(tx).volunteerParticipation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }
}
