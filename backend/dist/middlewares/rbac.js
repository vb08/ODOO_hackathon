"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../utils/AppError");
/**
 * Role-Based Access Control (RBAC) Authorization Middleware.
 * RESTRICTS route execution to users possessing at least one of the specified allowed roles.
 * Must be executed AFTER the authenticate middleware.
 */
const authorize = (allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(AppError_1.AppError.unauthorized("Authentication required for authorization check"));
        }
        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            return next(AppError_1.AppError.forbidden("Access denied: Insufficient privileges"));
        }
        next();
    };
};
exports.authorize = authorize;
