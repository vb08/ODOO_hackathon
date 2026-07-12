import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

// Prevent multiple instances of Prisma Client in development mode
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ],
  });

// Setup logging hooks for Prisma query logs in development mode
if (process.env.NODE_ENV !== "production") {
  (prisma as unknown as { $on: (event: string, callback: (e: { query: string }) => void) => void }).$on("query", (e) => {
    logger.debug(`Prisma Query: ${e.query}`);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
