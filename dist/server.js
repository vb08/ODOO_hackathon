"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const db_1 = require("./database/db");
const server = app_1.default.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`🚀 EcoSphere ESG Backend running in [${env_1.env.NODE_ENV}] mode on port ${env_1.env.PORT}`);
});
/**
 * Handle graceful termination signals.
 */
const handleGracefulShutdown = async (signal) => {
    logger_1.logger.warn(`${signal} received. Initiating graceful shutdown...`);
    // Close database connections
    await db_1.prisma.$disconnect();
    logger_1.logger.info("Database connection closed.");
    // Close HTTP server listener
    server.close(() => {
        logger_1.logger.info("HTTP server closed. Exiting process.");
        process.exit(0);
    });
    // Forced shutdown safety timeout
    setTimeout(() => {
        logger_1.logger.error("Forced exit due to hanging async operations.");
        process.exit(1);
    }, 5000);
};
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
/**
 * Capture unhandled promise rejections and uncaught exceptions.
 */
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error("Unhandled Promise Rejection detected:", reason.message, reason.stack || "");
    // In production, consider crashing or restarting the container
});
process.on("uncaughtException", (error) => {
    logger_1.logger.error("Uncaught Exception thrown:", error.message, error.stack || "");
    process.exit(1);
});
