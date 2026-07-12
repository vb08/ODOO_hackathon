import { Request, Response } from "express";
import { ComplianceIssueService } from "../../services/governance/ComplianceIssueService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class ComplianceIssueController {
  private issueService: ComplianceIssueService;

  constructor(service: ComplianceIssueService = new ComplianceIssueService()) {
    this.issueService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const issue = await this.issueService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Compliance issue raised successfully.", issue);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const issue = await this.issueService.findById(req.params.id);

    // RBAC
    if (req.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (!employee || issue.ownerId !== employee.id) {
        throw AppError.forbidden("Access denied: You can only view compliance issues assigned to you.");
      }
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        const ownerEmp = await prisma.employee.findFirst({
          where: { id: issue.ownerId, deletedAt: null },
        });
        if (!ownerEmp || ownerEmp.departmentId !== employee.departmentId) {
          throw AppError.forbidden("Access denied: You can only view compliance issues for employees of your department.");
        }
      } else {
        throw AppError.forbidden("Access denied.");
      }
    }

    sendResponse(res, HttpStatus.OK, "Compliance issue retrieved successfully.", issue);
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let issues: any[] = [];
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      const { departmentId, ownerId } = req.query;
      if (departmentId) {
        issues = await this.issueService.findByDepartmentId(departmentId as string);
      } else if (ownerId) {
        issues = await this.issueService.findByOwnerId(ownerId as string);
      } else {
        issues = await this.issueService.findAll();
      }
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        issues = await this.issueService.findByDepartmentId(employee.departmentId);
      } else {
        issues = [];
      }
    } else if (req.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee) {
        issues = await this.issueService.findByOwnerId(employee.id);
      } else {
        issues = [];
      }
    } else {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Compliance issues retrieved successfully.", issues);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    const issue = await this.issueService.findById(req.params.id);

    // If Employee, they can only change status of their own assigned issue
    if (req.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (!employee || issue.ownerId !== employee.id) {
        throw AppError.forbidden("Access denied: You can only resolve/update compliance issues assigned to you.");
      }

      // Restrict employee updates only to status updates (e.g. resolve)
      const allowedKeys = ["status"];
      const updateKeys = Object.keys(req.body);
      const isStatusOnly = updateKeys.every((k) => allowedKeys.includes(k));
      if (!isStatusOnly) {
        throw AppError.forbidden("Access denied: Employees can only update the status of compliance issues.");
      }
    }

    const updated = await this.issueService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Compliance issue updated successfully.", updated);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const issue = await this.issueService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Compliance issue deleted successfully.", issue);
  };

  public flagOverdue = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const count = await this.issueService.flagOverdueIssues(req.user.userId);
    sendResponse(res, HttpStatus.OK, `Overdue compliance issues flagged and notifications sent. Total flagged: ${count}.`, { flaggedCount: count });
  };
}
