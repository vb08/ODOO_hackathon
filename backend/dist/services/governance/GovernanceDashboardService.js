"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceDashboardService = void 0;
const AuditRepository_1 = require("../../repositories/AuditRepository");
const ComplianceIssueRepository_1 = require("../../repositories/ComplianceIssueRepository");
const PolicyAcknowledgementRepository_1 = require("../../repositories/PolicyAcknowledgementRepository");
class GovernanceDashboardService {
    auditRepo;
    issueRepo;
    ackRepo;
    constructor(auditRepo = new AuditRepository_1.AuditRepository(), issueRepo = new ComplianceIssueRepository_1.ComplianceIssueRepository(), ackRepo = new PolicyAcknowledgementRepository_1.PolicyAcknowledgementRepository()) {
        this.auditRepo = auditRepo;
        this.issueRepo = issueRepo;
        this.ackRepo = ackRepo;
    }
    async getDashboardSummary(departmentId) {
        // 1. Fetch relevant Audits
        let audits = await this.auditRepo.findAll();
        if (departmentId) {
            audits = audits.filter((a) => a.departmentId === departmentId);
        }
        // 2. Fetch relevant Compliance Issues
        let issues = await this.issueRepo.findAll();
        if (departmentId) {
            issues = issues.filter((i) => i.audit?.departmentId === departmentId);
        }
        // 3. Fetch relevant Policy Acknowledgements
        let acks = await this.ackRepo.findAll();
        if (departmentId) {
            // Filter acknowledgements by employees belonging to this department
            acks = acks.filter((ack) => ack.employee?.departmentId === departmentId);
        }
        // --- Metric Calculations ---
        // A. Audit Component & Completion Rate
        const completedAudits = audits.filter((a) => a.status === "COMPLETED");
        let auditScoreSum = 0;
        let auditScoreCount = 0;
        completedAudits.forEach((a) => {
            if (a.percentage !== null) {
                auditScoreSum += a.percentage;
                auditScoreCount++;
            }
        });
        const auditComponent = auditScoreCount > 0 ? auditScoreSum / auditScoreCount : 100;
        const auditCompletionRate = audits.length > 0
            ? Math.round((completedAudits.length / audits.length) * 100 * 100) / 100
            : 100;
        // B. Issue Component (Resolution rate)
        const openIssues = issues.filter((i) => ["OPEN", "IN_PROGRESS"].includes(i.status));
        const resolvedIssues = issues.filter((i) => ["RESOLVED", "CLOSED"].includes(i.status));
        const totalIssues = issues.length;
        const issueResolutionRate = totalIssues > 0
            ? (resolvedIssues.length / totalIssues) * 100
            : 100;
        // C. Composite Governance Score
        // Formula: 60% based on Audit Checklist Performance + 40% based on Compliance Issue Resolution Rate
        const governanceScore = Math.round(((auditComponent * 0.6) + (issueResolutionRate * 0.4)) * 100) / 100;
        // D. Policy Compliance %
        const acknowledgedAcks = acks.filter((ack) => ack.status === "ACKNOWLEDGED");
        const totalAcks = acks.length;
        const policyComplianceRate = totalAcks > 0
            ? Math.round((acknowledgedAcks.length / totalAcks) * 100 * 100) / 100
            : 100;
        // E. Open & Critical Issues Count
        const openIssuesCount = openIssues.length;
        const criticalIssuesCount = openIssues.filter((i) => i.priority === "CRITICAL" || i.severity === "CRITICAL" || i.priority === "HIGH" || i.severity === "HIGH").length;
        // F. Upcoming Audits (Planned or In-Progress in the future)
        const now = new Date();
        const upcomingAudits = audits
            .filter((a) => ["PLANNED", "IN_PROGRESS"].includes(a.status) && new Date(a.auditDate) > now)
            .sort((a, b) => new Date(a.auditDate).getTime() - new Date(b.auditDate).getTime())
            .slice(0, 5); // top 5 next audits
        return {
            governanceScore,
            policyComplianceRate,
            openIssuesCount,
            criticalIssuesCount,
            auditCompletionRate,
            upcomingAudits,
        };
    }
}
exports.GovernanceDashboardService = GovernanceDashboardService;
