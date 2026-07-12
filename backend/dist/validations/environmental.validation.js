"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentalByIdSchema = exports.updateEnvironmentalGoalSchema = exports.createEnvironmentalGoalSchema = exports.approveCarbonTransactionSchema = exports.updateCarbonTransactionSchema = exports.createCarbonTransactionSchema = exports.updateEmissionFactorSchema = exports.createEmissionFactorSchema = void 0;
const zod_1 = require("zod");
const AllowedSourceTypes = [
    "Electricity",
    "Diesel",
    "Petrol",
    "Natural Gas",
    "Water",
    "Waste",
    "Business Travel"
];
/**
 * EmissionFactor validations
 */
exports.createEmissionFactorSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Emission factor name must be at least 2 characters long"),
        factor: zod_1.z.number().nonnegative("Factor must be a non-negative number"),
        unit: zod_1.z.string().min(1, "Unit is required"),
        sourceType: zod_1.z.enum(AllowedSourceTypes, {
            errorMap: () => ({ message: `sourceType must be one of: ${AllowedSourceTypes.join(", ")}` }),
        }),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateEmissionFactorSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Emission factor name must be at least 2 characters long").optional(),
        factor: zod_1.z.number().nonnegative("Factor must be a non-negative number").optional(),
        unit: zod_1.z.string().min(1, "Unit is required").optional(),
        sourceType: zod_1.z.enum(AllowedSourceTypes).optional(),
        description: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Emission factor ID must be a valid UUID"),
    }),
});
/**
 * CarbonTransaction validations
 */
exports.createCarbonTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        departmentId: zod_1.z.string().uuid("Department ID must be a valid UUID"),
        emissionFactorId: zod_1.z.string().uuid("Emission factor ID must be a valid UUID"),
        quantity: zod_1.z.number().nonnegative("Quantity must be a non-negative number"),
        evidenceUrl: zod_1.z.string().url("Evidence URL must be a valid URL").optional().or(zod_1.z.literal("")),
        transactionDate: zod_1.z.string().datetime({ message: "Transaction date must be a valid ISO DateTime string" }).optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateCarbonTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        departmentId: zod_1.z.string().uuid("Department ID must be a valid UUID").optional(),
        emissionFactorId: zod_1.z.string().uuid("Emission factor ID must be a valid UUID").optional(),
        quantity: zod_1.z.number().nonnegative("Quantity must be a non-negative number").optional(),
        evidenceUrl: zod_1.z.string().url("Evidence URL must be a valid URL").optional().or(zod_1.z.literal("")),
        transactionDate: zod_1.z.string().datetime({ message: "Transaction date must be a valid ISO DateTime string" }).optional(),
        description: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Carbon transaction ID must be a valid UUID"),
    }),
});
exports.approveCarbonTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["APPROVED", "REJECTED"], {
            errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
        }),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Carbon transaction ID must be a valid UUID"),
    }),
});
/**
 * EnvironmentalGoal validations
 */
exports.createEnvironmentalGoalSchema = zod_1.z.object({
    body: zod_1.z.object({
        departmentId: zod_1.z.string().uuid("Department ID must be a valid UUID"),
        targetEmissions: zod_1.z.number().nonnegative("Target emissions must be a non-negative number"),
        year: zod_1.z.number().int().min(2000, "Year must be 2000 or greater").max(2100, "Year must be 2100 or less"),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateEnvironmentalGoalSchema = zod_1.z.object({
    body: zod_1.z.object({
        departmentId: zod_1.z.string().uuid("Department ID must be a valid UUID").optional(),
        targetEmissions: zod_1.z.number().nonnegative("Target emissions must be a non-negative number").optional(),
        year: zod_1.z.number().int().min(2000).max(2100).optional(),
        description: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Environmental goal ID must be a valid UUID"),
    }),
});
exports.getEnvironmentalByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("ID must be a valid UUID"),
    }),
});
