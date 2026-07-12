import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export class JwtHelper {
  /**
   * Generates a new short-lived JWT Access Token.
   */
  public static generateAccessToken(payload: UserTokenPayload): string {
    return jwt.sign(payload as unknown as object, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
  }

  /**
   * Generates a long-lived JWT Refresh Token.
   */
  public static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload as unknown as object, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });
  }

  /**
   * Verifies and decodes an Access Token.
   */
  public static verifyAccessToken(token: string): UserTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as UserTokenPayload;
  }

  /**
   * Verifies and decodes a Refresh Token.
   */
  public static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  }
}
