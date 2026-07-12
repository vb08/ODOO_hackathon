"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: zod_1.z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(8, "JWT_ACCESS_SECRET must be at least 8 characters long"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(8, "JWT_REFRESH_SECRET must be at least 8 characters long"),
    JWT_ACCESS_EXPIRY: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRY: zod_1.z.string().default("7d"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment configuration:", parsedEnv.error.format());
    process.exit(1);
}
exports.env = parsedEnv.data;
