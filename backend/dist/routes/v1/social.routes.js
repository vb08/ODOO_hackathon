"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CSRActivityController_1 = require("../../controllers/social/CSRActivityController");
const SocialGoalController_1 = require("../../controllers/social/SocialGoalController");
const GamificationDashboardController_1 = require("../../controllers/social/GamificationDashboardController");
const auth_1 = require("../../middlewares/auth");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const social_validation_1 = require("../../validations/social.validation");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
const csrController = new CSRActivityController_1.CSRActivityController();
const goalController = new SocialGoalController_1.SocialGoalController();
const dashboardController = new GamificationDashboardController_1.GamificationDashboardController();
// Auth required
router.use(auth_1.authenticate);
// --- Dashboard ---
router.get("/dashboard/summary", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(dashboardController.getSummary));
// --- CSR Activities ---
router.post("/activities", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(social_validation_1.createCSRActivitySchema), (0, asyncHandler_1.asyncHandler)(csrController.create));
router.get("/activities", (0, asyncHandler_1.asyncHandler)(csrController.findAll));
router.get("/activities/participations/me", (0, asyncHandler_1.asyncHandler)(csrController.findMyParticipations));
router.get("/activities/participations/all", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(csrController.findAllParticipations));
router.get("/activities/:id", (0, validate_1.validate)(social_validation_1.getCSRActivityByIdSchema), (0, asyncHandler_1.asyncHandler)(csrController.findById));
router.put("/activities/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(social_validation_1.updateCSRActivitySchema), (0, asyncHandler_1.asyncHandler)(csrController.update));
router.delete("/activities/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(social_validation_1.getCSRActivityByIdSchema), (0, asyncHandler_1.asyncHandler)(csrController.delete));
router.post("/activities/:id/join", (0, validate_1.validate)(social_validation_1.joinCSRActivitySchema), (0, asyncHandler_1.asyncHandler)(csrController.join));
router.post("/activities/:id/proof", (0, asyncHandler_1.asyncHandler)(csrController.uploadProof));
router.put("/activities/participations/:id/approve", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(social_validation_1.approveParticipationSchema), (0, asyncHandler_1.asyncHandler)(csrController.approveParticipation));
// --- Social Goals ---
router.post("/goals", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(social_validation_1.createSocialGoalSchema), (0, asyncHandler_1.asyncHandler)(goalController.create));
router.get("/goals", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(goalController.findAll));
router.get("/goals/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(social_validation_1.getSocialGoalByIdSchema), (0, asyncHandler_1.asyncHandler)(goalController.findById));
router.put("/goals/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(social_validation_1.updateSocialGoalSchema), (0, asyncHandler_1.asyncHandler)(goalController.update));
router.delete("/goals/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(social_validation_1.getSocialGoalByIdSchema), (0, asyncHandler_1.asyncHandler)(goalController.delete));
exports.default = router;
