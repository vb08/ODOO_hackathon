"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonTransactionController = void 0;
const CarbonTransactionService_1 = require("../../services/environmental/CarbonTransactionService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class CarbonTransactionController {
    transactionService;
    constructor(service = new CarbonTransactionService_1.CarbonTransactionService()) {
        this.transactionService = service;
    }
    async authorizeDepartmentAccess(userId, role, departmentId) {
        if (role === "ADMIN" || role === "ESG_MANAGER")
            return;
        if (role === "DEPARTMENT_HEAD") {
            const dept = await db_1.prisma.department.findFirst({
                where: { id: departmentId, deletedAt: null },
                include: { manager: true },
            });
            if (!dept || dept.manager?.userId !== userId) {
                throw AppError_1.AppError.forbidden("Access denied: You are only allowed to manage transactions for the department you head.");
            }
            return;
        }
        throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { departmentId } = req.body;
        await this.authorizeDepartmentAccess(req.user.userId, req.user.role, departmentId);
        const transaction = await this.transactionService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Carbon transaction created successfully (Pending Approval).", transaction);
    };
    findById = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const transaction = await this.transactionService.findById(req.params.id);
        // RBAC: Check if Department Head belongs to the department of the transaction
        if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user?.userId, deletedAt: null },
            });
            if (!employee || employee.departmentId !== transaction.departmentId) {
                throw AppError_1.AppError.forbidden("Access denied: You can only view transactions of your own department.");
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Carbon transaction retrieved successfully.", transaction);
    };
    findAll = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let transactions = [];
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            const { departmentId } = req.query;
            if (departmentId) {
                transactions = await this.transactionService.findByDepartmentId(departmentId);
            }
            else {
                transactions = await this.transactionService.findAll();
            }
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                transactions = await this.transactionService.findByDepartmentId(employee.departmentId);
            }
            else {
                transactions = [];
            }
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Carbon transactions retrieved successfully.", transactions);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const transaction = await this.transactionService.findById(req.params.id);
        // Check access for old department
        await this.authorizeDepartmentAccess(req.user.userId, req.user.role, transaction.departmentId);
        // Check access for new department if modified
        if (req.body.departmentId) {
            await this.authorizeDepartmentAccess(req.user.userId, req.user.role, req.body.departmentId);
        }
        const updated = await this.transactionService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Carbon transaction updated successfully.", updated);
    };
    approve = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { status } = req.body;
        const approved = await this.transactionService.approve(req.params.id, status, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, `Carbon transaction has been successfully ${status.toLowerCase()}.`, approved);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const transaction = await this.transactionService.findById(req.params.id);
        await this.authorizeDepartmentAccess(req.user.userId, req.user.role, transaction.departmentId);
        const deleted = await this.transactionService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Carbon transaction deleted successfully.", deleted);
    };
}
exports.CarbonTransactionController = CarbonTransactionController;
