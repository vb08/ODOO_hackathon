import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Express middleware for intercepting and logging incoming HTTP requests.
 * Records HTTP method, route, final status code, and response time metrics.
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Wait for the response to finish writing to calculate duration
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
    
    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};
