import { Request, Response } from "express";
import { GovernanceDashboardService } from "../../services/governance/GovernanceDashboardService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class GovernanceDashboardController {
  private dashboardService: GovernanceDashboardService;

  constructor(service: GovernanceDashboardService = new GovernanceDashboardService()) {
    this.dashboardService = service;
  }

  public getSummary = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let departmentId = req.query.departmentId as string | undefined;

    // RBAC: Department Heads are restricted to their own department details
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
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    const summary = await this.dashboardService.getDashboardSummary(departmentId);
    sendResponse(res, HttpStatus.OK, "Governance dashboard metrics retrieved successfully.", summary);
  };
}
