"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESGPolicyController = void 0;
const ESGPolicyService_1 = require("../../services/governance/ESGPolicyService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
class ESGPolicyController {
    policyService;
    constructor(service = new ESGPolicyService_1.ESGPolicyService()) {
        this.policyService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const policy = await this.policyService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "ESG Policy created successfully.", policy);
    };
    findById = async (req, res) => {
        const policy = await this.policyService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "ESG Policy retrieved successfully.", policy);
    };
    findByCode = async (req, res) => {
        const policy = await this.policyService.findByCode(req.params.code);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "ESG Policy retrieved successfully.", policy);
    };
    findAll = async (_req, res) => {
        const policies = await this.policyService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "ESG Policies retrieved successfully.", policies);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const policy = await this.policyService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "ESG Policy updated successfully.", policy);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const policy = await this.policyService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "ESG Policy deleted successfully.", policy);
    };
}
exports.ESGPolicyController = ESGPolicyController;
