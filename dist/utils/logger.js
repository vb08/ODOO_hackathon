"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Custom console logging utility for EcoSphere ERP.
 * Standardizes log format with timestamps and levels.
 */
exports.logger = {
    info: (message, ...optionalParams) => {
        console.log(`[${new Date().toISOString()}] [INFO] : ${message}`, ...optionalParams);
    },
    warn: (message, ...optionalParams) => {
        console.warn(`[${new Date().toISOString()}] [WARN] : ⚠️ ${message}`, ...optionalParams);
    },
    error: (message, ...optionalParams) => {
        console.error(`[${new Date().toISOString()}] [ERROR]: ❌ ${message}`, ...optionalParams);
    },
    debug: (message, ...optionalParams) => {
        if (process.env.NODE_ENV !== "production") {
            console.log(`[${new Date().toISOString()}] [DEBUG]: 🔍 ${message}`, ...optionalParams);
        }
    },
};
