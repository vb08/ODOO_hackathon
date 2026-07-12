"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialGoalController = void 0;
const SocialGoalService_1 = require("../../services/social/SocialGoalService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class SocialGoalController {
    goalService;
    constructor(service = new SocialGoalService_1.SocialGoalService()) {
        this.goalService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Social Goal created successfully.", goal);
    };
    findById = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.findById(req.params.id);
        // Department Head RBAC
        if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (!employee || goal.departmentId !== employee.departmentId) {
                throw AppError_1.AppError.forbidden("Access denied: You can only view social goals set for your department.");
            }
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Social Goal retrieved successfully.", goal);
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
            throw AppError_1.AppError.forbidden("Access denied.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Social Goals retrieved successfully.", goals);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Social Goal updated successfully.", goal);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const goal = await this.goalService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Social Goal deleted successfully.", goal);
    };
}
exports.SocialGoalController = SocialGoalController;
