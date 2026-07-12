import { Router } from "express";
import { EmployeeController } from "../../controllers/EmployeeController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeByIdSchema,
} from "../../validations/employee.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const controller = new EmployeeController();

// All employee profile APIs require authentication
router.use(authenticate);

router.post(
  "/",
  authorize([RoleCode.ADMIN]),
  validate(createEmployeeSchema),
  asyncHandler(controller.create)
);

router.get(
  "/",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(controller.findAll)
);

router.get(
  "/:id",
  validate(getEmployeeByIdSchema),
  asyncHandler(controller.findById)
);

router.put(
  "/:id",
  authorize([RoleCode.ADMIN]),
  validate(updateEmployeeSchema),
  asyncHandler(controller.update)
);

router.delete(
  "/:id",
  authorize([RoleCode.ADMIN]),
  validate(getEmployeeByIdSchema),
  asyncHandler(controller.delete)
);

export default router;
