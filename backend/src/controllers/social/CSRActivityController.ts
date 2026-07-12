import { Request, Response } from "express";
import { CSRActivityService } from "../../services/social/CSRActivityService";
import { sendResponse } from "../../utils/responseFormatter";
import { HttpStatus } from "../../constants/roles";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../database/db";

export class CSRActivityController {
  private csrService: CSRActivityService;

  constructor(service: CSRActivityService = new CSRActivityService()) {
    this.csrService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const activity = await this.csrService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "CSR Activity created successfully.", activity);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const activity = await this.csrService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "CSR Activity retrieved successfully.", activity);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const activities = await this.csrService.findAll();
    sendResponse(res, HttpStatus.OK, "CSR Activities retrieved successfully.", activities);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const activity = await this.csrService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "CSR Activity updated successfully.", activity);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const activity = await this.csrService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "CSR Activity deleted successfully.", activity);
  };

  // --- Volunteer Participation ---

  public join = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { proofUrl } = req.body;
    const participation = await this.csrService.join(req.params.id, proofUrl, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Joined CSR Activity successfully.", participation);
  };

  public uploadProof = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { proofUrl } = req.body;
    const participation = await this.csrService.uploadProof(req.params.id, proofUrl, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Proof uploaded successfully.", participation);
  };

  public approveParticipation = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const { status, proofStatus } = req.body;
    
    // RBAC validation: Department Head can only verify participations of their own department
    if (req.user.role === "DEPARTMENT_HEAD") {
      const callerEmp = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      const part = await prisma.volunteerParticipation.findFirst({
        where: { id: req.params.id, deletedAt: null },
        include: { employee: true },
      });
      
      if (!callerEmp || !part || part.employee.departmentId !== callerEmp.departmentId) {
        throw AppError.forbidden("Access denied: You can only approve participations for employees of your department.");
      }
    }

    const participation = await this.csrService.approveParticipation(req.params.id, status, proofStatus, req.user.userId);
    sendResponse(res, HttpStatus.OK, "CSR Volunteer participation verified.", participation);
  };

  public findMyParticipations = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.userId, deletedAt: null },
    });
    if (!employee) throw AppError.notFound("Employee profile not found.");

    const participations = await this.csrService.findParticipationsByEmployee(employee.id);
    sendResponse(res, HttpStatus.OK, "Volunteer participations retrieved successfully.", participations);
  };

  public findAllParticipations = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();

    let participations: any[] = [];
    if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
      participations = await this.csrService.findAllParticipations();
    } else if (req.user.role === "DEPARTMENT_HEAD") {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user.userId, deletedAt: null },
      });
      if (employee && employee.departmentId) {
        const allPart = await this.csrService.findAllParticipations();
        participations = allPart.filter((p: any) => p.employee?.departmentId === employee.departmentId);
      } else {
        participations = [];
      }
    } else {
      throw AppError.forbidden("Access denied.");
    }

    sendResponse(res, HttpStatus.OK, "Volunteer participations list retrieved.", participations);
  };
}
