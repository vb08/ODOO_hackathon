import { Response } from "express";
import { HttpStatus } from "../constants/roles";

/**
 * Standardized API Response interface.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Formats and sends standard API response wrappers.
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: HttpStatus,
  message: string,
  data?: T
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };
  return res.status(statusCode).json(responsePayload);
};
