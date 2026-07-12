import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { sendResponse } from "../utils/responseFormatter";
import { HttpStatus } from "../constants/roles";
import { AppError } from "../utils/AppError";

/**
 * Controller layer handling ESG Category CRUD endpoints.
 */
export class CategoryController {
  private categoryService: CategoryService;

  constructor(service: CategoryService = new CategoryService()) {
    this.categoryService = service;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const category = await this.categoryService.create(req.body, req.user.userId);
    sendResponse(res, HttpStatus.CREATED, "Category created successfully.", category);
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    const category = await this.categoryService.findById(req.params.id);
    sendResponse(res, HttpStatus.OK, "Category retrieved successfully.", category);
  };

  public findAll = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.findAll();
    sendResponse(res, HttpStatus.OK, "Categories retrieved successfully.", categories);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const category = await this.categoryService.update(req.params.id, req.body, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Category updated successfully.", category);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw AppError.unauthorized();
    const category = await this.categoryService.delete(req.params.id, req.user.userId);
    sendResponse(res, HttpStatus.OK, "Category deleted successfully (soft delete).", category);
  };
}
