"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmissionFactorController = void 0;
const EmissionFactorService_1 = require("../../services/environmental/EmissionFactorService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
class EmissionFactorController {
    factorService;
    constructor(service = new EmissionFactorService_1.EmissionFactorService()) {
        this.factorService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const factor = await this.factorService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Emission factor created successfully.", factor);
    };
    findById = async (req, res) => {
        const factor = await this.factorService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Emission factor retrieved successfully.", factor);
    };
    findAll = async (req, res) => {
        const sourceType = req.query.sourceType;
        let factors;
        if (sourceType) {
            factors = await this.factorService.findBySourceType(sourceType);
        }
        else {
            factors = await this.factorService.findAll();
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Emission factors retrieved successfully.", factors);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const factor = await this.factorService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Emission factor updated successfully.", factor);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const factor = await this.factorService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Emission factor deleted successfully.", factor);
    };
}
exports.EmissionFactorController = EmissionFactorController;
