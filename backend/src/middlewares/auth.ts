import { Request, Response, NextFunction } from "express";
import { JwtHelper } from "../helpers/jwt";
import { AppError } from "../utils/AppError";

/**
 * Authentication Middleware.
 * Secures routes by extracting and validating the JWT from the Authorization header.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Authentication token missing or malformed"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JwtHelper.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(AppError.unauthorized("Authentication token invalid or expired"));
  }
};
