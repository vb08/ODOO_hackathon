import { Request, Response } from "express";
import { EmissionFactorService } from "../../services/environmental/EmissionFactorService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";

export class EmissionFactorController {
  private factorService: EmissionFactorService;

  constructor(service: EmissionFactorService = new EmissionFactorService()) {
    this.factorService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const factor = await this.factorService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Emission factor created successfully.", factor);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const factor = await this.factorService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Emission factor retrieved successfully.", factor);
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    const sourceType = req.query.sourceType as string;
    let factors;
    if (sourceType) {
      factors = await this.factorService.findBySourceType(sourceType);
    } else {
      factors = await this.factorService.findAll();
    }
    sendResponse(res, HttpStatus.OK, "Emission factors retrieved successfully.", factors);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const factor = await this.factorService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Emission factor updated successfully.", factor);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const factor = await this.factorService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Emission factor deleted successfully.", factor);
  };
}
