import { Request, Response } from "express";
import { GamificationService } from "../../services/gamification/GamificationService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";

export class BadgeController {
  private gamificationService: GamificationService;

  constructor(service: GamificationService = new GamificationService()) {
    this.gamificationService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const badge = await this.gamificationService.createBadge(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Badge created successfully.", badge);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const badge = await this.gamificationService.findBadgeById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Badge retrieved successfully.", badge);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const badges = await this.gamificationService.findAllBadges();
    sendResponse(res, HttpStatus.OK, "Badges retrieved successfully.", badges);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const badge = await this.gamificationService.updateBadge(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Badge updated successfully.", badge);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const badge = await this.gamificationService.deleteBadge(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Badge deleted successfully.", badge);
  };
}
