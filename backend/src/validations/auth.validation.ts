import { z } from "zod";

/**
 * Authentication request validation schemas.
 */
export const signupSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email address is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email address is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});
