import { Request, Response } from "express";
import { EmployeeService } from "../services/EmployeeService";
import { sendResponse } from "../utils/responseFormatter";
import { HttpStatus } from "../constants/roles";
import { AppError } from "../utils/AppError";

/**
 * Controller layer handling Employee profiles.
 */
export class EmployeeController {
  private employeeService: EmployeeService;

  constructor(service: EmployeeService = new EmployeeService()) {
    this.employeeService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const employee = await this.employeeService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Employee record created successfully.", employee);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const employee = await this.employeeService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Employee record retrieved successfully.", employee);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const employees = await this.employeeService.findAll();
    sendResponse(res, HttpStatus.OK, "Employees retrieved successfully.", employees);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const employee = await this.employeeService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Employee record updated successfully.", employee);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const employee = await this.employeeService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Employee record deleted successfully (soft delete).", employee);
  };
}
