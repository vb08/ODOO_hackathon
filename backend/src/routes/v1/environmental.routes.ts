import { Router } from "express";
import { EmissionFactorController } from "../../controllers/environmental/EmissionFactorController";
import { CarbonTransactionController } from "../../controllers/environmental/CarbonTransactionController";
import { EnvironmentalGoalController } from "../../controllers/environmental/EnvironmentalGoalController";
import { EnvironmentalDashboardController } from "../../controllers/environmental/EnvironmentalDashboardController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createEmissionFactorSchema,
  updateEmissionFactorSchema,
  createCarbonTransactionSchema,
  updateCarbonTransactionSchema,
  approveCarbonTransactionSchema,
  createEnvironmentalGoalSchema,
  updateEnvironmentalGoalSchema,
  getEnvironmentalByIdSchema,
} from "../../validations/environmental.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const factorController = new EmissionFactorController();
const transactionController = new CarbonTransactionController();
const goalController = new EnvironmentalGoalController();
const dashboardController = new EnvironmentalDashboardController();

// All environmental endpoints require authentication
router.use(authenticate);

// --------------------------------------------------
// Dashboard Endpoints
// --------------------------------------------------
router.get(
  "/dashboard/summary",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(dashboardController.getSummary)
);

router.get(
  "/dashboard/department/:departmentId",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(dashboardController.getDepartmentProgress)
);

// --------------------------------------------------
// Emission Factor Endpoints
// --------------------------------------------------
router.post(
  "/factors",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createEmissionFactorSchema),
  asyncHandler(factorController.create)
);

router.get(
  "/factors",
  asyncHandler(factorController.findAll)
);

router.get(
  "/factors/:id",
  validate(getEnvironmentalByIdSchema),
  asyncHandler(factorController.findById)
);

router.put(
  "/factors/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateEmissionFactorSchema),
  asyncHandler(factorController.update)
);

router.delete(
  "/factors/:id",
  authorize([RoleCode.ADMIN]),
  validate(getEnvironmentalByIdSchema),
  asyncHandler(factorController.delete)
);

// --------------------------------------------------
// Carbon Transaction Endpoints
// --------------------------------------------------
router.post(
  "/transactions",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(createCarbonTransactionSchema),
  asyncHandler(transactionController.create)
);

router.get(
  "/transactions",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(transactionController.findAll)
);

router.get(
  "/transactions/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(getEnvironmentalByIdSchema),
  asyncHandler(transactionController.findById)
);

router.put(
  "/transactions/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(updateCarbonTransactionSchema),
  asyncHandler(transactionController.update)
);

router.post(
  "/transactions/:id/approve",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(approveCarbonTransactionSchema),
  asyncHandler(transactionController.approve)
);

router.delete(
  "/transactions/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(getEnvironmentalByIdSchema),
  asyncHandler(transactionController.delete)
);

// --------------------------------------------------
// Environmental Goal Endpoints
// --------------------------------------------------
router.post(
  "/goals",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createEnvironmentalGoalSchema),
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
  validate(getEnvironmentalByIdSchema),
  asyncHandler(goalController.findById)
);

router.put(
  "/goals/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateEnvironmentalGoalSchema),
  asyncHandler(goalController.update)
);

router.delete(
  "/goals/:id",
  authorize([RoleCode.ADMIN]),
  validate(getEnvironmentalByIdSchema),
  asyncHandler(goalController.delete)
);

export default router;
