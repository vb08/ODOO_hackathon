"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeParticipationRepository = void 0;
const db_1 = require("../database/db");
class ChallengeParticipationRepository {
    getClient(tx) {
        return tx || db_1.prisma;
    }
    async create(data, tx) {
        return this.getClient(tx).challengeParticipation.create({ data });
    }
    async findById(id, tx) {
        return this.getClient(tx).challengeParticipation.findFirst({
            where: { id, deletedAt: null },
            include: {
                challenge: true,
                employee: true,
            },
        });
    }
    async findByChallengeAndEmployee(challengeId, employeeId, tx) {
        return this.getClient(tx).challengeParticipation.findFirst({
            where: { challengeId, employeeId, deletedAt: null },
            include: {
                challenge: true,
                employee: true,
            },
        });
    }
    async findByChallengeId(challengeId, tx) {
        return this.getClient(tx).challengeParticipation.findMany({
            where: { challengeId, deletedAt: null },
            include: {
                employee: true,
            },
        });
    }
    async findByEmployeeId(employeeId, tx) {
        return this.getClient(tx).challengeParticipation.findMany({
            where: { employeeId, deletedAt: null },
            include: {
                challenge: true,
            },
        });
    }
    async findAll(tx) {
        return this.getClient(tx).challengeParticipation.findMany({
            where: { deletedAt: null },
            include: {
                challenge: true,
                employee: true,
            },
        });
    }
    async update(id, data, tx) {
        return this.getClient(tx).challengeParticipation.update({
            where: { id },
            data,
        });
    }
    async delete(id, deletedByUserId, tx) {
        return this.getClient(tx).challengeParticipation.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedByUserId,
            },
        });
    }
}
exports.ChallengeParticipationRepository = ChallengeParticipationRepository;
