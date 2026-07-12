"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHelper = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Utility class for secure password cryptography.
 */
class BcryptHelper {
    static SALT_ROUNDS = 10;
    /**
     * Hashes a plain-text password using salt.
     */
    static async hash(password) {
        return bcryptjs_1.default.hash(password, this.SALT_ROUNDS);
    }
    /**
     * Compares a plain-text password with a hash.
     */
    static async compare(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
}
exports.BcryptHelper = BcryptHelper;
