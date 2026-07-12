import { Router } from "express";
import { CSRActivityController } from "../../controllers/social/CSRActivityController";
import { SocialGoalController } from "../../controllers/social/SocialGoalController";
import { GamificationDashboardController } from "../../controllers/social/GamificationDashboardController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createCSRActivitySchema,
  updateCSRActivitySchema,
  joinCSRActivitySchema,
  approveParticipationSchema,
  createSocialGoalSchema,
  updateSocialGoalSchema,
  getCSRActivityByIdSchema,
  getSocialGoalByIdSchema,
} from "../../validations/social.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const csrController = new CSRActivityController();
const goalController = new SocialGoalController();
const dashboardController = new GamificationDashboardController();

// Auth required
router.use(authenticate);

// --- Dashboard ---
router.get(
  "/dashboard/summary",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(dashboardController.getSummary)
);

// --- CSR Activities ---
router.post(
  "/activities",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createCSRActivitySchema),
  asyncHandler(csrController.create)
);

router.get(
  "/activities",
  asyncHandler(csrController.findAll)
);

router.get(
  "/activities/participations/me",
  asyncHandler(csrController.findMyParticipations)
);

router.get(
  "/activities/participations/all",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(csrController.findAllParticipations)
);

router.get(
  "/activities/:id",
  validate(getCSRActivityByIdSchema),
  asyncHandler(csrController.findById)
);

router.put(
  "/activities/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateCSRActivitySchema),
  asyncHandler(csrController.update)
);

router.delete(
  "/activities/:id",
  authorize([RoleCode.ADMIN]),
  validate(getCSRActivityByIdSchema),
  asyncHandler(csrController.delete)
);

router.post(
  "/activities/:id/join",
  validate(joinCSRActivitySchema),
  asyncHandler(csrController.join)
);

router.post(
  "/activities/:id/proof",
  asyncHandler(csrController.uploadProof)
);

router.put(
  "/activities/participations/:id/approve",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(approveParticipationSchema),
  asyncHandler(csrController.approveParticipation)
);

// --- Social Goals ---
router.post(
  "/goals",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createSocialGoalSchema),
  asyncHandler(goalController.create)
);

router.get(
  "/goals",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(goalController.findAll)
);

router.get(
  "/goals/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(getSocialGoalByIdSchema),
  asyncHandler(goalController.findById)
);

router.put(
  "/goals/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateSocialGoalSchema),
  asyncHandler(goalController.update)
);

router.delete(
  "/goals/:id",
  authorize([RoleCode.ADMIN]),
  validate(getSocialGoalByIdSchema),
  asyncHandler(goalController.delete)
);

export default router;
