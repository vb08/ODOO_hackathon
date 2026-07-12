"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentByIdSchema = exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
/**
 * Department request validation schemas.
 */
exports.createDepartmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Department name must be at least 2 characters long"),
        code: zod_1.z.string().min(2, "Department code must be at least 2 characters long"),
        managerId: zod_1.z.string().uuid("Manager ID must be a valid UUID").optional(),
    }),
});
exports.updateDepartmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Department name must be at least 2 characters long").optional(),
        code: zod_1.z.string().min(2, "Department code must be at least 2 characters long").optional(),
        managerId: zod_1.z.string().uuid("Manager ID must be a valid UUID").nullable().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Department ID must be a valid UUID"),
    }),
});
exports.getDepartmentByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Department ID must be a valid UUID"),
    }),
});
