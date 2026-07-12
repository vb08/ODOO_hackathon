import { EmissionFactor } from "@prisma/client";
import { IEmissionFactorRepository } from "../../interfaces/IEmissionFactorRepository";
import { EmissionFactorRepository } from "../../repositories/EmissionFactorRepository";
import { AppError } from "../../utils/AppError";
import { auditLogger } from "../ActivityLogService";

export interface CreateEmissionFactorDto {
  name: string;
  factor: number;
  unit: string;
  sourceType: string;
  description?: string;
}

export interface UpdateEmissionFactorDto {
  name?: string;
  factor?: number;
  unit?: string;
  sourceType?: string;
  description?: string;
}

export class EmissionFactorService {
  private factorRepo: IEmissionFactorRepository;

  constructor(repo: IEmissionFactorRepository = new EmissionFactorRepository()) {
    this.factorRepo = repo;
  }

  public async create(dto: CreateEmissionFactorDto, callerUserId: string): Promise<EmissionFactor> {
    const existing = await this.factorRepo.findByName(dto.name);
    if (existing) {
      throw AppError.conflict(`Emission factor with name '${dto.name}' already exists.`);
    }

    const factor = await this.factorRepo.create({
      name: dto.name,
      factor: dto.factor,
      unit: dto.unit,
      sourceType: dto.sourceType,
      description: dto.description,
      createdByUser: { connect: { id: callerUserId } },
    });

    await auditLogger.log({
      userId: callerUserId,
      action: "CREATE",
      entity: "EmissionFactor",
      entityId: factor.id,
      newValue: factor,
    });

    return factor;
  }

  public async findById(id: string): Promise<EmissionFactor> {
    const factor = await this.factorRepo.findById(id);
    if (!factor) {
      throw AppError.notFound(`Emission factor with ID ${id} not found.`);
    }
    return factor;
  }

  public async findAll(): Promise<EmissionFactor[]> {
    return this.factorRepo.findAll();
  }

  public async findBySourceType(sourceType: string): Promise<EmissionFactor[]> {
    return this.factorRepo.findBySourceType(sourceType);
  }

  public async update(id: string, dto: UpdateEmissionFactorDto, callerUserId: string): Promise<EmissionFactor> {
    const oldState = await this.findById(id);

    if (dto.name && dto.name !== oldState.name) {
      const existing = await this.factorRepo.findByName(dto.name);
      if (existing) {
        throw AppError.conflict(`Emission factor with name '${dto.name}' already exists.`);
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

    await auditLogger.log({
      userId: callerUserId,
      action: "UPDATE",
      entity: "EmissionFactor",
      entityId: id,
      oldValue: oldState,
      newValue: updated,
    });

    return updated;
  }

  public async delete(id: string, callerUserId: string): Promise<EmissionFactor> {
    const oldState = await this.findById(id);
    const deleted = await this.factorRepo.delete(id, callerUserId);

    await auditLogger.log({
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
