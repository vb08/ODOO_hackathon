import { Request, Response } from "express";
import { IRoleRepository } from "../interfaces/IRoleRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import { sendResponse } from "../utils/responseFormatter";
import { HttpStatus } from "../constants/roles";

/**
 * Controller layer handling Role mappings.
 */
export class RoleController {
  private roleRepository: IRoleRepository;

  constructor(repository: IRoleRepository = new RoleRepository()) {
    this.roleRepository = repository;
  }

  /**
   * Returns all system roles.
   */
  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const roles = await this.roleRepository.findAll();
    sendResponse(res, HttpStatus.OK, "Roles retrieved successfully.", roles);
  };
}
