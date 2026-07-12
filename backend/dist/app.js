"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./middlewares/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const AppError_1 = require("./utils/AppError");
const v1_1 = __importDefault(require("./routes/v1"));
const HealthController_1 = require("./controllers/HealthController");
const asyncHandler_1 = require("./middlewares/asyncHandler");
const app = (0, express_1.default)();
// Apply global middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_1.httpLogger);
// Global health probe endpoint mounted at root
const healthController = new HealthController_1.HealthController();
app.get("/health", (0, asyncHandler_1.asyncHandler)(healthController.check));
// Mount Version 1 APIs
app.use("/api/v1", v1_1.default);
// Catch-all route handler for undefined endpoints
app.use((_req, _res, next) => {
    next(AppError_1.AppError.notFound("The requested resource or endpoint does not exist."));
});
// Register Global Error Interceptor (must be registered last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
