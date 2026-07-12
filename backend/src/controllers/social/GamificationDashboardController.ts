import { Request, Response } from "express";
import { GamificationDashboardService } from "../../services/social/GamificationDashboardService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class GamificationDashboardController {
  private dashboardService: GamificationDashboardService;

  constructor(service: GamificationDashboardService = new GamificationDashboardService()) {
    this.dashboardService = service;
  }

  public getSummary = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let departmentId = req.query.departmentId as string | undefined;

    // Department Head RBAC
    if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        departmentId = employee.departmentId;
      } else {
        throw AppError.forbidden("Department manager profile not found.");
      }
    } else if (req.user.role === "EMPLOYEE") {
      throw AppError.forbidden("Access denied.");
    }

    const summary = await this.dashboardService.getSummary(departmentId);
    sendResponse(res, HttpStatus.OK, "ESG Social and Gamification dashboard metrics retrieved.", summary);
  };
}
