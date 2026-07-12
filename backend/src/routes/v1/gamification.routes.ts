import { Router } from "express";
import { ChallengeController } from "../../controllers/gamification/ChallengeController";
import { BadgeController } from "../../controllers/gamification/BadgeController";
import { RewardController } from "../../controllers/gamification/RewardController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createChallengeSchema,
  updateChallengeSchema,
  joinChallengeSchema,
  completeChallengeSchema,
  createBadgeSchema,
  updateBadgeSchema,
  createRewardSchema,
  updateRewardSchema,
  redeemRewardSchema,
  approveRedemptionSchema,
  getChallengeByIdSchema,
  getBadgeByIdSchema,
  getRewardByIdSchema,
} from "../../validations/gamification.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";
import { LeaderboardRepository } from "../../repositories/LeaderboardRepository";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";

const router = Router();
const challengeController = new ChallengeController();
const badgeController = new BadgeController();
const rewardController = new RewardController();
const leaderboardRepo = new LeaderboardRepository();

// Auth required
router.use(authenticate);

// --- Leaderboard ---
router.get(
  "/leaderboard",
  asyncHandler(async (_req, res) => {
    const list = await leaderboardRepo.findAll();
    sendResponse(res, HttpStatus.OK, "Leaderboard standings retrieved successfully.", list);
  })
);

// --- Challenges ---
router.post(
  "/challenges",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createChallengeSchema),
  asyncHandler(challengeController.create)
);

router.get(
  "/challenges",
  asyncHandler(challengeController.findAll)
);

router.get(
  "/challenges/:id",
  validate(getChallengeByIdSchema),
  asyncHandler(challengeController.findById)
);

router.put(
  "/challenges/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateChallengeSchema),
  asyncHandler(challengeController.update)
);

router.delete(
  "/challenges/:id",
  authorize([RoleCode.ADMIN]),
  validate(getChallengeByIdSchema),
  asyncHandler(challengeController.delete)
);

router.post(
  "/challenges/:id/join",
  validate(joinChallengeSchema),
  asyncHandler(challengeController.join)
);

router.post(
  "/challenges/:id/complete",
  validate(completeChallengeSchema),
  asyncHandler(challengeController.complete)
);

// --- Badges ---
router.post(
  "/badges",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createBadgeSchema),
  asyncHandler(badgeController.create)
);

router.get(
  "/badges",
  asyncHandler(badgeController.findAll)
);

router.get(
  "/badges/:id",
  validate(getBadgeByIdSchema),
  asyncHandler(badgeController.findById)
);

router.put(
  "/badges/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateBadgeSchema),
  asyncHandler(badgeController.update)
);

router.delete(
  "/badges/:id",
  authorize([RoleCode.ADMIN]),
  validate(getBadgeByIdSchema),
  asyncHandler(badgeController.delete)
);

// --- Rewards ---
router.post(
  "/rewards",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createRewardSchema),
  asyncHandler(rewardController.create)
);

router.get(
  "/rewards",
  asyncHandler(rewardController.findAll)
);

router.get(
  "/rewards/redemptions/me",
  asyncHandler(rewardController.findMyRedemptions)
);

router.get(
  "/rewards/redemptions/all",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  asyncHandler(rewardController.findAllRedemptions)
);

router.get(
  "/rewards/:id",
  validate(getRewardByIdSchema),
  asyncHandler(rewardController.findById)
);

router.put(
  "/rewards/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateRewardSchema),
  asyncHandler(rewardController.update)
);

router.delete(
  "/rewards/:id",
  authorize([RoleCode.ADMIN]),
  validate(getRewardByIdSchema),
  asyncHandler(rewardController.delete)
);

router.post(
  "/rewards/redeem",
  validate(redeemRewardSchema),
  asyncHandler(rewardController.redeem)
);

router.put(
  "/rewards/redemptions/:id/approve",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(approveRedemptionSchema),
  asyncHandler(rewardController.approveRedemption)
);

export default router;
