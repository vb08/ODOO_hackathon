"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRActivityController = void 0;
const CSRActivityService_1 = require("../../services/social/CSRActivityService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class CSRActivityController {
    csrService;
    constructor(service = new CSRActivityService_1.CSRActivityService()) {
        this.csrService = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const activity = await this.csrService.create(req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "CSR Activity created successfully.", activity);
    };
    findById = async (req, res) => {
        const activity = await this.csrService.findById(req.params.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "CSR Activity retrieved successfully.", activity);
    };
    findAll = async (_req, res) => {
        const activities = await this.csrService.findAll();
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "CSR Activities retrieved successfully.", activities);
    };
    update = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const activity = await this.csrService.update(req.params.id, req.body, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "CSR Activity updated successfully.", activity);
    };
    delete = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const activity = await this.csrService.delete(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "CSR Activity deleted successfully.", activity);
    };
    // --- Volunteer Participation ---
    join = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { proofUrl } = req.body;
        const participation = await this.csrService.join(req.params.id, proofUrl, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.CREATED, "Joined CSR Activity successfully.", participation);
    };
    uploadProof = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { proofUrl } = req.body;
        const participation = await this.csrService.uploadProof(req.params.id, proofUrl, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Proof uploaded successfully.", participation);
    };
    approveParticipation = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const { status, proofStatus } = req.body;
        // RBAC validation: Department Head can only verify participations of their own department
        if (req.user.role === "DEPARTMENT_HEAD") {
            const callerEmp = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            const part = await db_1.prisma.volunteerParticipation.findFirst({
                where: { id: req.params.id, deletedAt: null },
                include: { employee: true },
            });
            if (!callerEmp || !part || part.employee.departmentId !== callerEmp.departmentId) {
                throw AppError_1.AppError.forbidden("Access denied: You can only approve participations for employees of your department.");
            }
        }
        const participation = await this.csrService.approveParticipation(req.params.id, status, proofStatus, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "CSR Volunteer participation verified.", participation);
    };
    findMyParticipations = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const employee = await db_1.prisma.employee.findFirst({
            where: { userId: req.user.userId, deletedAt: null },
        });
        if (!employee)
            throw AppError_1.AppError.notFound("Employee profile not found.");
        const participations = await this.csrService.findParticipationsByEmployee(employee.id);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Volunteer participations retrieved successfully.", participations);
    };
    findAllParticipations = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let participations = [];
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            participations = await this.csrService.findAllParticipations();
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                const allPart = await this.csrService.findAllParticipations();
                participations = allPart.filter((p) => p.employee?.departmentId === employee.departmentId);
            }
            else {
                participations = [];
            }
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Volunteer participations list retrieved.", participations);
    };
}
exports.CSRActivityController = CSRActivityController;
