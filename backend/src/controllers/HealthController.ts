import { Request, Response } from "express";
import { prisma } from "../database/db";
import { sendResponse } from "../utils/responseFormatter";
import { HttpStatus } from "../constants/roles";

/**
 * Health check controller.
 * Probes database connectivity for system diagnostics.
 */
export class HealthController {
  public check = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Execute a simple query to assert database connectivity
      await prisma.$queryRaw`SELECT 1`;

      sendResponse(res, HttpStatus.OK, "Health check completed.", {
        status: "OK",
        database: "Connected",
      });
    } catch (error) {
      sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "Health check failed.", {
        status: "ERROR",
        database: "Disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
