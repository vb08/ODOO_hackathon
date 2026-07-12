import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { HttpStatus } from "../constants/roles";

/**
 * Global Express Error Handling Middleware.
 * Standardizes outbound errors to prevent stack trace leaks and formats responses.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error(`Error intercepted: ${err.message}`, err.stack);

  // Handle known application errors (validation, forbidden, not found, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Handle Prisma Database Errors
  if (err.name === "PrismaClientKnownRequestError") {
    // Cast to access Prisma specific code properties
    const prismaError = err as unknown as { code: string; meta?: Record<string, unknown> };
    
    if (prismaError.code === "P2002") {
      const target = (prismaError.meta?.target as string[])?.join(", ") || "field";
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: `Unique constraint failed: A record with this value for ${target} already exists.`,
        errors: null,
      });
    }

    if (prismaError.code === "P2025") {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: err.message || "Record not found in the database.",
        errors: null,
      });
    }
  }

  // Fallback for general unhandled exceptions
  const responseMsg = process.env.NODE_ENV === "production" 
    ? "Internal Server Error" 
    : err.message;

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: responseMsg,
    errors: null,
  });
};
