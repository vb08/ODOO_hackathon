import { Request, Response } from "express";
import { EnvironmentalGoalService } from "../../services/environmental/EnvironmentalGoalService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class EnvironmentalGoalController {
  private goalService: EnvironmentalGoalService;

  constructor(service: EnvironmentalGoalService = new EnvironmentalGoalService()) {
    this.goalService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Environmental goal created successfully.", goal);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.findById(req.params.id);

    // RBAC: Department Head can only view their own department's goals
    if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (!employee || employee.departmentId !== goal.departmentId) {
        throw AppError.forbidden("Access denied: You can only view goals of your own department.");
      }
    } else if (req.user.role === "EMPLOYEE") {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Environmental goal retrieved successfully.", goal);
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let goals: any[] = [];
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      const { departmentId } = req.query;
      if (departmentId) {
        goals = await this.goalService.findByDepartmentId(departmentId as string);
      } else {
        goals = await this.goalService.findAll();
      }
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        goals = await this.goalService.findByDepartmentId(employee.departmentId);
      } else {
        goals = [];
      }
    } else {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Environmental goals retrieved successfully.", goals);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Environmental goal updated successfully.", goal);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Environmental goal deleted successfully.", goal);
  };
}
