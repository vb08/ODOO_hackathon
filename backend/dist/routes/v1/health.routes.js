"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HealthController_1 = require("../../controllers/HealthController");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const router = (0, express_1.Router)();
const controller = new HealthController_1.HealthController();
// Publicly accessible health check probe
router.get("/", (0, asyncHandler_1.asyncHandler)(controller.check));
exports.default = router;
