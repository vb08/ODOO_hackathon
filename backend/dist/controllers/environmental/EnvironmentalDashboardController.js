"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentalDashboardController = void 0;
const EnvironmentalDashboardService_1 = require("../../services/environmental/EnvironmentalDashboardService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class EnvironmentalDashboardController {
    dashboardService;
    constructor(service = new EnvironmentalDashboardService_1.EnvironmentalDashboardService()) {
        this.dashboardService = service;
    }
    getSummary = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        // Default to current year if not specified
        const yearStr = req.query.year;
        const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
        if (isNaN(year)) {
            throw AppError_1.AppError.badRequest("Year must be a valid number.");
        }
        const summary = await this.dashboardService.getDashboardSummary(year);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Environmental dashboard metrics retrieved successfully.", summary);
    };
    getDepartmentProgress = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { departmentId } = req.params;
        const yearStr = req.query.year;
        const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
        if (isNaN(year)) {
            throw AppError_1.AppError.badRequest("Year must be a valid number.");
        }
        // RBAC: Department Head can only view their own department's progress
        if (req.user.role === "DEPARTMENT_HEAD") {
            const dept = await db_1.prisma.department.findFirst({
                where: { id: departmentId, deletedAt: null },
                include: { manager: true },
            });
            if (!dept || dept.manager?.userId !== req.user.userId) {
                throw AppError_1.AppError.forbidden("Access denied: You are only allowed to view progress for the department you head.");
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        const progress = await this.dashboardService.getDepartmentGoalProgress(departmentId, year);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Department goal progress retrieved successfully.", progress);
    };
}
exports.EnvironmentalDashboardController = EnvironmentalDashboardController;
