"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
class JwtHelper {
    /**
     * Generates a new short-lived JWT Access Token.
     */
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
        });
    }
    /**
     * Generates a long-lived JWT Refresh Token.
     */
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
            expiresIn: env_1.env.JWT_REFRESH_EXPIRY,
        });
    }
    /**
     * Verifies and decodes an Access Token.
     */
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
    }
    /**
     * Verifies and decodes a Refresh Token.
     */
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    }
}
exports.JwtHelper = JwtHelper;
