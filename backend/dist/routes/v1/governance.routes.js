"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ESGPolicyController_1 = require("../../controllers/governance/ESGPolicyController");
const PolicyAcknowledgementController_1 = require("../../controllers/governance/PolicyAcknowledgementController");
const AuditController_1 = require("../../controllers/governance/AuditController");
const ComplianceIssueController_1 = require("../../controllers/governance/ComplianceIssueController");
const GovernanceDashboardController_1 = require("../../controllers/governance/GovernanceDashboardController");
const auth_1 = require("../../middlewares/auth");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const governance_validation_1 = require("../../validations/governance.validation");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
const policyController = new ESGPolicyController_1.ESGPolicyController();
const ackController = new PolicyAcknowledgementController_1.PolicyAcknowledgementController();
const auditController = new AuditController_1.AuditController();
const issueController = new ComplianceIssueController_1.ComplianceIssueController();
const dashboardController = new GovernanceDashboardController_1.GovernanceDashboardController();
// All governance endpoints require authentication
router.use(auth_1.authenticate);
// --------------------------------------------------
// Dashboard Endpoints
// --------------------------------------------------
router.get("/dashboard/summary", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(dashboardController.getSummary));
// --------------------------------------------------
// Policy Endpoints
// --------------------------------------------------
router.post("/policies", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.createESGPolicySchema), (0, asyncHandler_1.asyncHandler)(policyController.create));
router.get("/policies", (0, asyncHandler_1.asyncHandler)(policyController.findAll));
router.get("/policies/:id", (0, validate_1.validate)(governance_validation_1.getESGPolicyByIdSchema), (0, asyncHandler_1.asyncHandler)(policyController.findById));
router.put("/policies/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.updateESGPolicySchema), (0, asyncHandler_1.asyncHandler)(policyController.update));
router.delete("/policies/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(governance_validation_1.getESGPolicyByIdSchema), (0, asyncHandler_1.asyncHandler)(policyController.delete));
// --------------------------------------------------
// Policy Acknowledgement Endpoints
// --------------------------------------------------
router.post("/acknowledgements/:id/acknowledge", (0, validate_1.validate)(governance_validation_1.acknowledgePolicySchema), (0, asyncHandler_1.asyncHandler)(ackController.acknowledge));
router.get("/acknowledgements", (0, asyncHandler_1.asyncHandler)(ackController.findAll));
router.get("/acknowledgements/:id", (0, asyncHandler_1.asyncHandler)(ackController.findById));
// --------------------------------------------------
// Audit Endpoints
// --------------------------------------------------
router.post("/audits", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.createAuditSchema), (0, asyncHandler_1.asyncHandler)(auditController.create));
router.get("/audits", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, asyncHandler_1.asyncHandler)(auditController.findAll));
router.get("/audits/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD]), (0, validate_1.validate)(governance_validation_1.getAuditByIdSchema), (0, asyncHandler_1.asyncHandler)(auditController.findById));
router.put("/audits/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.updateAuditSchema), (0, asyncHandler_1.asyncHandler)(auditController.update));
router.delete("/audits/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN]), (0, validate_1.validate)(governance_validation_1.getAuditByIdSchema), (0, asyncHandler_1.asyncHandler)(auditController.delete));
router.put("/audits/checklist/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.updateChecklistItemSchema), (0, asyncHandler_1.asyncHandler)(auditController.updateChecklistItem));
// --------------------------------------------------
// Compliance Issue Endpoints
// --------------------------------------------------
router.post("/issues", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.createComplianceIssueSchema), (0, asyncHandler_1.asyncHandler)(issueController.create));
router.get("/issues", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD, roles_1.RoleCode.EMPLOYEE]), (0, asyncHandler_1.asyncHandler)(issueController.findAll));
router.get("/issues/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.DEPARTMENT_HEAD, roles_1.RoleCode.EMPLOYEE]), (0, validate_1.validate)(governance_validation_1.getComplianceIssueByIdSchema), (0, asyncHandler_1.asyncHandler)(issueController.findById));
router.put("/issues/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER, roles_1.RoleCode.EMPLOYEE]), (0, validate_1.validate)(governance_validation_1.updateComplianceIssueSchema), (0, asyncHandler_1.asyncHandler)(issueController.update));
router.delete("/issues/:id", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, validate_1.validate)(governance_validation_1.getComplianceIssueByIdSchema), (0, asyncHandler_1.asyncHandler)(issueController.delete));
router.post("/issues/overdue/flag", (0, rbac_1.authorize)([roles_1.RoleCode.ADMIN, roles_1.RoleCode.ESG_MANAGER]), (0, asyncHandler_1.asyncHandler)(issueController.flagOverdue));
exports.default = router;
