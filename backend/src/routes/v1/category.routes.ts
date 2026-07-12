import { Router } from "express";
import { CategoryController } from "../../controllers/CategoryController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
} from "../../validations/category.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const controller = new CategoryController();

// All ESG category APIs require authentication
router.use(authenticate);

router.post(
  "/",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createCategorySchema),
  asyncHandler(controller.create)
);

router.get(
  "/",
  asyncHandler(controller.findAll)
);

router.get(
  "/:id",
  validate(getCategoryByIdSchema),
  asyncHandler(controller.findById)
);

router.put(
  "/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateCategorySchema),
  asyncHandler(controller.update)
);

router.delete(
  "/:id",
  authorize([RoleCode.ADMIN]),
  validate(getCategoryByIdSchema),
  asyncHandler(controller.delete)
);

export default router;
