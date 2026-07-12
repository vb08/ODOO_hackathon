/**
 * Custom console logging utility for EcoSphere ERP.
 * Standardizes log format with timestamps and levels.
 */
export const logger = {
  info: (message: string, ...optionalParams: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [INFO] : ${message}`, ...optionalParams);
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    console.warn(`[${new Date().toISOString()}] [WARN] : ⚠️ ${message}`, ...optionalParams);
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    console.error(`[${new Date().toISOString()}] [ERROR]: ❌ ${message}`, ...optionalParams);
  },
  debug: (message: string, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[${new Date().toISOString()}] [DEBUG]: 🔍 ${message}`, ...optionalParams);
    }
  },
};
