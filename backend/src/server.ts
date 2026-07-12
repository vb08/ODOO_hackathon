import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./database/db";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 EcoSphere ESG Backend running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
});

/**
 * Handle graceful termination signals.
 */
const handleGracefulShutdown = async (signal: string) => {
  logger.warn(`${signal} received. Initiating graceful shutdown...`);
  
  // Close database connections
  await prisma.$disconnect();
  logger.info("Database connection closed.");

  // Close HTTP server listener
  server.close(() => {
    logger.info("HTTP server closed. Exiting process.");
    process.exit(0);
  });

  // Forced shutdown safety timeout
  setTimeout(() => {
    logger.error("Forced exit due to hanging async operations.");
    process.exit(1);
  }, 5000);
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

/**
 * Capture unhandled promise rejections and uncaught exceptions.
 */
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Promise Rejection detected:", reason.message, reason.stack || "");
  // In production, consider crashing or restarting the container
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception thrown:", error.message, error.stack || "");
  process.exit(1);
});
