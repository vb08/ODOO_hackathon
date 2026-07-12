import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { httpLogger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/AppError";
import v1Router from "./routes/v1";
import { HealthController } from "./controllers/HealthController";
import { asyncHandler } from "./middlewares/asyncHandler";
import swaggerDocument from "./docs/swagger.json";

const app = express();

// Apply global middlewares
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Swagger Documentation API JSON and Interactive UI endpoints
app.get("/api/v1/swagger.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(swaggerDocument);
});

app.get("/api-docs", (_req: Request, res: Response) => {
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
