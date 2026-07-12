"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardByIdSchema = exports.getBadgeByIdSchema = exports.getChallengeByIdSchema = exports.approveRedemptionSchema = exports.redeemRewardSchema = exports.updateRewardSchema = exports.createRewardSchema = exports.updateBadgeSchema = exports.createBadgeSchema = exports.completeChallengeSchema = exports.joinChallengeSchema = exports.updateChallengeSchema = exports.createChallengeSchema = void 0;
const zod_1 = require("zod");
const ChallengeStatuses = ["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"];
const RedemptionStatuses = ["PENDING", "APPROVED", "REJECTED", "DELIVERED"];
exports.createChallengeSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        description: zod_1.z.string().min(5, "Description is required"),
        baseXp: zod_1.z.number().int().min(0, "Base XP cannot be negative"),
        difficultyMultiplier: zod_1.z.number().min(0.1, "Multiplier must be at least 0.1"),
        completionBonus: zod_1.z.number().int().min(0, "Completion bonus cannot be negative"),
        earlySubmissionBonus: zod_1.z.number().int().min(0, "Early bonus cannot be negative"),
        status: zod_1.z.enum(ChallengeStatuses).default("DRAFT"),
        startDate: zod_1.z.string().datetime("Start date must be a valid ISO DateTime string"),
        endDate: zod_1.z.string().datetime("End date must be a valid ISO DateTime string"),
    }),
});
exports.updateChallengeSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(5).optional(),
        baseXp: zod_1.z.number().int().min(0).optional(),
        difficultyMultiplier: zod_1.z.number().min(0.1).optional(),
        completionBonus: zod_1.z.number().int().min(0).optional(),
        earlySubmissionBonus: zod_1.z.number().int().min(0).optional(),
        status: zod_1.z.enum(ChallengeStatuses).optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Challenge ID"),
    }),
});
exports.joinChallengeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Challenge ID"),
    }),
});
exports.completeChallengeSchema = zod_1.z.object({
    body: zod_1.z.object({
        proofUrl: zod_1.z.string().url("Proof URL must be a valid URL").optional().nullable(),
        isEarlySubmission: zod_1.z.boolean().default(false),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Challenge ID"),
    }),
});
exports.createBadgeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, "Name must be at least 3 characters"),
        description: zod_1.z.string().min(5, "Description is required"),
        xpThreshold: zod_1.z.number().int().positive("XP threshold must be positive"),
        iconUrl: zod_1.z.string().url("Icon URL must be a valid URL").optional().nullable(),
    }),
});
exports.updateBadgeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(5).optional(),
        xpThreshold: zod_1.z.number().int().positive().optional(),
        iconUrl: zod_1.z.string().url().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Badge ID"),
    }),
});
exports.createRewardSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        description: zod_1.z.string().min(5, "Description is required"),
        xpCost: zod_1.z.number().int().positive("XP cost must be positive"),
        stock: zod_1.z.number().int().min(0, "Stock cannot be negative"),
    }),
});
exports.updateRewardSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(5).optional(),
        xpCost: zod_1.z.number().int().positive().optional(),
        stock: zod_1.z.number().int().min(0).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Reward ID"),
    }),
});
exports.redeemRewardSchema = zod_1.z.object({
    body: zod_1.z.object({
        rewardId: zod_1.z.string().uuid("Invalid Reward ID"),
    }),
});
exports.approveRedemptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(RedemptionStatuses),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Redemption ID"),
    }),
});
exports.getChallengeByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Challenge ID"),
    }),
});
exports.getBadgeByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Badge ID"),
    }),
});
exports.getRewardByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Reward ID"),
    }),
});
