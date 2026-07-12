import { Request, Response } from "express";
import { ChallengeService } from "../../services/gamification/ChallengeService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";

export class ChallengeController {
  private challengeService: ChallengeService;

  constructor(service: ChallengeService = new ChallengeService()) {
    this.challengeService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const challenge = await this.challengeService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Challenge created successfully.", challenge);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const challenge = await this.challengeService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Challenge retrieved successfully.", challenge);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const challenges = await this.challengeService.findAll();
    sendResponse(res, HttpStatus.OK, "Challenges retrieved successfully.", challenges);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const challenge = await this.challengeService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Challenge updated successfully.", challenge);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const challenge = await this.challengeService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Challenge deleted successfully.", challenge);
  };

  public join = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const participation = await this.challengeService.join(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Joined challenge successfully.", participation);
  };

  public complete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { proofUrl, isEarlySubmission } = req.body;
    const participation = await this.challengeService.complete(req.params.id, proofUrl, isEarlySubmission, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Challenge completed successfully.", participation);
  };
}
