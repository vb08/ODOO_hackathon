import { Category } from "@prisma/client";
import { ICategoryRepository } from "../interfaces/ICategoryRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { AppError } from "../utils/AppError";
import { auditLogger } from "./ActivityLogService";

export interface CreateCategoryDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  code?: string;
  description?: string;
}

export class CategoryService {
  private categoryRepo: ICategoryRepository;

  constructor(repo: ICategoryRepository = new CategoryRepository()) {
    this.categoryRepo = repo;
  }

  public async create(dto: CreateCategoryDto, callerUserId: string): Promise<Category> {
    const existing = await this.categoryRepo.findByCode(dto.code);
    if (existing) {
      throw AppError.conflict(`Category with code ${dto.code} already exists.`);
    }

    const category = await this.categoryRepo.create({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      createdByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      newValue: category,
    });

    return category;
  }

  public async findById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw AppError.notFound(`Category with ID ${id} not found.`);
    }
    return category;
  }

  public async findAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  public async update(id: string, dto: UpdateCategoryDto, callerUserId: string): Promise<Category> {
    const oldState = await this.findById(id);

    if (dto.code && dto.code !== oldState.code) {
      const existing = await this.categoryRepo.findByCode(dto.code);
      if (existing) {
        throw AppError.conflict(`Category with code ${dto.code} already exists.`);
      }
    }

    const updated = await this.categoryRepo.update(id, {
      name: dto.name,
      code: dto.code,
      description: dto.description,
      updatedByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "Category",
      entityId: id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async delete(id: string, callerUserId: string): Promise<Category> {
    const oldState = await this.findById(id);

    const deleted = await this.categoryRepo.delete(id, callerUserId);

    await auditLogger.log({
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
