import { z } from "zod";

const CSRStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
const ParticipationStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
const ProofStatuses = ["PENDING", "VERIFIED", "REJECTED"] as const;
const GoalStatuses = ["ACTIVE", "ACHIEVED", "EXCEEDED"] as const;

export const createCSRActivitySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description is required"),
    activityDate: z.string().datetime("Activity date must be a valid ISO DateTime string"),
    volunteerHoursEarned: z.number().min(0, "Volunteer hours earned cannot be negative"),
    status: z.enum(CSRStatuses).default("PLANNED"),
    maxParticipants: z.number().int().positive().optional().nullable(),
  }),
});

export const updateCSRActivitySchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    activityDate: z.string().datetime().optional(),
    volunteerHoursEarned: z.number().min(0).optional(),
    status: z.enum(CSRStatuses).optional(),
    maxParticipants: z.number().int().positive().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid CSR Activity ID"),
  }),
});

export const joinCSRActivitySchema = z.object({
  body: z.object({
    proofUrl: z.string().url("Proof URL must be a valid URL").optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid CSR Activity ID"),
  }),
});

export const approveParticipationSchema = z.object({
  body: z.object({
    status: z.enum(ParticipationStatuses),
    proofStatus: z.enum(ProofStatuses),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Participation ID"),
  }),
});

export const createSocialGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional().nullable(),
    targetVolunteerHours: z.number().positive("Target volunteer hours must be positive"),
    year: z.number().int().min(2000, "Year must be valid"),
    departmentId: z.string().uuid("Invalid Department ID").optional().nullable(),
    status: z.enum(GoalStatuses).default("ACTIVE"),
  }),
});

export const updateSocialGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    targetVolunteerHours: z.number().positive().optional(),
    year: z.number().int().min(2000).optional(),
    departmentId: z.string().uuid().optional().nullable(),
    status: z.enum(GoalStatuses).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Social Goal ID"),
  }),
});

export const getCSRActivityByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid CSR Activity ID"),
  }),
});

export const getSocialGoalByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Social Goal ID"),
  }),
});
