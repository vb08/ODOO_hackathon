"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComplianceIssueByIdSchema = exports.updateComplianceIssueStatusSchema = exports.updateComplianceIssueSchema = exports.createComplianceIssueSchema = exports.updateChecklistItemSchema = exports.getAuditByIdSchema = exports.updateAuditSchema = exports.createAuditSchema = exports.acknowledgePolicySchema = exports.getESGPolicyByIdSchema = exports.updateESGPolicySchema = exports.createESGPolicySchema = void 0;
const zod_1 = require("zod");
const PolicyStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"];
const AuditStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const ChecklistStatuses = ["PENDING", "VERIFIED", "FAILED"];
const ComplianceStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const SeverityLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PriorityLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
/**
 * ESGPolicy validations
 */
exports.createESGPolicySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        code: zod_1.z.string().min(2, "Code must be at least 2 characters"),
        content: zod_1.z.string().min(10, "Content must be at least 10 characters"),
        effectiveDate: zod_1.z.string().datetime().optional(),
        version: zod_1.z.string().default("1.0"),
        status: zod_1.z.enum(PolicyStatuses).default("DRAFT"),
    }),
});
exports.updateESGPolicySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        code: zod_1.z.string().min(2).optional(),
        content: zod_1.z.string().min(10).optional(),
        effectiveDate: zod_1.z.string().datetime().optional(),
        version: zod_1.z.string().optional(),
        status: zod_1.z.enum(PolicyStatuses).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Policy ID"),
    }),
});
exports.getESGPolicyByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Policy ID"),
    }),
});
/**
 * PolicyAcknowledgement validations
 */
exports.acknowledgePolicySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Acknowledgement ID"),
    }),
});
/**
 * Audit validations
 */
exports.createAuditSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        code: zod_1.z.string().min(2, "Code must be at least 2 characters"),
        departmentId: zod_1.z.string().uuid("Invalid Department ID"),
        auditorName: zod_1.z.string().min(2, "Auditor name is required"),
        auditDate: zod_1.z.string().datetime("Audit date must be a valid ISO DateTime string"),
        status: zod_1.z.enum(AuditStatuses).default("PLANNED"),
        score: zod_1.z.number().min(0).max(100).optional(),
        maxScore: zod_1.z.number().min(1).optional(),
        findings: zod_1.z.string().optional(),
        checklists: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string().min(2, "Checklist item title is required"),
            status: zod_1.z.enum(ChecklistStatuses).default("PENDING"),
            remarks: zod_1.z.string().optional(),
        })).optional(),
    }),
});
exports.updateAuditSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        code: zod_1.z.string().min(2).optional(),
        departmentId: zod_1.z.string().uuid().optional(),
        auditorName: zod_1.z.string().min(2).optional(),
        auditDate: zod_1.z.string().datetime().optional(),
        status: zod_1.z.enum(AuditStatuses).optional(),
        score: zod_1.z.number().min(0).max(100).optional(),
        maxScore: zod_1.z.number().min(1).optional(),
        findings: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Audit ID"),
    }),
});
exports.getAuditByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Audit ID"),
    }),
});
/**
 * AuditChecklist validations
 */
exports.updateChecklistItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(ChecklistStatuses).optional(),
        remarks: zod_1.z.string().optional(),
        verifiedBy: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Checklist Item ID"),
    }),
});
/**
 * ComplianceIssue validations
 */
exports.createComplianceIssueSchema = zod_1.z.object({
    body: zod_1.z.object({
        auditId: zod_1.z.string().uuid().optional().nullable(),
        title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
        description: zod_1.z.string().min(5, "Description is required"),
        status: zod_1.z.enum(ComplianceStatuses).default("OPEN"),
        priority: zod_1.z.enum(PriorityLevels).default("MEDIUM"),
        severity: zod_1.z.enum(SeverityLevels).default("MEDIUM"),
        ownerId: zod_1.z.string().uuid("Owner ID must be a valid UUID"),
        dueDate: zod_1.z.string().datetime("Due Date must be a valid ISO DateTime string"),
    }),
});
exports.updateComplianceIssueSchema = zod_1.z.object({
    body: zod_1.z.object({
        auditId: zod_1.z.string().uuid().optional().nullable(),
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(5).optional(),
        status: zod_1.z.enum(ComplianceStatuses).optional(),
        priority: zod_1.z.enum(PriorityLevels).optional(),
        severity: zod_1.z.enum(SeverityLevels).optional(),
        ownerId: zod_1.z.string().uuid().optional(),
        dueDate: zod_1.z.string().datetime().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Compliance Issue ID"),
    }),
});
exports.updateComplianceIssueStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(ComplianceStatuses),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Compliance Issue ID"),
    }),
});
exports.getComplianceIssueByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid Compliance Issue ID"),
    }),
});
