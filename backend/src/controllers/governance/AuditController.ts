import { Request, Response } from "express";
import { AuditService } from "../../services/governance/AuditService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class AuditController {
  private auditService: AuditService;

  constructor(service: AuditService = new AuditService()) {
    this.auditService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const audit = await this.auditService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Audit record created successfully.", audit);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const audit = await this.auditService.findById(req.params.id);

    // RBAC: Department Heads are only allowed to see their unit's audits
    if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (!employee || employee.departmentId !== audit.departmentId) {
        throw AppError.forbidden("Access denied: You can only view compliance audits for the department you head.");
      }
    } else if (req.user.role === "EMPLOYEE") {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Audit record retrieved successfully.", audit);
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let audits: any[] = [];
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      const { departmentId } = req.query;
      if (departmentId) {
        audits = await this.auditService.findByDepartmentId(departmentId as string);
      } else {
        audits = await this.auditService.findAll();
      }
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        audits = await this.auditService.findByDepartmentId(employee.departmentId);
      } else {
        audits = [];
      }
    } else {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Audits retrieved successfully.", audits);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const audit = await this.auditService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Audit record updated successfully.", audit);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const audit = await this.auditService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Audit record deleted successfully.", audit);
  };

  public updateChecklistItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const checklist = await this.auditService.updateChecklistItem(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Audit checklist item status updated.", checklist);
  };
}
