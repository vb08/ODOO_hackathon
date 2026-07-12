import { Router } from "express";
import { RoleController } from "../../controllers/RoleController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const controller = new RoleController();

router.use(authenticate);

router.get(
  "/",
  authorize([RoleCode.ADMIN]),
  asyncHandler(controller.findAll)
);

export default router;
