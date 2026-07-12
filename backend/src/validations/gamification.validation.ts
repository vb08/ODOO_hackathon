import { z } from "zod";

const ChallengeStatuses = ["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"] as const;
const RedemptionStatuses = ["PENDING", "APPROVED", "REJECTED", "DELIVERED"] as const;

export const createChallengeSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description is required"),
    baseXp: z.number().int().min(0, "Base XP cannot be negative"),
    difficultyMultiplier: z.number().min(0.1, "Multiplier must be at least 0.1"),
    completionBonus: z.number().int().min(0, "Completion bonus cannot be negative"),
    earlySubmissionBonus: z.number().int().min(0, "Early bonus cannot be negative"),
    status: z.enum(ChallengeStatuses).default("DRAFT"),
    startDate: z.string().datetime("Start date must be a valid ISO DateTime string"),
    endDate: z.string().datetime("End date must be a valid ISO DateTime string"),
  }),
});

export const updateChallengeSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    baseXp: z.number().int().min(0).optional(),
    difficultyMultiplier: z.number().min(0.1).optional(),
    completionBonus: z.number().int().min(0).optional(),
    earlySubmissionBonus: z.number().int().min(0).optional(),
    status: z.enum(ChallengeStatuses).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Challenge ID"),
  }),
});

export const joinChallengeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Challenge ID"),
  }),
});

export const completeChallengeSchema = z.object({
  body: z.object({
    proofUrl: z.string().url("Proof URL must be a valid URL").optional().nullable(),
    isEarlySubmission: z.boolean().default(false),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Challenge ID"),
  }),
});

export const createBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(5, "Description is required"),
    xpThreshold: z.number().int().positive("XP threshold must be positive"),
    iconUrl: z.string().url("Icon URL must be a valid URL").optional().nullable(),
  }),
});

export const updateBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    xpThreshold: z.number().int().positive().optional(),
    iconUrl: z.string().url().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Badge ID"),
  }),
});

export const createRewardSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description is required"),
    xpCost: z.number().int().positive("XP cost must be positive"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
  }),
});

export const updateRewardSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    xpCost: z.number().int().positive().optional(),
    stock: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Reward ID"),
  }),
});

export const redeemRewardSchema = z.object({
  body: z.object({
    rewardId: z.string().uuid("Invalid Reward ID"),
  }),
});

export const approveRedemptionSchema = z.object({
  body: z.object({
    status: z.enum(RedemptionStatuses),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Redemption ID"),
  }),
});

export const getChallengeByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Challenge ID"),
  }),
});

export const getBadgeByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Badge ID"),
  }),
});

export const getRewardByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Reward ID"),
  }),
});
