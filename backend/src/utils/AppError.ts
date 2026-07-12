import { HttpStatus } from "../constants/roles";

/**
 * Custom application-level error class.
 * Centralizes error data mapping, facilitating standardized JSON output.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Set the prototype explicitly to maintain correct inheritance chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown) {
    return new AppError(message, HttpStatus.BAD_REQUEST, errors);
  }

  static unauthorized(message: string = "Unauthorized access") {
    return new AppError(message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message: string = "Access forbidden") {
    return new AppError(message, HttpStatus.FORBIDDEN);
  }

  static notFound(message: string = "Resource not found") {
    return new AppError(message, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(message, HttpStatus.CONFLICT);
  }

  static internal(message: string = "Internal server error") {
    return new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
