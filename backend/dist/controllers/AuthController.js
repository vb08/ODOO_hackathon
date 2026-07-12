"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const responseFormatter_1 = require("../utils/responseFormatter");
const roles_1 = require("../constants/roles");
/**
 * Controller layer handling authentication routes.
 */
class AuthController {
    authService;
    constructor(service = new AuthService_1.AuthService()) {
        this.authService = service;
    }
    /**
     * Registers a new employee user account.
     */
    signup = async (req, res) => {
        const signupData = req.body;
        const result = await this.authService.signup({
            email: signupData.email,
            passwordHash: signupData.password, // map plain password
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            employeeId: signupData.employeeId,
        });
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "User registered successfully.", result);
    };
    /**
     * Logins user and returns session credentials.
     */
    login = async (req, res) => {
        const { email, password } = req.body;
        const result = await this.authService.login(email, password);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Login successful.", result);
    };
    /**
     * Validates refresh token and returns a new access token.
     */
    refresh = async (req, res) => {
        const { refreshToken } = req.body;
        const result = await this.authService.refresh(refreshToken);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Token refreshed successfully.", result);
    };
}
exports.AuthController = AuthController;
