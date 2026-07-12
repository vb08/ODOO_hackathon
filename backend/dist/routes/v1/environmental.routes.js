"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EmissionFactorController_1 = require("../../controllers/environmental/EmissionFactorController");
const CarbonTransactionController_1 = require("../../controllers/environmental/CarbonTransactionController");
const EnvironmentalGoalController_1 = require("../../controllers/environmental/EnvironmentalGoalController");
const EnvironmentalDashboardController_1 = require("../../controllers/environmental/EnvironmentalDashboardController");
const auth_1 = require("../../middlewares/auth");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const environmental_validation_1 = require("../../validations/environmental.validation");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
const factorController = new EmissionFactorController_1.EmissionFactorController();
const transactionController = new CarbonTransactionController_1.CarbonTransactionController();
const goalController = new EnvironmentalGoalController_1.EnvironmentalGoalController();
const dashboardController = new EnvironmentalDashboardController_1.EnvironmentalDashboardController();
// All environmental endpoints require authentication
router.use(auth_1.authenticate);
// --------------------------------------------------
// Dashboard Endpoints
// --------------------------------------------------
router.get("/dashboard/summary", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(dashboardController.getSummary));
router.get("/dashboard/department/:departmentId", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(dashboardController.getDepartmentProgress));
// --------------------------------------------------
// Emission Factor Endpoints
// --------------------------------------------------
router.post("/factors", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(environmental_validation_1.createEmissionFactorSchema), (0, asyncHandler_1.asyncHandler)(factorController.create));
router.get("/factors", (0, asyncHandler_1.asyncHandler)(factorController.findAll));
router.get("/factors/:id", (0, validate_1.validate)(environmental_validation_1.getEnvironmentalByIdSchema), (0, asyncHandler_1.asyncHandler)(factorController.findById));
router.put("/factors/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(environmental_validation_1.updateEmissionFactorSchema), (0, asyncHandler_1.asyncHandler)(factorController.update));
router.delete("/factors/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(environmental_validation_1.getEnvironmentalByIdSchema), (0, asyncHandler_1.asyncHandler)(factorController.delete));
// --------------------------------------------------
// Carbon Transaction Endpoints
// --------------------------------------------------
router.post("/transactions", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(environmental_validation_1.createCarbonTransactionSchema), (0, asyncHandler_1.asyncHandler)(transactionController.create));
router.get("/transactions", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(transactionController.findAll));
router.get("/transactions/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(environmental_validation_1.getEnvironmentalByIdSchema), (0, asyncHandler_1.asyncHandler)(transactionController.findById));
router.put("/transactions/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(environmental_validation_1.updateCarbonTransactionSchema), (0, asyncHandler_1.asyncHandler)(transactionController.update));
router.post("/transactions/:id/approve", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(environmental_validation_1.approveCarbonTransactionSchema), (0, asyncHandler_1.asyncHandler)(transactionController.approve));
router.delete("/transactions/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(environmental_validation_1.getEnvironmentalByIdSchema), (0, asyncHandler_1.asyncHandler)(transactionController.delete));
// --------------------------------------------------
// Environmental Goal Endpoints
// --------------------------------------------------
router.post("/goals", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(environmental_validation_1.createEnvironmentalGoalSchema), (0, asyncHandler_1.asyncHandler)(goalController.create));
router.get("/goals", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(goalController.findAll));
router.get("/goals/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(environmental_validation_1.getEnvironmentalByIdSchema), (0, asyncHandler_1.asyncHandler)(goalController.findById));
router.put("/goals/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(environmental_validation_1.updateEnvironmentalGoalSchema), (0, asyncHandler_1.asyncHandler)(goalController.update));
router.delete("/goals/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(environmental_validation_1.getEnvironmentalByIdSchema), (0, asyncHandler_1.asyncHandler)(goalController.delete));
exports.default = router;
