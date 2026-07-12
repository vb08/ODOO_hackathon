import { Request, Response } from "express";
import { SocialGoalService } from "../../services/social/SocialGoalService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class SocialGoalController {
  private goalService: SocialGoalService;

  constructor(service: SocialGoalService = new SocialGoalService()) {
    this.goalService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Social Goal created successfully.", goal);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.findById(req.params.id);

    // Department Head RBAC
    if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (!employee || goal.departmentId !== employee.departmentId) {
        throw AppError.forbidden("Access denied: You can only view social goals set for your department.");
      }
    }

    sendResponse(res, HttpStatus.OK, "Social Goal retrieved successfully.", goal);
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
      throw AppError.forbidden("Access denied.");
    }

    sendResponse(res, HttpStatus.OK, "Social Goals retrieved successfully.", goals);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Social Goal updated successfully.", goal);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const goal = await this.goalService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Social Goal deleted successfully.", goal);
  };
}
