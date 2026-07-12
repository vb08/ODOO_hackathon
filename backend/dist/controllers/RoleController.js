"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const RoleRepository_1 = require("../repositories/RoleRepository");
const responseFormatter_1 = require("../utils/responseFormatter");
const roles_1 = require("../constants/roles");
/**
 * Controller layer handling Role mappings.
 */
class RoleController {
    roleRepository;
    constructor(repository = new RoleRepository_1.RoleRepository()) {
        this.roleRepository = repository;
    }
    /**
     * Returns all system roles.
     */
    findAll = async (_req, res) => {
        const roles = await this.roleRepository.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Roles retrieved successfully.", roles);
    };
}
exports.RoleController = RoleController;
