"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const EmployeeService_1 = require("../services/EmployeeService");
const responseFormatter_1 = require("../utils/responseFormatter");
const roles_1 = require("../constants/roles");
const AppError_1 = require("../utils/AppError");
/**
 * Controller layer handling Employee profiles.
 */
class EmployeeController {
    employeeService;
    constructor(service = new EmployeeService_1.EmployeeService()) {
        this.employeeService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const employee = await this.employeeService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Employee record created successfully.", employee);
    };
    findById = async (req, res) => {
        const employee = await this.employeeService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Employee record retrieved successfully.", employee);
    };
    findAll = async (_req, res) => {
        const employees = await this.employeeService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Employees retrieved successfully.", employees);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const employee = await this.employeeService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Employee record updated successfully.", employee);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const employee = await this.employeeService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Employee record deleted successfully (soft delete).", employee);
    };
}
exports.EmployeeController = EmployeeController;
