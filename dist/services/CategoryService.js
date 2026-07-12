"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const CategoryRepository_1 = require("../repositories/CategoryRepository");
const AppError_1 = require("../utils/AppError");
const ActivityLogService_1 = require("./ActivityLogService");
class CategoryService {
    categoryRepo;
    constructor(repo = new CategoryRepository_1.CategoryRepository()) {
        this.categoryRepo = repo;
    }
    async create(dto, callerUserId) {
        const existing = await this.categoryRepo.findByCode(dto.code);
        if (existing) {
            throw AppError_1.AppError.conflict(`Category with code ${dto.code} already exists.`);
        }
        const category = await this.categoryRepo.create({
            name: dto.name,
            code: dto.code,
            description: dto.description,
            createdByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "CREATE",
            entity: "Category",
            entityId: category.id,
            newValue: category,
        });
        return category;
    }
    async findById(id) {
        const category = await this.categoryRepo.findById(id);
        if (!category) {
            throw AppError_1.AppError.notFound(`Category with ID ${id} not found.`);
        }
        return category;
    }
    async findAll() {
        return this.categoryRepo.findAll();
    }
    async update(id, dto, callerUserId) {
        const oldState = await this.findById(id);
        if (dto.code && dto.code !== oldState.code) {
            const existing = await this.categoryRepo.findByCode(dto.code);
            if (existing) {
                throw AppError_1.AppError.conflict(`Category with code ${dto.code} already exists.`);
            }
        }
        const updated = await this.categoryRepo.update(id, {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            updatedByUser: { connect: { id: callerUserId } },
        });
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "UPDATE",
            entity: "Category",
            entityId: id,
            oldValue: oldState,
            newValue: updated,
        });
        return updated;
    }
    async delete(id, callerUserId) {
        const oldState = await this.findById(id);
        const deleted = await this.categoryRepo.delete(id, callerUserId);
        await ActivityLogService_1.auditLogger.log({
            userId: callerUserId,
            action: "DELETE",
            entity: "Category",
            entityId: id,
            oldValue: oldState,
            newValue: { ...oldState, deletedAt: deleted.deletedAt, deletedByUserId: callerUserId },
        });
        return deleted;
    }
}
exports.CategoryService = CategoryService;
