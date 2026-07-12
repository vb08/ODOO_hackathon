import { Router } from "express";
import { ESGPolicyController } from "../../controllers/governance/ESGPolicyController";
import { PolicyAcknowledgementController } from "../../controllers/governance/PolicyAcknowledgementController";
import { AuditController } from "../../controllers/governance/AuditController";
import { ComplianceIssueController } from "../../controllers/governance/ComplianceIssueController";
import { GovernanceDashboardController } from "../../controllers/governance/GovernanceDashboardController";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import {
  createESGPolicySchema,
  updateESGPolicySchema,
  getESGPolicyByIdSchema,
  acknowledgePolicySchema,
  createAuditSchema,
  updateAuditSchema,
  getAuditByIdSchema,
  updateChecklistItemSchema,
  createComplianceIssueSchema,
  updateComplianceIssueSchema,
  getComplianceIssueByIdSchema,
} from "../../validations/governance.validation";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { RoleCode } from "../../constants/roles";

const router = Router();
const policyController = new ESGPolicyController();
const ackController = new PolicyAcknowledgementController();
const auditController = new AuditController();
const issueController = new ComplianceIssueController();
const dashboardController = new GovernanceDashboardController();

// All governance endpoints require authentication
router.use(authenticate);

// --------------------------------------------------
// Dashboard Endpoints
// --------------------------------------------------
router.get(
  "/dashboard/summary",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(dashboardController.getSummary)
);

// --------------------------------------------------
// Policy Endpoints
// --------------------------------------------------
router.post(
  "/policies",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createESGPolicySchema),
  asyncHandler(policyController.create)
);

router.get(
  "/policies",
  asyncHandler(policyController.findAll)
);

router.get(
  "/policies/:id",
  validate(getESGPolicyByIdSchema),
  asyncHandler(policyController.findById)
);

router.put(
  "/policies/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateESGPolicySchema),
  asyncHandler(policyController.update)
);

router.delete(
  "/policies/:id",
  authorize([RoleCode.ADMIN]),
  validate(getESGPolicyByIdSchema),
  asyncHandler(policyController.delete)
);

// --------------------------------------------------
// Policy Acknowledgement Endpoints
// --------------------------------------------------
router.post(
  "/acknowledgements/:id/acknowledge",
  validate(acknowledgePolicySchema),
  asyncHandler(ackController.acknowledge)
);

router.get(
  "/acknowledgements",
  asyncHandler(ackController.findAll)
);

router.get(
  "/acknowledgements/:id",
  asyncHandler(ackController.findById)
);

// --------------------------------------------------
// Audit Endpoints
// --------------------------------------------------
router.post(
  "/audits",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createAuditSchema),
  asyncHandler(auditController.create)
);

router.get(
  "/audits",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  asyncHandler(auditController.findAll)
);

router.get(
  "/audits/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD]),
  validate(getAuditByIdSchema),
  asyncHandler(auditController.findById)
);

router.put(
  "/audits/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateAuditSchema),
  asyncHandler(auditController.update)
);

router.delete(
  "/audits/:id",
  authorize([RoleCode.ADMIN]),
  validate(getAuditByIdSchema),
  asyncHandler(auditController.delete)
);

router.put(
  "/audits/checklist/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(updateChecklistItemSchema),
  asyncHandler(auditController.updateChecklistItem)
);

// --------------------------------------------------
// Compliance Issue Endpoints
// --------------------------------------------------
router.post(
  "/issues",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(createComplianceIssueSchema),
  asyncHandler(issueController.create)
);

router.get(
  "/issues",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD, RoleCode.EMPLOYEE]),
  asyncHandler(issueController.findAll)
);

router.get(
  "/issues/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.DEPARTMENT_HEAD, RoleCode.EMPLOYEE]),
  validate(getComplianceIssueByIdSchema),
  asyncHandler(issueController.findById)
);

router.put(
  "/issues/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER, RoleCode.EMPLOYEE]),
  validate(updateComplianceIssueSchema),
  asyncHandler(issueController.update)
);

router.delete(
  "/issues/:id",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  validate(getComplianceIssueByIdSchema),
  asyncHandler(issueController.delete)
);

router.post(
  "/issues/overdue/flag",
  authorize([RoleCode.ADMIN, RoleCode.ESG_MANAGER]),
  asyncHandler(issueController.flagOverdue)
);

export default router;
