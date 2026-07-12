import { z } from "zod";

/**
 * Category request validation schemas.
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long"),
    code: z.string().min(2, "Category code must be at least 2 characters long"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long").optional(),
    code: z.string().min(2, "Category code must be at least 2 characters long").optional(),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  }),
  params: z.object({
    id: z.string().uuid("Category ID must be a valid UUID"),
  }),
});

export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Category ID must be a valid UUID"),
  }),
});
