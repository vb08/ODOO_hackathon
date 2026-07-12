import { Request, Response } from "express";
import { CarbonTransactionService } from "../../services/environmental/CarbonTransactionService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class CarbonTransactionController {
  private transactionService: CarbonTransactionService;

  constructor(service: CarbonTransactionService = new CarbonTransactionService()) {
    this.transactionService = service;
  }

  private async authorizeDepartmentAccess(userId: string, role: string, departmentId: string): Promise<void> {
    if (role === "ADMIN" || role === "ESG_MANAGER") return;

    if (role === "DEPARTMENT_HEAD") {
      const dept = await prisma.department.findFirst({
        where: { id: departmentId, deletedAt: null },
        include: { manager: true },
      });
      if (!dept || dept.manager?.userId !== userId) {
        throw AppError.forbidden("Access denied: You are only allowed to manage transactions for the department you head.");
      }
      return;
    }

    throw AppError.forbidden("Access denied: Insufficient privileges.");
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    
    const { departmentId } = req.body;
    await this.authorizeDepartmentAccess(req.user.userId, req.user.role, departmentId);

    const transaction = await this.transactionService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Carbon transaction created successfully (Pending Approval).", transaction);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const transaction = await this.transactionService.findById(req.params.id);

    // RBAC: Check if Department Head belongs to the department of the transaction
    if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user?.userId, deletedAt: null },
      });
      if (!employee || employee.departmentId !== transaction.departmentId) {
        throw AppError.forbidden("Access denied: You can only view transactions of your own department.");
      }
    } else if (req.user.role === "EMPLOYEE") {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Carbon transaction retrieved successfully.", transaction);
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let transactions: any[] = [];
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      const { departmentId } = req.query;
      if (departmentId) {
        transactions = await this.transactionService.findByDepartmentId(departmentId as string);
      } else {
        transactions = await this.transactionService.findAll();
      }
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        transactions = await this.transactionService.findByDepartmentId(employee.departmentId);
      } else {
        transactions = [];
      }
    } else {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Carbon transactions retrieved successfully.", transactions);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    const transaction = await this.transactionService.findById(req.params.id);
    
    // Check access for old department
    await this.authorizeDepartmentAccess(req.user.userId, req.user.role, transaction.departmentId);
    
    // Check access for new department if modified
    if (req.body.departmentId) {
      await this.authorizeDepartmentAccess(req.user.userId, req.user.role, req.body.departmentId);
    }

    const updated = await this.transactionService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Carbon transaction updated successfully.", updated);
  };

  public approve = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { status } = req.body;

    const approved = await this.transactionService.approve(req.params.id, status, req.user.userId);
    sendResponse(res, HttpStatus.OK, `Carbon transaction has been successfully ${status.toLowerCase()}.`, approved);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    const transaction = await this.transactionService.findById(req.params.id);
    await this.authorizeDepartmentAccess(req.user.userId, req.user.role, transaction.departmentId);

    const deleted = await this.transactionService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Carbon transaction deleted successfully.", deleted);
  };
}
