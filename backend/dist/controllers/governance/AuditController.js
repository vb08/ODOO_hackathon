"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const AuditService_1 = require("../../services/governance/AuditService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class AuditController {
    auditService;
    constructor(service = new AuditService_1.AuditService()) {
        this.auditService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const audit = await this.auditService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Audit record created successfully.", audit);
    };
    findById = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const audit = await this.auditService.findById(req.params.id);
        // RBAC: Department Heads are only allowed to see their unit's audits
        if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (!employee || employee.departmentId !== audit.departmentId) {
                throw AppError_1.AppError.forbidden("Access denied: You can only view compliance audits for the department you head.");
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Audit record retrieved successfully.", audit);
    };
    findAll = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let audits = [];
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            const { departmentId } = req.query;
            if (departmentId) {
                audits = await this.auditService.findByDepartmentId(departmentId);
            }
            else {
                audits = await this.auditService.findAll();
            }
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                audits = await this.auditService.findByDepartmentId(employee.departmentId);
            }
            else {
                audits = [];
            }
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Audits retrieved successfully.", audits);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const audit = await this.auditService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Audit record updated successfully.", audit);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const audit = await this.auditService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Audit record deleted successfully.", audit);
    };
    updateChecklistItem = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const checklist = await this.auditService.updateChecklistItem(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Audit checklist item status updated.", checklist);
    };
}
exports.AuditController = AuditController;
