"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeController = void 0;
const GamificationService_1 = require("../../services/gamification/GamificationService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
class BadgeController {
    gamificationService;
    constructor(service = new GamificationService_1.GamificationService()) {
        this.gamificationService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const badge = await this.gamificationService.createBadge(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Badge created successfully.", badge);
    };
    findById = async (req, res) => {
        const badge = await this.gamificationService.findBadgeById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Badge retrieved successfully.", badge);
    };
    findAll = async (_req, res) => {
        const badges = await this.gamificationService.findAllBadges();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Badges retrieved successfully.", badges);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const badge = await this.gamificationService.updateBadge(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Badge updated successfully.", badge);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const badge = await this.gamificationService.deleteBadge(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Badge deleted successfully.", badge);
    };
}
exports.BadgeController = BadgeController;
