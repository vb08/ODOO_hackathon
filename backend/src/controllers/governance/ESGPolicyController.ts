import { Request, Response } from "express";
import { ESGPolicyService } from "../../services/governance/ESGPolicyService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";

export class ESGPolicyController {
  private policyService: ESGPolicyService;

  constructor(service: ESGPolicyService = new ESGPolicyService()) {
    this.policyService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const policy = await this.policyService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "ESG Policy created successfully.", policy);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const policy = await this.policyService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "ESG Policy retrieved successfully.", policy);
  };

  public findByCode = async (req: Request, res: Response): Promise<void> => {
    const policy = await this.policyService.findByCode(req.params.code);
    sendResponse(res, HttpStatus.OK, "ESG Policy retrieved successfully.", policy);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const policies = await this.policyService.findAll();
    sendResponse(res, HttpStatus.OK, "ESG Policies retrieved successfully.", policies);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const policy = await this.policyService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "ESG Policy updated successfully.", policy);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const policy = await this.policyService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "ESG Policy deleted successfully.", policy);
  };
}
