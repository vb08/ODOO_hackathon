"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChallengeController_1 = require("../../controllers/gamification/ChallengeController");
const BadgeController_1 = require("../../controllers/gamification/BadgeController");
const RewardController_1 = require("../../controllers/gamification/RewardController");
const auth_1 = require("../../middlewares/auth");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const gamification_validation_1 = require("../../validations/gamification.validation");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const roles_1 = require("../../constants/roles");
const LeaderboardRepository_1 = require("../../repositories/LeaderboardRepository");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_2 = require("../../constants/roles");
const router = (0, express_1.Router)();
const challengeController = new ChallengeController_1.ChallengeController();
const badgeController = new BadgeController_1.BadgeController();
const rewardController = new RewardController_1.RewardController();
const leaderboardRepo = new LeaderboardRepository_1.LeaderboardRepository();
// Auth required
router.use(auth_1.authenticate);
// --- Leaderboard ---
router.get("/leaderboard", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const list = await leaderboardRepo.findAll();
    (0, responseFormatter_1.sendResponse)(res, roles_2.HttpStatus.OK, "Leaderboard standings retrieved successfully.", list);
}));
// --- Challenges ---
router.post("/challenges", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.createChallengeSchema), (0, asyncHandler_1.asyncHandler)(challengeController.create));
router.get("/challenges", (0, asyncHandler_1.asyncHandler)(challengeController.findAll));
router.get("/challenges/:id", (0, validate_1.validate)(gamification_validation_1.getChallengeByIdSchema), (0, asyncHandler_1.asyncHandler)(challengeController.findById));
router.put("/challenges/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.updateChallengeSchema), (0, asyncHandler_1.asyncHandler)(challengeController.update));
router.delete("/challenges/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(gamification_validation_1.getChallengeByIdSchema), (0, asyncHandler_1.asyncHandler)(challengeController.delete));
router.post("/challenges/:id/join", (0, validate_1.validate)(gamification_validation_1.joinChallengeSchema), (0, asyncHandler_1.asyncHandler)(challengeController.join));
router.post("/challenges/:id/complete", (0, validate_1.validate)(gamification_validation_1.completeChallengeSchema), (0, asyncHandler_1.asyncHandler)(challengeController.complete));
// --- Badges ---
router.post("/badges", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.createBadgeSchema), (0, asyncHandler_1.asyncHandler)(badgeController.create));
router.get("/badges", (0, asyncHandler_1.asyncHandler)(badgeController.findAll));
router.get("/badges/:id", (0, validate_1.validate)(gamification_validation_1.getBadgeByIdSchema), (0, asyncHandler_1.asyncHandler)(badgeController.findById));
router.put("/badges/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.updateBadgeSchema), (0, asyncHandler_1.asyncHandler)(badgeController.update));
router.delete("/badges/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(gamification_validation_1.getBadgeByIdSchema), (0, asyncHandler_1.asyncHandler)(badgeController.delete));
// --- Rewards ---
router.post("/rewards", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.createRewardSchema), (0, asyncHandler_1.asyncHandler)(rewardController.create));
router.get("/rewards", (0, asyncHandler_1.asyncHandler)(rewardController.findAll));
router.get("/rewards/redemptions/me", (0, asyncHandler_1.asyncHandler)(rewardController.findMyRedemptions));
router.get("/rewards/redemptions/all", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, asyncHandler_1.asyncHandler)(rewardController.findAllRedemptions));
router.get("/rewards/:id", (0, validate_1.validate)(gamification_validation_1.getRewardByIdSchema), (0, asyncHandler_1.asyncHandler)(rewardController.findById));
router.put("/rewards/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.updateRewardSchema), (0, asyncHandler_1.asyncHandler)(rewardController.update));
router.delete("/rewards/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(gamification_validation_1.getRewardByIdSchema), (0, asyncHandler_1.asyncHandler)(rewardController.delete));
router.post("/rewards/redeem", (0, validate_1.validate)(gamification_validation_1.redeemRewardSchema), (0, asyncHandler_1.asyncHandler)(rewardController.redeem));
router.put("/rewards/redemptions/:id/approve", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(gamification_validation_1.approveRedemptionSchema), (0, asyncHandler_1.asyncHandler)(rewardController.approveRedemption));
exports.default = router;
