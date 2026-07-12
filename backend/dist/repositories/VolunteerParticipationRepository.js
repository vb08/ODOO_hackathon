"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerParticipationRepository = void 0;
const db_1 = require("../database/db");
class VolunteerParticipationRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).volunteerParticipation.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).volunteerParticipation.findFirst({
            where: { id, deletedAt: null },
            include: {
                csrActivity: true,
                employee: true,
            },
        });
    }
    async findByActivityAndEmployee(activityId, employeeId, tx) {
        return this.getClient(tx).volunteerParticipation.findFirst({
            where: { csrActivityId: activityId, employeeId, deletedAt: null },
            include: {
                csrActivity: true,
                employee: true,
            },
        });
    }
    async findByActivityId(activityId, tx) {
        return this.getClient(tx).volunteerParticipation.findMany({
            where: { csrActivityId: activityId, deletedAt: null },
            include: {
                employee: true,
            },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).volunteerParticipation.findMany({
            where: { employeeId, deletedAt: null },
            include: {
                csrActivity: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).volunteerParticipation.findMany({
            where: { deletedAt: null },
            include: {
                csrActivity: true,
                employee: true,
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).volunteerParticipation.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).volunteerParticipation.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.VolunteerParticipationRepository = VolunteerParticipationRepository;
