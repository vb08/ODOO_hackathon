import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

/**
 * Role-Based Access Control (RBAC) Authorization Middleware.
 * RESTRICTS route execution to users possessing at least one of the specified allowed roles.
 * Must be executed AFTER the authenticate middleware.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required for authorization check"));
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return next(AppError.forbidden("Access denied: Insufficient privileges"));
    }

    next();
  };
};
