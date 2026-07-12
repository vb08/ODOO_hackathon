import { Router } from "express";
import { AuthController } from "../../controllers/AuthController";
import { validate } from "../../middlewares/validate";
import { signupSchema, loginSchema, refreshSchema } from "../../validations/auth.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";

const router = Router();
const controller = new AuthController();

router.post("/signup", validate(signupSchema), asyncHandler(controller.signup));
router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.post("/refresh", validate(refreshSchema), asyncHandler(controller.refresh));

export default router;
