"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const logger_1 = require("../utils/logger");
/**
 * Express middleware for intercepting and logging incoming HTTP requests.
 * Records HTTP method, route, final status code, and response time metrics.
 */
const httpLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    // Wait for the response to finish writing to calculate duration
    res.on("finish", () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
        if (statusCode >= 500) {
            logger_1.logger.error(message);
        }
        else if (statusCode >= 400) {
            logger_1.logger.warn(message);
        }
        else {
            logger_1.logger.info(message);
        }
    });
    next();
};
exports.httpLogger = httpLogger;
