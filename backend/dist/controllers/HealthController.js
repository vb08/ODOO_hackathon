"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const db_1 = require("../database/db");
const responseFormatter_1 = require("../utils/responseFormatter");
const roles_1 = require("../constants/roles");
/**
 * Health check controller.
 * Probes database connectivity for system diagnostics.
 */
class HealthController {
    check = async (_req, res) => {
        try {
            // Execute a simple query to assert database connectivity
            await db_1.prisma.$queryRaw `SELECT 1`;
            (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Health check completed.", {
                status: "OK",
                database: "Connected",
            });
        }
        catch (error) {
            (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.INTERNAL_SERVER_ERROR, "Health check failed.", {
                status: "ERROR",
                database: "Disconnected",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
}
exports.HealthController = HealthController;
