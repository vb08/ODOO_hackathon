"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
// Prevent multiple instances of Prisma Client in development mode
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "info" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
        ],
    });
// Setup logging hooks for Prisma query logs in development mode
if (process.env.NODE_ENV !== "production") {
    exports.prisma.$on("query", (e) => {
        logger_1.logger.debug(`Prisma Query: ${e.query}`);
    });
}
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
