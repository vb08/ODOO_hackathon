"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceIssueController = void 0;
const ComplianceIssueService_1 = require("../../services/governance/ComplianceIssueService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class ComplianceIssueController {
    issueService;
    constructor(service = new ComplianceIssueService_1.ComplianceIssueService()) {
        this.issueService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const issue = await this.issueService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Compliance issue raised successfully.", issue);
    };
    findById = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const issue = await this.issueService.findById(req.params.id);
        // RBAC
        if (req.user.role === "EMPLOYEE") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (!employee || issue.ownerId !== employee.id) {
                throw AppError_1.AppError.forbidden("Access denied: You can only view compliance issues assigned to you.");
            }
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                const ownerEmp = await db_1.prisma.employee.findFirst({
                    where: { id: issue.ownerId, deletedAt: null },
                });
                if (!ownerEmp || ownerEmp.departmentId !== employee.departmentId) {
                    throw AppError_1.AppError.forbidden("Access denied: You can only view compliance issues for employees of your department.");
                }
            }
            else {
                throw AppError_1.AppError.forbidden("Access denied.");
            }
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Compliance issue retrieved successfully.", issue);
    };
    findAll = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let issues = [];
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            const { departmentId, ownerId } = req.query;
            if (departmentId) {
                issues = await this.issueService.findByDepartmentId(departmentId);
            }
            else if (ownerId) {
                issues = await this.issueService.findByOwnerId(ownerId);
            }
            else {
                issues = await this.issueService.findAll();
            }
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                issues = await this.issueService.findByDepartmentId(employee.departmentId);
            }
            else {
                issues = [];
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee) {
                issues = await this.issueService.findByOwnerId(employee.id);
            }
            else {
                issues = [];
            }
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Compliance issues retrieved successfully.", issues);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const issue = await this.issueService.findById(req.params.id);
        // If Employee, they can only change status of their own assigned issue
        if (req.user.role === "EMPLOYEE") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (!employee || issue.ownerId !== employee.id) {
                throw AppError_1.AppError.forbidden("Access denied: You can only resolve/update compliance issues assigned to you.");
            }
            // Restrict employee updates only to status updates (e.g. resolve)
            const allowedKeys = ["status"];
            const updateKeys = Object.keys(req.body);
            const isStatusOnly = updateKeys.every((k) => allowedKeys.includes(k));
            if (!isStatusOnly) {
                throw AppError_1.AppError.forbidden("Access denied: Employees can only update the status of compliance issues.");
            }
        }
        const updated = await this.issueService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Compliance issue updated successfully.", updated);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const issue = await this.issueService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Compliance issue deleted successfully.", issue);
    };
    flagOverdue = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const count = await this.issueService.flagOverdueIssues(req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, `Overdue compliance issues flagged and notifications sent. Total flagged: ${count}.`, { flaggedCount: count });
    };
}
exports.ComplianceIssueController = ComplianceIssueController;
