import { z } from "zod";

const PolicyStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
const AuditStatuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const ChecklistStatuses = ["PENDING", "VERIFIED", "FAILED"] as const;
const ComplianceStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const SeverityLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const PriorityLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

/**
 * ESGPolicy validations
 */
export const createESGPolicySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    code: z.string().min(2, "Code must be at least 2 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    effectiveDate: z.string().datetime().optional(),
    version: z.string().default("1.0"),
    status: z.enum(PolicyStatuses).default("DRAFT"),
  }),
});

export const updateESGPolicySchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    code: z.string().min(2).optional(),
    content: z.string().min(10).optional(),
    effectiveDate: z.string().datetime().optional(),
    version: z.string().optional(),
    status: z.enum(PolicyStatuses).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Policy ID"),
  }),
});

export const getESGPolicyByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Policy ID"),
  }),
});

/**
 * PolicyAcknowledgement validations
 */
export const acknowledgePolicySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Acknowledgement ID"),
  }),
});

/**
 * Audit validations
 */
export const createAuditSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    code: z.string().min(2, "Code must be at least 2 characters"),
    departmentId: z.string().uuid("Invalid Department ID"),
    auditorName: z.string().min(2, "Auditor name is required"),
    auditDate: z.string().datetime("Audit date must be a valid ISO DateTime string"),
    status: z.enum(AuditStatuses).default("PLANNED"),
    score: z.number().min(0).max(100).optional(),
    maxScore: z.number().min(1).optional(),
    findings: z.string().optional(),
    checklists: z.array(z.object({
      title: z.string().min(2, "Checklist item title is required"),
      status: z.enum(ChecklistStatuses).default("PENDING"),
      remarks: z.string().optional(),
    })).optional(),
  }),
});

export const updateAuditSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    code: z.string().min(2).optional(),
    departmentId: z.string().uuid().optional(),
    auditorName: z.string().min(2).optional(),
    auditDate: z.string().datetime().optional(),
    status: z.enum(AuditStatuses).optional(),
    score: z.number().min(0).max(100).optional(),
    maxScore: z.number().min(1).optional(),
    findings: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Audit ID"),
  }),
});

export const getAuditByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Audit ID"),
  }),
});

/**
 * AuditChecklist validations
 */
export const updateChecklistItemSchema = z.object({
  body: z.object({
    status: z.enum(ChecklistStatuses).optional(),
    remarks: z.string().optional(),
    verifiedBy: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Checklist Item ID"),
  }),
});

/**
 * ComplianceIssue validations
 */
export const createComplianceIssueSchema = z.object({
  body: z.object({
    auditId: z.string().uuid().optional().nullable(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description is required"),
    status: z.enum(ComplianceStatuses).default("OPEN"),
    priority: z.enum(PriorityLevels).default("MEDIUM"),
    severity: z.enum(SeverityLevels).default("MEDIUM"),
    ownerId: z.string().uuid("Owner ID must be a valid UUID"),
    dueDate: z.string().datetime("Due Date must be a valid ISO DateTime string"),
  }),
});

export const updateComplianceIssueSchema = z.object({
  body: z.object({
    auditId: z.string().uuid().optional().nullable(),
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    status: z.enum(ComplianceStatuses).optional(),
    priority: z.enum(PriorityLevels).optional(),
    severity: z.enum(SeverityLevels).optional(),
    ownerId: z.string().uuid().optional(),
    dueDate: z.string().datetime().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Compliance Issue ID"),
  }),
});

export const updateComplianceIssueStatusSchema = z.object({
  body: z.object({
    status: z.enum(ComplianceStatuses),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Compliance Issue ID"),
  }),
});

export const getComplianceIssueByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Compliance Issue ID"),
  }),
});
