import { Request, Response } from "express";
import { DepartmentService } from "../services/DepartmentService";
import { sendResponse } from "../utils/responseFormatter";
import { HttpStatus } from "../constants/roles";
import { AppError } from "../utils/AppError";

/**
 * Controller layer handling Department CRUD endpoints.
 */
export class DepartmentController {
  private departmentService: DepartmentService;

  constructor(service: DepartmentService = new DepartmentService()) {
    this.departmentService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const department = await this.departmentService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Department created successfully.", department);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const department = await this.departmentService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Department retrieved successfully.", department);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const departments = await this.departmentService.findAll();
    sendResponse(res, HttpStatus.OK, "Departments retrieved successfully.", departments);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const department = await this.departmentService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Department updated successfully.", department);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const department = await this.departmentService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Department deleted successfully (soft delete).", department);
  };
}
