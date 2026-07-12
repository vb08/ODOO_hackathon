import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

/**
 * Higher-order Express middleware for validating request payload components via Zod schemas.
 * Validates request `body`, `query`, and `params`.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Re-assign parsed inputs to request object to utilize normalized and coerced Zod data
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map individual Zod issues into simplified key-value reports
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.slice(1).join("."), // removes 'body' or 'query' wrapping prefix
          message: err.message,
        }));
        
        next(AppError.badRequest("Validation failed", formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
