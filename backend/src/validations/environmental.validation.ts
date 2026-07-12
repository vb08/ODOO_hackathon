import { z } from "zod";

const AllowedSourceTypes = [
  "Electricity",
  "Diesel",
  "Petrol",
  "Natural Gas",
  "Water",
  "Waste",
  "Business Travel"
] as const;

/**
 * EmissionFactor validations
 */
export const createEmissionFactorSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Emission factor name must be at least 2 characters long"),
    factor: z.number().nonnegative("Factor must be a non-negative number"),
    unit: z.string().min(1, "Unit is required"),
    sourceType: z.enum(AllowedSourceTypes, {
      errorMap: () => ({ message: `sourceType must be one of: ${AllowedSourceTypes.join(", ")}` }),
    }),
    description: z.string().optional(),
  }),
});

export const updateEmissionFactorSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Emission factor name must be at least 2 characters long").optional(),
    factor: z.number().nonnegative("Factor must be a non-negative number").optional(),
    unit: z.string().min(1, "Unit is required").optional(),
    sourceType: z.enum(AllowedSourceTypes).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Emission factor ID must be a valid UUID"),
  }),
});

/**
 * CarbonTransaction validations
 */
export const createCarbonTransactionSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid("Department ID must be a valid UUID"),
    emissionFactorId: z.string().uuid("Emission factor ID must be a valid UUID"),
    quantity: z.number().nonnegative("Quantity must be a non-negative number"),
    evidenceUrl: z.string().url("Evidence URL must be a valid URL").optional().or(z.literal("")),
    transactionDate: z.string().datetime({ message: "Transaction date must be a valid ISO DateTime string" }).optional(),
    description: z.string().optional(),
  }),
});

export const updateCarbonTransactionSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid("Department ID must be a valid UUID").optional(),
    emissionFactorId: z.string().uuid("Emission factor ID must be a valid UUID").optional(),
    quantity: z.number().nonnegative("Quantity must be a non-negative number").optional(),
    evidenceUrl: z.string().url("Evidence URL must be a valid URL").optional().or(z.literal("")),
    transactionDate: z.string().datetime({ message: "Transaction date must be a valid ISO DateTime string" }).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Carbon transaction ID must be a valid UUID"),
  }),
});

export const approveCarbonTransactionSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"], {
      errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
    }),
  }),
  params: z.object({
    id: z.string().uuid("Carbon transaction ID must be a valid UUID"),
  }),
});

/**
 * EnvironmentalGoal validations
 */
export const createEnvironmentalGoalSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid("Department ID must be a valid UUID"),
    targetEmissions: z.number().nonnegative("Target emissions must be a non-negative number"),
    year: z.number().int().min(2000, "Year must be 2000 or greater").max(2100, "Year must be 2100 or less"),
    description: z.string().optional(),
  }),
});

export const updateEnvironmentalGoalSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid("Department ID must be a valid UUID").optional(),
    targetEmissions: z.number().nonnegative("Target emissions must be a non-negative number").optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Environmental goal ID must be a valid UUID"),
  }),
});

export const getEnvironmentalByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});
