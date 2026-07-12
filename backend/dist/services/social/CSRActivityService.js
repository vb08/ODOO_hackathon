"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRActivityService = void 0;
const CSRActivityRepository_1 = require("../../repositories/CSRActivityRepository");
const VolunteerParticipationRepository_1 = require("../../repositories/VolunteerParticipationRepository");
const SocialGoalRepository_1 = require("../../repositories/SocialGoalRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
const GamificationService_1 = require("../gamification/GamificationService");
const db_1 = require("../../database/db");
class CSRActivityService {
    csrRepo;
    participationRepo;
    goalRepo;
    gamificationService;
    constructor(csrRepo = new CSRActivityRepository_1.CSRActivityRepository(), participationRepo = new VolunteerParticipationRepository_1.VolunteerParticipationRepository(), goalRepo = new SocialGoalRepository_1.SocialGoalRepository(), gamificationService = new GamificationService_1.GamificationService()) {
        this.csrRepo = csrRepo;
        this.participationRepo = participationRepo;
        this.goalRepo = goalRepo;
        this.gamificationService = gamificationService;
    }
    async create(dto, callerUserId) {
        const activity = await this.csrRepo.create({
            title: dto.title,
            description: dto.description,
            activityDate: new Date(dto.activityDate),
            volunteerHoursEarned: dto.volunteerHoursEarned,
            status: dto.status || "PLANNED",
            maxParticipants: dto.maxParticipants,
            createdByUserId: callerUserId,
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "CSRActivity",
            entityId: activity.id,
            newValue: activity,
        });
        return activity;
    }
    async findById(id) {
        const activity = await this.csrRepo.findById(id);
        if (!activity)
            throw AppError_1.AppError.notFound(`CSR Activity with ID ${id} not found.`);
        return activity;
    }
    async findAll() {
        return this.csrRepo.findAll();
    }
    async update(id, dto, callerUserId) {
        const oldState = await this.findById(id);
        const updated = await this.csrRepo.update(id, {
            ...dto,
            activityDate: dto.activityDate ? new Date(dto.activityDate) : undefined,
            updatedByUserId: callerUserId,
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "CSRActivity",
            entityId: id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.csrRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "CSRActivity",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
    // --- Volunteer Participation ---
    async join(activityId, proofUrl, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.findFirst({
                where: { userId: callerUserId, deletedAt: null },
            });
            if (!employee)
                throw AppError_1.AppError.forbidden("Active employee profile required to join CSR activities.");
            const activity = await this.csrRepo.findById(activityId, tx);
            if (!activity)
                throw AppError_1.AppError.notFound(`CSR Activity with ID ${activityId} not found.`);
            // Check max participants limit
            if (activity.maxParticipants) {
                const activeCount = activity.participations.length;
                if (activeCount >= activity.maxParticipants) {
                    throw AppError_1.AppError.conflict("This CSR Activity has reached its maximum participant limit.");
                }
            }
            const existing = await this.participationRepo.findByActivityAndEmployee(activityId, employee.id, tx);
            if (existing)
                throw AppError_1.AppError.conflict("You have already joined this CSR activity.");
            const participation = await this.participationRepo.create({
                csrActivityId: activityId,
                employeeId: employee.id,
                status: "PENDING",
                proofUrl,
                proofStatus: "PENDING",
                hoursEarned: 0.0, // Credited only after verification
                createdByUserId: callerUserId,
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CSR_JOINED",
                entity: "VolunteerParticipation",
                entityId: participation.id,
                newValue: participation,
                tx,
            });
            return participation;
        });
    }
    async uploadProof(participationId, proofUrl, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.findFirst({
                where: { userId: callerUserId, deletedAt: null },
            });
            if (!employee)
                throw AppError_1.AppError.forbidden("Active employee profile required.");
            const participation = await this.participationRepo.findById(participationId, tx);
            if (!participation)
                throw AppError_1.AppError.notFound(`Volunteer participation record with ID ${participationId} not found.`);
            if (participation.employeeId !== employee.id) {
                throw AppError_1.AppError.forbidden("You can only upload proof for your own participations.");
            }
            const oldState = { ...participation };
            const updated = await this.participationRepo.update(participationId, {
                proofUrl,
                proofStatus: "PENDING",
            }, tx);
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: "CSR_PROOF_UPLOADED",
                entity: "VolunteerParticipation",
                entityId: participationId,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    async approveParticipation(id, status, proofStatus, callerUserId) {
        return db_1.prisma.$transaction(async (tx) => {
            const participation = await this.participationRepo.findById(id, tx);
            if (!participation)
                throw AppError_1.AppError.notFound(`Participation record with ID ${id} not found.`);
            if (participation.status === "APPROVED")
                throw AppError_1.AppError.badRequest("Participation is already approved.");
            const oldState = { ...participation };
            const activity = participation.csrActivity;
            const employee = participation.employee;
            let hoursEarned = 0.0;
            if (status === "APPROVED" && proofStatus === "VERIFIED") {
                hoursEarned = activity.volunteerHoursEarned;
            }
            const updated = await this.participationRepo.update(id, {
                status,
                proofStatus,
                hoursEarned,
                acknowledgedAt: new Date(),
                updatedByUserId: callerUserId,
            }, tx);
            if (status === "APPROVED" && proofStatus === "VERIFIED") {
                // Credit employee volunteer hours
                await tx.employee.update({
                    where: { id: employee.id },
                    data: { volunteerHours: { increment: hoursEarned } },
                });
                // Credit XP (10 XP per volunteer hour)
                const xpEarned = Math.round(hoursEarned * 10);
                await this.gamificationService.addXp(employee.id, xpEarned, tx, callerUserId);
                // Recheck Department Social Goals
                if (employee.departmentId) {
                    await this.checkAndTriggerSocialGoalAchievements(employee.departmentId, activity.activityDate.getFullYear(), tx, callerUserId);
                }
                // Notify Employee
                if (employee.userId) {
                    await tx.notification.create({
                        data: {
                            userId: employee.userId,
                            title: "CSR Participation Verified! 🎉",
                            message: `Your participation in '${activity.title}' has been verified! Earned ${hoursEarned} hours and ${xpEarned} XP.`,
                            type: "SUCCESS",
                            createdByUserId: callerUserId,
                        },
                    });
                }
            }
            await ActivityLogService_1.auditLogger.log({
                userId: callerUserId,
                action: `CSR_PARTICIPATION_${status}`,
                entity: "VolunteerParticipation",
                entityId: id,
                oldValue: oldState,
                newValue: updated,
                tx,
            });
            return updated;
        });
    }
    async findParticipationsByEmployee(employeeId) {
        return this.participationRepo.findByEmployeeId(employeeId);
    }
    async findAllParticipations() {
        return this.participationRepo.findAll();
    }
    /**
     * Recalculates dynamic social goal compliance for a department
     */
    async checkAndTriggerSocialGoalAchievements(departmentId, year, tx, callerUserId) {
        const goal = await this.goalRepo.findByDepartmentAndYear(departmentId, year, tx);
        if (!goal || goal.status === "ACHIEVED")
            return;
        // Sum approved volunteer hours for department employees
        const goalResult = await tx.volunteerParticipation.aggregate({
            where: {
                status: "APPROVED",
                proofStatus: "VERIFIED",
                deletedAt: null,
                employee: {
                    departmentId,
                },
                csrActivity: {
                    activityDate: {
                        gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        lte: new Date(`${year}-12-31T23:59:59.999Z`),
                    },
                },
            },
            _sum: { hoursEarned: true },
        });
        const currentHours = goalResult._sum.hoursEarned || 0.0;
        if (currentHours >= goal.targetVolunteerHours) {
            await this.goalRepo.update(goal.id, { status: "ACHIEVED" }, tx);
            // Find ESG Officers and Department Head
            const recipients = await tx.user.findMany({
                where: {
                    deletedAt: null,
                    role: {
                        code: { in: ["ADMIN", "ESG_MANAGER"] },
                    },
                },
            });
            const department = await tx.department.findFirst({ where: { id: departmentId } });
            const deptName = department ? department.name : "Unknown";
            const title = "Social Goal Achieved!";
            const message = `Department '${deptName}' has successfully reached its target goal of ${goal.targetVolunteerHours} volunteer hours for the year ${year}.`;
            for (const admin of recipients) {
                await tx.notification.create({
                    data: {
                        userId: admin.id,
                        title,
                        message,
                        type: "SUCCESS",
                        createdByUserId: callerUserId,
                    },
                });
            }
        }
    }
}
exports.CSRActivityService = CSRActivityService;
