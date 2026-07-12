"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyAcknowledgementController = void 0;
const PolicyAcknowledgementService_1 = require("../../services/governance/PolicyAcknowledgementService");
const responseFormatter_1 = require("../../utils/responseFormatter");
const roles_1 = require("../../constants/roles");
const AppError_1 = require("../../utils/AppError");
const db_1 = require("../../database/db");
class PolicyAcknowledgementController {
    ackService;
    constructor(service = new PolicyAcknowledgementService_1.PolicyAcknowledgementService()) {
        this.ackService = service;
    }
    acknowledge = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const ack = await this.ackService.acknowledge(req.params.id, req.user.userId);
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Policy acknowledged successfully.", ack);
    };
    findById = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        const ack = await this.ackService.findById(req.params.id);
        // RBAC checks
        if (req.user.role === "EMPLOYEE") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (!employee || ack.employeeId !== employee.id) {
                throw AppError_1.AppError.forbidden("Access denied: You can only view your own policy acknowledgements.");
            }
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Policy acknowledgement record retrieved.", ack);
    };
    findAll = async (req, res) => {
        if (!req.user)
            throw AppError_1.AppError.unauthorized();
        let acks = [];
        if (req.user.role === "ADMIN" || req.user.role === "ESG_MANAGER") {
            const { policyId, employeeId } = req.query;
            if (policyId) {
                acks = await this.ackService.findByPolicyId(policyId);
            }
            else if (employeeId) {
                acks = await this.ackService.findByEmployeeId(employeeId);
            }
            else {
                acks = await this.ackService.findAll();
            }
        }
        else if (req.user.role === "DEPARTMENT_HEAD") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee && employee.departmentId) {
                const departmentAcks = await this.ackService.findAll();
                acks = departmentAcks.filter((ack) => ack.employee?.departmentId === employee.departmentId);
            }
            else {
                acks = [];
            }
        }
        else if (req.user.role === "EMPLOYEE") {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user.userId, deletedAt: null },
            });
            if (employee) {
                const { pendingOnly } = req.query;
                if (pendingOnly === "true") {
                    acks = await this.ackService.findPendingByEmployeeId(employee.id);
                }
                else {
                    acks = await this.ackService.findByEmployeeId(employee.id);
                }
            }
            else {
                acks = [];
            }
        }
        else {
            throw AppError_1.AppError.forbidden("Access denied: Insufficient privileges.");
        }
        (0, responseFormatter_1.sendResponse)(res, roles_1.HttpStatus.OK, "Policy acknowledgements retrieved successfully.", acks);
    };
}
exports.PolicyAcknowledgementController = PolicyAcknowledgementController;
