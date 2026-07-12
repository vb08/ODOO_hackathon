import { Request, Response } from "express";
import { RewardService } from "../../services/gamification/RewardService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class RewardController {
  private rewardService: RewardService;

  constructor(service: RewardService = new RewardService()) {
    this.rewardService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const reward = await this.rewardService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Reward created successfully.", reward);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const reward = await this.rewardService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Reward retrieved successfully.", reward);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const rewards = await this.rewardService.findAll();
    sendResponse(res, HttpStatus.OK, "Rewards retrieved successfully.", rewards);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const reward = await this.rewardService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Reward updated successfully.", reward);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const reward = await this.rewardService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Reward deleted successfully.", reward);
  };

  // --- Redemptions ---

  public redeem = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { rewardId } = req.body;
    const redemption = await this.rewardService.redeem(rewardId, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Reward redeemed successfully. Redemption is PENDING approval.", redemption);
  };

  public approveRedemption = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { status } = req.body;
    const redemption = await this.rewardService.approveRedemption(req.params.id, status, req.user.userId);
    sendResponse(res, HttpStatus.OK, `Redemption request has been marked as ${status.toLowerCase()}.`, redemption);
  };

  public findMyRedemptions = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.userId, deletedAt: null },
    });
    if (!employee) throw AppError.notFound("Employee profile not found.");

    const redemptions = await this.rewardService.findRedemptionsByEmployee(employee.id);
    sendResponse(res, HttpStatus.OK, "Your reward redemptions retrieved successfully.", redemptions);
  };

  public findAllRedemptions = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let redemptions;
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      redemptions = await this.rewardService.findAllRedemptions();
    } else {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "All reward redemptions retrieved.", redemptions);
  };
}
