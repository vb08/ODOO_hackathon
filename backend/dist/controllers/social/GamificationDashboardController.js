"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationDashboardController = void 0;
const GamificationDashboardService_1 = require("../../services/social/GamificationDashboardService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class GamificationDashboardController {
    dashboardService;
    constructor(service = new GamificationDashboardService_1.GamificationDashboardService()) {
        this.dashboardService = service;
    }
    getSummary = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let departmentId = req.query.departmentId;
        // Department Head RBAC
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
            throw AppError_1.AppError.forbidden("Access denied.");
        }
        const summary = await this.dashboardService.getSummary(departmentId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "ESG Social and Gamification dashboard metrics retrieved.", summary);
    };
}
exports.GamificationDashboardController = GamificationDashboardController;
