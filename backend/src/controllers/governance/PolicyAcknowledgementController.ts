import { Request, Response } from "express";
import { PolicyAcknowledgementService } from "../../services/governance/PolicyAcknowledgementService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class PolicyAcknowledgementController {
  private ackService: PolicyAcknowledgementService;

  constructor(service: PolicyAcknowledgementService = new PolicyAcknowledgementService()) {
    this.ackService = service;
  }

  public acknowledge = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const ack = await this.ackService.acknowledge(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Policy acknowledged successfully.", ack);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const ack = await this.ackService.findById(req.params.id);

    // RBAC checks
    if (req.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (!employee || ack.employeeId !== employee.id) {
        throw AppError.forbidden("Access denied: You can only view your own policy acknowledgements.");
      }
    }

    sendResponse(res, HttpStatus.OK, "Policy acknowledgement record retrieved.", ack);
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let acks: any[] = [];
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      const { policyId, employeeId } = req.query;
      if (policyId) {
        acks = await this.ackService.findByPolicyId(policyId as string);
      } else if (employeeId) {
        acks = await this.ackService.findByEmployeeId(employeeId as string);
      } else {
        acks = await this.ackService.findAll();
      }
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        const departmentAcks = await this.ackService.findAll();
        acks = departmentAcks.filter((ack) => (ack as any).employee?.departmentId === employee.departmentId);
      } else {
        acks = [];
      }
    } else if (req.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee) {
        const { pendingOnly } = req.query;
        if (pendingOnly === "true") {
          acks = await this.ackService.findPendingByEmployeeId(employee.id);
        } else {
          acks = await this.ackService.findByEmployeeId(employee.id);
        }
      } else {
        acks = [];
      }
    } else {
      throw AppError.forbidden("Access denied: Insufficient privileges.");
    }

    sendResponse(res, HttpStatus.OK, "Policy acknowledgements retrieved successfully.", acks);
  };
}
