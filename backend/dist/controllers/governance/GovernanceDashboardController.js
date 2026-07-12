"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceDashboardController = void 0;
const GovernanceDashboardService_1 = require("../../services/governance/GovernanceDashboardService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class GovernanceDashboardController {
    dashboardService;
    constructor(service = new GovernanceDashboardService_1.GovernanceDashboardService()) {
        this.dashboardService = service;
    }
    getSummary = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let departmentId = req.query.departmentId;
        // RBAC: Department Heads are restricted to their own department details
        if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                departmentId = employee.departmentId;
            }
            else {
                throw AppError_1.AppError.forbidden("Department manager profile not found.");
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        const summary = await this.dashboardService.getDashboardSummary(departmentId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Governance dashboard metrics retrieved successfully.", summary);
    };
}
exports.GovernanceDashboardController = GovernanceDashboardController;
