import { z } from "zod";

/**
 * Employee request validation schemas.
 */
export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z.string().min(1, "Employee ID code is required"),
    email: z.string().email("A valid email address is required"),
    phone: z.string().optional(),
    departmentId: z.string().uuid("Department ID must be a valid UUID").optional(),
    userId: z.string().uuid("User ID must be a valid UUID").optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    employeeId: z.string().min(1, "Employee ID code is required").optional(),
    email: z.string().email("A valid email address is required").optional(),
    phone: z.string().optional(),
    departmentId: z.string().uuid("Department ID must be a valid UUID").nullable().optional(),
    userId: z.string().uuid("User ID must be a valid UUID").nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Employee ID must be a valid UUID"),
  }),
});

export const getEmployeeByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Employee ID must be a valid UUID"),
  }),
});
