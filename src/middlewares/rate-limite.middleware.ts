import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import logger from '../libs/logger.lib.js';
import type { Request, Response, NextFunction } from 'express';
import type { Options } from "express-rate-limit";

// Helper function to get IP address (works with IPv4 and IPv6)
const getIpAddress = (req: Request): string => {
    return req.ip || req.socket.remoteAddress || "unknown";
};
//Genral API rate limit
export const generalRateLimit =  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.maxRequests ,
    message: {
      success: false,
      message: '⏰ Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((env.rateLimit.windowMs || 900000) / 1000 / 60),
    },
    standardHeaders: true,
    legacyHeaders: false, 

    skip: (req: Request) => {
        return req.path === '/health' || req.path === '/ready' || req.path === '/live';
      },
      handler: (req: Request, res:Response, _next:NextFunction, options:Options) => {
        logger.warn("Rate limit exceeded", {
            ip: getIpAddress(req),
            method: req.method,
            path: req.originalUrl,
        });
        res.status(options.statusCode).json(options.message);
      },
})
