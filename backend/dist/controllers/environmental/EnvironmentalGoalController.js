"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentalGoalController = void 0;
const EnvironmentalGoalService_1 = require("../../services/environmental/EnvironmentalGoalService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class EnvironmentalGoalController {
    goalService;
    constructor(service = new EnvironmentalGoalService_1.EnvironmentalGoalService()) {
        this.goalService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Environmental goal created successfully.", goal);
    };
    findById = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.findById(req.params.id);
        // RBAC: Department Head can only view their own department's goals
        if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (!employee || employee.departmentId !== goal.departmentId) {
                throw AppError_1.AppError.forbidden("Access denied: You can only view goals of your own department.");
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Environmental goal retrieved successfully.", goal);
    };
    findAll = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let goals = [];
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            const { departmentId } = req.query;
            if (departmentId) {
                goals = await this.goalService.findByDepartmentId(departmentId);
            }
            else {
                goals = await this.goalService.findAll();
            }
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                goals = await this.goalService.findByDepartmentId(employee.departmentId);
            }
            else {
                goals = [];
            }
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Environmental goals retrieved successfully.", goals);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Environmental goal updated successfully.", goal);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Environmental goal deleted successfully.", goal);
    };
}
exports.EnvironmentalGoalController = EnvironmentalGoalController;
