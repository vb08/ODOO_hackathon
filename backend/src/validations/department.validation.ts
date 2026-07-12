import { z } from "zod";

/**
 * Department request validation schemas.
 */
export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Department name must be at least 2 characters long"),
    code: z.string().min(2, "Department code must be at least 2 characters long"),
    managerId: z.string().uuid("Manager ID must be a valid UUID").optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Department name must be at least 2 characters long").optional(),
    code: z.string().min(2, "Department code must be at least 2 characters long").optional(),
    managerId: z.string().uuid("Manager ID must be a valid UUID").nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Department ID must be a valid UUID"),
  }),
});

export const getDepartmentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Department ID must be a valid UUID"),
  }),
});
