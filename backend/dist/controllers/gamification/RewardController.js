"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardController = void 0;
const RewardService_1 = require("../../services/gamification/RewardService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class RewardController {
    rewardService;
    constructor(service = new RewardService_1.RewardService()) {
        this.rewardService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const reward = await this.rewardService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Reward created successfully.", reward);
    };
    findById = async (req, res) => {
        const reward = await this.rewardService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Reward retrieved successfully.", reward);
    };
    findAll = async (_req, res) => {
        const rewards = await this.rewardService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Rewards retrieved successfully.", rewards);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const reward = await this.rewardService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Reward updated successfully.", reward);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const reward = await this.rewardService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Reward deleted successfully.", reward);
    };
    // --- Redemptions ---
    redeem = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { rewardId } = req.body;
        const redemption = await this.rewardService.redeem(rewardId, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Reward redeemed successfully. Redemption is PENDING approval.", redemption);
    };
    approveRedemption = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { status } = req.body;
        const redemption = await this.rewardService.approveRedemption(req.params.id, status, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, `Redemption request has been marked as ${status.toLowerCase()}.`, redemption);
    };
    findMyRedemptions = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const employee = await db_1.prisma.employee.findFirst({
            where: { userId: req.user.userId, deletedAt: null },
        });
        if (!employee)
            throw AppError_1.AppError.notFound("Employee profile not found.");
        const redemptions = await this.rewardService.findRedemptionsByEmployee(employee.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Your reward redemptions retrieved successfully.", redemptions);
    };
    findAllRedemptions = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let redemptions;
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            redemptions = await this.rewardService.findAllRedemptions();
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "All reward redemptions retrieved.", redemptions);
    };
}
exports.RewardController = RewardController;
