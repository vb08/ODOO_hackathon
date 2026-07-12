"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeService = void 0;
const ChallengeRepository_1 = require("../../repositories/ChallengeRepository");
const ChallengeParticipationRepository_1 = require("../../repositories/ChallengeParticipationRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const GamificationService_1 = require("./GamificationService");
const db_1 = require("../../database/db");
class ChallengeService {
    challengeRepo;
    participationRepo;
    gamificationService;
    constructor(challengeRepo = new ChallengeRepository_1.ChallengeRepository(), participationRepo = new ChallengeParticipationRepository_1.ChallengeParticipationRepository(), gamificationService = new GamificationService_1.GamificationService()) {
        this.challengeRepo = challengeRepo;
        this.participationRepo = participationRepo;
        this.gamificationService = gamificationService;
    }
    async create(dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const challenge = await this.challengeRepo.create({
                title: dto.title,
                description: dto.description,
                baseXp: dto.baseXp,
                difficultyMultiplier: dto.difficultyMultiplier,
                completionBonus: dto.completionBonus,
                earlySubmissionBonus: dto.earlySubmissionBonus,
                status: dto.status || "DRAFT",
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                createdByUserId: callerUserId,
            }, tx);
            // Log creation
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CREATE",
                entity: "Challenge",
                entityId: challenge.id,
                newValue: challenge,
                tx,
            });
            // If active, alert all employees
            if (challenge.status === "ACTIVE") {
                await this.notifyChallengeStarted(challenge, tx, callerUserId);
            }
            return challenge;
        });
    }
    async findById(id) {
        const challenge = await this.challengeRepo.findById(id);
        if (!challenge)
            throw AppError_1.AppError.notFound(`Challenge with ID ${id} not found.`);
        return challenge;
    }
    async findAll() {
        return this.challengeRepo.findAll();
    }
    async update(id, dto, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const oldState = await this.challengeRepo.findById(id, tx);
            if (!oldState)
                throw AppError_1.AppError.notFound(`Challenge with ID ${id} not found.`);
            const updated = await this.challengeRepo.update(id, {
                title: dto.title,
                description: dto.description,
                baseXp: dto.baseXp,
                difficultyMultiplier: dto.difficultyMultiplier,
                completionBonus: dto.completionBonus,
                earlySubmissionBonus: dto.earlySubmissionBonus,
                status: dto.status,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                updatedByUserId: callerUserId,
            }, tx);
            // Log update
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "UPDATE",
                entity: "Challenge",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            // Transition to active triggers notifications
            if (oldState.status !== "ACTIVE" && updated.status === "ACTIVE") {
                await this.notifyChallengeStarted(updated, tx, callerUserId);
            }
            return updated;
        });
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.challengeRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "Challenge",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
    // --- Participation Logics ---
    async join(challengeId, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.findFirst({
                where: { userId: callerUserId, deletedAt: null },
            });
            if (!employee)
                throw AppError_1.AppError.forbidden("Active employee profile required to join challenges.");
            const challenge = await this.challengeRepo.findById(challengeId, tx);
            if (!challenge)
                throw AppError_1.AppError.notFound(`Challenge with ID ${challengeId} not found.`);
            if (challenge.status !== "ACTIVE")
                throw AppError_1.AppError.badRequest("You can only join active challenges.");
            const existing = await this.participationRepo.findByChallengeAndEmployee(challengeId, employee.id, tx);
            if (existing)
                throw AppError_1.AppError.conflict("You have already joined this challenge.");
            const participation = await this.participationRepo.create({
                challengeId,
                employeeId: employee.id,
                status: "JOINED",
                createdByUserId: callerUserId,
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CHALLENGE_JOINED",
                entity: "ChallengeParticipation",
                entityId: participation.id,
                newValue: participation,
                tx,
            });
            return participation;
        });
    }
    async complete(challengeId, proofUrl, isEarly, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.findFirst({
                where: { userId: callerUserId, deletedAt: null },
            });
            if (!employee)
                throw AppError_1.AppError.forbidden("Active employee profile required.");
            const challenge = await this.challengeRepo.findById(challengeId, tx);
            if (!challenge)
                throw AppError_1.AppError.notFound(`Challenge with ID ${challengeId} not found.`);
            const participation = await this.participationRepo.findByChallengeAndEmployee(challengeId, employee.id, tx);
            if (!participation)
                throw AppError_1.AppError.notFound("You must join this challenge before completing it.");
            if (participation.status !== "JOINED")
                throw AppError_1.AppError.badRequest("Participation is already completed or failed.");
            const oldState = { ...participation };
            const updated = await this.participationRepo.update(participation.id, {
                status: "COMPLETED",
                proofUrl,
                completedAt: new Date(),
                isEarlySubmission: isEarly,
                updatedByUserId: callerUserId,
            }, tx);
            // Calculate XP score
            const basePoints = challenge.baseXp * challenge.difficultyMultiplier;
            const totalXp = Math.round(basePoints) + challenge.completionBonus + (isEarly ? challenge.earlySubmissionBonus : 0);
            // Credit XP and check badges
            await this.gamificationService.addXp(employee.id, totalXp, tx, callerUserId);
            // Log completion timeline event
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CHALLENGE_COMPLETED",
                entity: "ChallengeParticipation",
                entityId: participation.id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            // Send completion notification
            await tx.notification.create({
                data: {
                    userId: callerUserId,
                    title: "Challenge Completed!",
                    message: `You completed challenge: '${challenge.title}' and earned ${totalXp} XP!`,
                    type: "SUCCESS",
                    createdByUserId: callerUserId,
                },
            });
            return updated;
        });
    }
    async notifyChallengeStarted(challenge, tx, callerUserId) {
        const employees = await tx.employee.findMany({ where: { deletedAt: null } });
        for (const emp of employees) {
            if (emp.userId) {
                await tx.notification.create({
                    data: {
                        userId: emp.userId,
                        title: "⚔️ New Challenge Started!",
                        message: `A new ESG challenge: '${challenge.title}' is now active! Join today to earn ${challenge.baseXp} base XP.`,
                        type: "INFO",
                        createdByUserId: callerUserId,
                    },
                });
            }
        }
    }
}
exports.ChallengeService = ChallengeService;
