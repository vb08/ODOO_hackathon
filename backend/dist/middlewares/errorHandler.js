"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const roles_1 = require("../constants/roles");
/**
 * Global Express Error Handling Middleware.
 * Standardizes outbound errors to prevent stack trace leaks and formats responses.
 */
const errorHandler = (err, _req, res, _next) => {
    logger_1.logger.error(`Error intercepted: ${err.message}`, err.stack);
    // Handle known application errors (validation, forbidden, not found, etc.)
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || null,
        });
    }
    // Handle Prisma Database Errors
    if (err.name === "PrismaClientKnownRequestError") {
        // Cast to access Prisma specific code properties
        const prismaError = err;
        if (prismaError.code === "P2002") {
            const target = prismaError.meta?.target?.join(", ") || "field";
            return res.status(roles_1.HttpStatus.CONFLICT).json({
                success: false,
                message: `Unique constraint failed: A record with this value for ${target} already exists.`,
                errors: null,
            });
        }
        if (prismaError.code === "P2025") {
            return res.status(roles_1.HttpStatus.NOT_FOUND).json({
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
    return res.status(roles_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: responseMsg,
        errors: null,
    });
};
exports.errorHandler = errorHandler;
