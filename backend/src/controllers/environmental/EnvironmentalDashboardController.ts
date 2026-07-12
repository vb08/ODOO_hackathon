import { Request, Response } from "express";
import { EnvironmentalDashboardService } from "../../services/environmental/EnvironmentalDashboardService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class EnvironmentalDashboardController {
  private dashboardService: EnvironmentalDashboardService;

  constructor(service: EnvironmentalDashboardService = new EnvironmentalDashboardService()) {
    this.dashboardService = service;
  }

  public getSummary = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    
    // Default to current year if not specified
    const yearStr = req.query.year as string;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    if (isNaN(year)) {
      throw AppError.badRequest("Year must be a valid number.");
    }

    const summary = await this.dashboardService.getDashboardSummary(year);
    sendResponse(res, HttpStatus.OK, "Environmental dashboard metrics retrieved successfully.", summary);
  };

  public getDepartmentProgress = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    
    const { departmentId } = req.params;
    const yearStr = req.query.year as string;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    if (isNaN(year)) {
      throw AppError.badRequest("Year must be a valid number.");
    }

    // RBAC: Department Head can only view their own department's progress
    if (req.user.role === "DEPARTMENT_HEAD") {
      const dept = await prisma.department.findFirst({
        where: { id: departmentId, deletedAt: null },
        include: { manager: true },
      });
      if (!dept || dept.manager?.userId !== req.user.userId) {
        throw AppError.forbidden("Access denied: You are only allowed to view progress for the department you head.");
      }
    } else if (req.user.role === "EMPLOYEE") {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    const progress = await this.dashboardService.getDepartmentGoalProgress(departmentId, year);
    sendResponse(res, HttpStatus.OK, "Department goal progress retrieved successfully.", progress);
  };
}
