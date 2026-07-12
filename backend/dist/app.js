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
const swagger_json_1 = __importDefault(require("./docs/swagger.json"));
const app = (0, express_1.default)();
// Apply global middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_1.httpLogger);
// Swagger Documentation API JSON and Interactive UI endpoints
app.get("/api/v1/swagger.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(swagger_json_1.default);
});
app.get("/api-docs", (_req, res) => {
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EcoSphere ESG Platform - API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow: -margin-y; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"> </script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/v1/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
  `;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(swaggerHtml);
});
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
