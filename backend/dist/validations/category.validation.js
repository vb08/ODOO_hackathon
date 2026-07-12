"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryByIdSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
/**
 * Category request validation schemas.
 */
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Category name must be at least 2 characters long"),
        code: zod_1.z.string().min(2, "Category code must be at least 2 characters long"),
        description: zod_1.z.string().max(500, "Description cannot exceed 500 characters").optional(),
    }),
});
exports.updateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Category name must be at least 2 characters long").optional(),
        code: zod_1.z.string().min(2, "Category code must be at least 2 characters long").optional(),
        description: zod_1.z.string().max(500, "Description cannot exceed 500 characters").optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Category ID must be a valid UUID"),
    }),
});
exports.getCategoryByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Category ID must be a valid UUID"),
    }),
});
