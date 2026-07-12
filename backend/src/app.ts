import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { httpLogger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/AppError";
import v1Router from "./routes/v1";
import { HealthController } from "./controllers/HealthController";
import { asyncHandler } from "./middlewares/asyncHandler";

const app = express();

// Apply global middlewares
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Global health probe endpoint mounted at root
const healthController = new HealthController();
app.get("/health", asyncHandler(healthController.check));

// Mount Version 1 APIs
app.use("/api/v1", v1Router);

// Catch-all route handler for undefined endpoints
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(AppError.notFound("The requested resource or endpoint does not exist."));
});

// Register Global Error Interceptor (must be registered last)
app.use(errorHandler);

export default app;
