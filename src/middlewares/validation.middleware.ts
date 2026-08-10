import type { Request, Response, NextFunction } from "express";
import { z, ZodError, type ZodType } from "zod";

import { AppError } from "./error.middleware.js";
import logger from "../libs/logger.lib.js";

type ValidationLocals = {
  validated: unknown;
};

/**
 * Validate request body with Zod schema
 */
export const validate =
  (schema: ZodType) =>
  async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = z.flattenError(error);

        logger.warn("Validation error", {
          errors: validationErrors.fieldErrors,
          path: req.path,
          method: req.method,
        });

        return next(
          new AppError(
            "Validation failed",
            400,
            validationErrors.fieldErrors
          )
        );
      }

      next(error);
    }
  };

/**
 * Validate params, query and body with Zod
 */
export const validateWithOptions =
  (
    schema: z.ZodType,
    _options: {
      stripUnknown?: boolean;
      strict?: boolean;
    } = {}
  ) =>
  (
    req: Request,
    res: Response<any, ValidationLocals>,
    next: NextFunction
  ): void => {
    try {
      const validated = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });

      /**
       * Store validated data in res.locals
       * instead of modifying req.query.
       */
      res.locals["validated"]  = validated;

      /**
       * Params can still be assigned safely.
       */
      if (
        validated &&
        typeof validated === "object" &&
        "params" in validated &&
        validated.params
      ) {
        req.params = validated.params as typeof req.params;
      }

      /**
       * Body can still be assigned.
       */
      if (
        validated &&
        typeof validated === "object" &&
        "body" in validated &&
        validated.body
      ) {
        req.body = validated.body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        logger.warn("Validation error", {
          errors,
          path: req.path,
          method: req.method,
        });

        return next(
          new AppError(
            "Validation failed",
            400,
            errors
          )
        );
      }

      next(error);
    }
  };