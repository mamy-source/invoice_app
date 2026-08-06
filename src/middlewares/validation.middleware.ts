import type { Request, Response, NextFunction } from "express";
import { z, ZodError, type ZodType } from "zod";

import { AppError } from "./error.middleware.js";

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