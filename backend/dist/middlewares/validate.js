"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
/**
 * Higher-order Express middleware for validating request payload components via Zod schemas.
 * Validates request `body`, `query`, and `params`.
 */
const validate = (schema) => {
    return async (req, _res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Map individual Zod issues into simplified key-value reports
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.slice(1).join("."), // removes 'body' or 'query' wrapping prefix
                    message: err.message,
                }));
                next(AppError_1.AppError.badRequest("Validation failed", formattedErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
