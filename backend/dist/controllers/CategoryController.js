"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CategoryService_1 = require("../services/CategoryService");
const responseFormatter_1 = require("../utils/responseFormatter");
const roles_1 = require("../constants/roles");
const AppError_1 = require("../utils/AppError");
/**
 * Controller layer handling ESG Category CRUD endpoints.
 */
class CategoryController {
    categoryService;
    constructor(service = new CategoryService_1.CategoryService()) {
        this.categoryService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const category = await this.categoryService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Category created successfully.", category);
    };
    findById = async (req, res) => {
        const category = await this.categoryService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Category retrieved successfully.", category);
    };
    findAll = async (_req, res) => {
        const categories = await this.categoryService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Categories retrieved successfully.", categories);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const category = await this.categoryService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Category updated successfully.", category);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const category = await this.categoryService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Category deleted successfully (soft delete).", category);
    };
}
exports.CategoryController = CategoryController;
