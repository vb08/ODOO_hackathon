import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { sendResponse } from "../utils/responseFormatter";
import { HttpStatus } from "../constants/roles";

/**
 * Controller layer handling authentication routes.
 */
export class AuthController {
  private authService: AuthService;

  constructor(service: AuthService = new AuthService()) {
    this.authService = service;
  }

  /**
   * Registers a new employee user account.
   */
  public signup = async (req: Request, res: Response): Promise<void> => {
    const signupData = req.body;
    const result = await this.authService.signup({
      email: signupData.email,
      passwordHash: signupData.password, // map plain password
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      employeeId: signupData.employeeId,
    });

    sendResponse(res, HttpStatus.CREATED, "User registered successfully.", result);
  };

  /**
   * Logins user and returns session credentials.
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);

    sendResponse(res, HttpStatus.OK, "Login successful.", result);
  };

  /**
   * Validates refresh token and returns a new access token.
   */
  public refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await this.authService.refresh(refreshToken);

    sendResponse(res, HttpStatus.OK, "Token refreshed successfully.", result);
  };
}
