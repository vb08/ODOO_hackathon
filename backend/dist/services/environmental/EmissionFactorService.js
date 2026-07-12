"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmissionFactorService = void 0;
const EmissionFactorRepository_1 = require("../../repositories/EmissionFactorRepository");
const AppError_1 = require("../../utils/AppError");
const ActivityLogService_1 = require("../ActivityLogService");
class EmissionFactorService {
    factorRepo;
    constructor(repo = new EmissionFactorRepository_1.EmissionFactorRepository()) {
        this.factorRepo = repo;
    }
    async create(dto, callerUserId) {
        const existing = await this.factorRepo.findByName(dto.name);
        if (existing) {
            throw AppError_1.AppError.conflict(`Emission factor with name '${dto.name}' already exists.`);
        }
        const factor = await this.factorRepo.create({
            name: dto.name,
            factor: dto.factor,
            unit: dto.unit,
            sourceType: dto.sourceType,
            description: dto.description,
            createdByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "EmissionFactor",
            entityId: factor.id,
            newValue: factor,
        });
        return factor;
    }
    async findById(id) {
        const factor = await this.factorRepo.findById(id);
        if (!factor) {
            throw AppError_1.AppError.notFound(`Emission factor with ID ${id} not found.`);
        }
        return factor;
    }
    async findAll() {
        return this.factorRepo.findAll();
    }
    async findBySourceType(sourceType) {
        return this.factorRepo.findBySourceType(sourceType);
    }
    async update(id, dto, callerUserId) {
        const oldState = await this.findById(id);
        if (dto.name && dto.name !== oldState.name) {
            const existing = await this.factorRepo.findByName(dto.name);
            if (existing) {
                throw AppError_1.AppError.conflict(`Emission factor with name '${dto.name}' already exists.`);
            }
        }
        const updated = await this.factorRepo.update(id, {
            name: dto.name,
            factor: dto.factor,
            unit: dto.unit,
            sourceType: dto.sourceType,
            description: dto.description,
            updatedByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "EmissionFactor",
            entityId: id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.factorRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "EmissionFactor",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
}
exports.EmissionFactorService = EmissionFactorService;
