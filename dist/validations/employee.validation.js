"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeeByIdSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
/**
 * Employee request validation schemas.
 */
exports.createEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, "First name is required"),
        lastName: zod_1.z.string().min(1, "Last name is required"),
        employeeId: zod_1.z.string().min(1, "Employee ID code is required"),
        email: zod_1.z.string().email("A valid email address is required"),
        phone: zod_1.z.string().optional(),
        departmentId: zod_1.z.string().uuid("Department ID must be a valid UUID").optional(),
        userId: zod_1.z.string().uuid("User ID must be a valid UUID").optional(),
    }),
});
exports.updateEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, "First name is required").optional(),
        lastName: zod_1.z.string().min(1, "Last name is required").optional(),
        employeeId: zod_1.z.string().min(1, "Employee ID code is required").optional(),
        email: zod_1.z.string().email("A valid email address is required").optional(),
        phone: zod_1.z.string().optional(),
        departmentId: zod_1.z.string().uuid("Department ID must be a valid UUID").nullable().optional(),
        userId: zod_1.z.string().uuid("User ID must be a valid UUID").nullable().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Employee ID must be a valid UUID"),
    }),
});
exports.getEmployeeByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Employee ID must be a valid UUID"),
    }),
});
