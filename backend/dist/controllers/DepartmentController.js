"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const DepartmentService_1 = require("../services/DepartmentService");
const responseFormatter_1 = require("../utils/responseFormatter");
const roles_1 = require("../constants/roles");
const AppError_1 = require("../utils/AppError");
/**
 * Controller layer handling Department CRUD endpoints.
 */
class DepartmentController {
    departmentService;
    constructor(service = new DepartmentService_1.DepartmentService()) {
        this.departmentService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const department = await this.departmentService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Department created successfully.", department);
    };
    findById = async (req, res) => {
        const department = await this.departmentService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Department retrieved successfully.", department);
    };
    findAll = async (_req, res) => {
        const departments = await this.departmentService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Departments retrieved successfully.", departments);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const department = await this.departmentService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Department updated successfully.", department);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const department = await this.departmentService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Department deleted successfully (soft delete).", department);
    };
}
exports.DepartmentController = DepartmentController;
