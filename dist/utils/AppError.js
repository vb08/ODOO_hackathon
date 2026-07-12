"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const roles_1 = require("../constants/roles");
/**
 * Custom application-level error class.
 * Centralizes error data mapping, facilitating standardized JSON output.
 */
class AppError extends Error {
    statusCode;
    errors;
    constructor(message, statusCode = roles_1.HttpStatus.INTERNAL_SERVER_ERROR, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        // Set the prototype explicitly to maintain correct inheritance chain
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errors) {
        return new AppError(message, roles_1.HttpStatus.BAD_REQUEST, errors);
    }
    static unauthorized(message = "Unauthorized access") {
        return new AppError(message, roles_1.HttpStatus.UNAUTHORIZED);
    }
    static forbidden(message = "Access forbidden") {
        return new AppError(message, roles_1.HttpStatus.FORBIDDEN);
    }
    static notFound(message = "Resource not found") {
        return new AppError(message, roles_1.HttpStatus.NOT_FOUND);
    }
    static conflict(message) {
        return new AppError(message, roles_1.HttpStatus.CONFLICT);
    }
    static internal(message = "Internal server error") {
        return new AppError(message, roles_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.AppError = AppError;
