import { Router } from "express";
import { HealthController } from "../../controllers/HealthController";
import { asyncHandler } from "../../middlewares/asyncHandler";

const router = Router();
const controller = new HealthController();

// Publicly accessible health check probe
router.get("/", asyncHandler(controller.check));

export default router;
