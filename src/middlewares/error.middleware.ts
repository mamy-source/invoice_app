import logger from '../libs/logger.lib.js';
import {env} from '../config/env.js';
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import type { AppErrorInterface } from "../interfaces/appError.interface.js";
import { Prisma } from "../../generated/prisma/client.js";
import { handlePrismaError } from "../utils/prisma-error.util.js";

/**
 * Not Found handler (404)
 */
export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

/**
 * Global error handler
 */

export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    _next
): void => {
    const error = err as AppErrorInterface;

    let statusCode = error.statusCode ?? 500;
    let message = error.message || "Internal Server Error";
    let errors: unknown = null;

    // Logger
    if (env.nodeEnv !== "test") {
        logger.error(message, {
            statusCode,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            stack: error.stack,
            errors: error.errors,
        });
    }

    /**
     * Prisma Errors
     */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = handlePrismaError(error);
    
        statusCode = prismaError.statusCode;
        message = prismaError.message;
    }

    /**
     * Validation Error
     */
    if (error.name === "ValidationError") {
        statusCode = 400;
        message = "Validation error";

        errors = error.details ?? error.errors;
    }

    /**
     * Response
     */
    const response: {
        success: boolean;
        statusCode: number;
        message: string;
        timestamp: string;
        path: string;
        stack?: string;
        errors?: unknown;
    } = {
        success: false,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    };

    if (env.nodeEnv === "development" && error.stack) {
        response.stack = error.stack;
    }

    if (errors) {
        response.errors = errors;
    }

    res.status(statusCode).json(response);
};

/**
 * Async wrapper to avoid try/catch repetition
 */
import type { RequestHandler } from "express";

export const asyncHandler = <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
    fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<any>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
    return (req, res, next) => {
        Promise.resolve(fn(req as Request<P, ResBody, ReqBody, ReqQuery>, res, next)).catch(next);
    };
};
/**
 * Custom error class for application errors
 */

export class AppError extends Error implements AppErrorInterface {
  statusCode: number;

  status: string;

  isOperational: boolean;

  errors?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errors?: unknown,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    this.status =
      statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}