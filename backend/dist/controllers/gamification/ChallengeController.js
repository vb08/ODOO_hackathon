"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeController = void 0;
const ChallengeService_1 = require("../../services/gamification/ChallengeService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
class ChallengeController {
    challengeService;
    constructor(service = new ChallengeService_1.ChallengeService()) {
        this.challengeService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const challenge = await this.challengeService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Challenge created successfully.", challenge);
    };
    findById = async (req, res) => {
        const challenge = await this.challengeService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Challenge retrieved successfully.", challenge);
    };
    findAll = async (_req, res) => {
        const challenges = await this.challengeService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Challenges retrieved successfully.", challenges);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const challenge = await this.challengeService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Challenge updated successfully.", challenge);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const challenge = await this.challengeService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Challenge deleted successfully.", challenge);
    };
    join = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const participation = await this.challengeService.join(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Joined challenge successfully.", participation);
    };
    complete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { proofUrl, isEarlySubmission } = req.body;
        const participation = await this.challengeService.complete(req.params.id, proofUrl, isEarlySubmission, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Challenge completed successfully.", participation);
    };
}
exports.ChallengeController = ChallengeController;
