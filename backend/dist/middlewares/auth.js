"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../helpers/jwt");
const AppError_1 = require("../utils/AppError");
/**
 * Authentication Middleware.
 * Secures routes by extracting and validating the JWT from the Authorization header.
 */
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(AppError_1.AppError.unauthorized("Authentication token missing or malformed"));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt_1.JwtHelper.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(AppError_1.AppError.unauthorized("Authentication token invalid or expired"));
    }
};
exports.authenticate = authenticate;
