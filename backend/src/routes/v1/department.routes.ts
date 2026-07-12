import { Router } from "express";
import { DepartmentController } from "../../controllers/DepartmentController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentByIdSchema,
} from "../../validations/department.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const controller = new DepartmentController();

// All department APIs require authentication
router.use(authenticate);

router.post(
  "/",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createDepartmentSchema),
  asyncHandler(controller.create)
);

router.get(
  "/",
  asyncHandler(controller.findAll)
);

router.get(
  "/:id",
  validate(getDepartmentByIdSchema),
  asyncHandler(controller.findById)
);

router.put(
  "/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateDepartmentSchema),
  asyncHandler(controller.update)
);

router.delete(
  "/:id",
  authorize([RoleCode.ADMIN]),
  validate(getDepartmentByIdSchema),
  asyncHandler(controller.delete)
);

export default router;
