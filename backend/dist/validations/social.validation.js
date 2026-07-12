"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialGoalByIdSchema = exports.getCSRActivityByIdSchema = exports.updateSocialGoalSchema = exports.createSocialGoalSchema = exports.approveParticipationSchema = exports.joinCSRActivitySchema = exports.updateCSRActivitySchema = exports.createCSRActivitySchema = void 0;
const zod_1 = require("zod");
const CSRStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
const ParticipationStatuses = ["PENDING", "APPROVED", "REJECTED"];
const ProofStatuses = ["PENDING", "VERIFIED", "REJECTED"];
const GoalStatuses = ["ACTIVE", "ACHIEVED", "EXCEEDED"];
exports.createCSRActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        description: zod_1.z.string().min(5, "Description is required"),
        activityDate: zod_1.z.string().datetime("Activity date must be a valid ISO DateTime string"),
        volunteerHoursEarned: zod_1.z.number().min(0, "Volunteer hours earned cannot be negative"),
        status: zod_1.z.enum(CSRStatuses).default("PLANNED"),
        maxParticipants: zod_1.z.number().int().positive().optional().nullable(),
    }),
});
exports.updateCSRActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(5).optional(),
        activityDate: zod_1.z.string().datetime().optional(),
        volunteerHoursEarned: zod_1.z.number().min(0).optional(),
        status: zod_1.z.enum(CSRStatuses).optional(),
        maxParticipants: zod_1.z.number().int().positive().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid CSR Activity ID"),
    }),
});
exports.joinCSRActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        proofUrl: zod_1.z.string().url("Proof URL must be a valid URL").optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid CSR Activity ID"),
    }),
});
exports.approveParticipationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(ParticipationStatuses),
        proofStatus: zod_1.z.enum(ProofStatuses),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Participation ID"),
    }),
});
exports.createSocialGoalSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        description: zod_1.z.string().optional().nullable(),
        targetVolunteerHours: zod_1.z.number().positive("Target volunteer hours must be positive"),
        year: zod_1.z.number().int().min(2000, "Year must be valid"),
        departmentId: zod_1.z.string().uuid("Invalid Department ID").optional().nullable(),
        status: zod_1.z.enum(GoalStatuses).default("ACTIVE"),
    }),
});
exports.updateSocialGoalSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().optional().nullable(),
        targetVolunteerHours: zod_1.z.number().positive().optional(),
        year: zod_1.z.number().int().min(2000).optional(),
        departmentId: zod_1.z.string().uuid().optional().nullable(),
        status: zod_1.z.enum(GoalStatuses).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Social Goal ID"),
    }),
});
exports.getCSRActivityByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid CSR Activity ID"),
    }),
});
exports.getSocialGoalByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Social Goal ID"),
    }),
});
