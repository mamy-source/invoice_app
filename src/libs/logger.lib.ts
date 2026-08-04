import winston from "winston";
import path from "path";
import  fs from "fs";
import { env } from "../config/env.js";
import type { Request } from "express";




//create log directory if not exist
const logDir = path.join(process.cwd(), env.logger.dir || "logs");
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir, {recursive: true});
}

//Safe JSON stringify 
const safeStringify = (obj: Object) => 
    JSON.stringify(
        obj,
        (_, value) => typeof value === "bigint" ? value.toString : value,
        2
    );
// Custom development format
const devFormat = winston.format.printf(
    ({ level, message, timestamp, ...meta }) => {
      const metaStr =
        Object.keys(meta).length > 0
          ? `\nMetadata: ${safeStringify(meta)}`
          : "";
  
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    }
);
// Production format
const prodFormat = winston.format.json();

// Choose format based on environment
const logFormat =
  env.nodeEnv === "production"
    ? prodFormat
    : devFormat;

    // Create logger instance
const logger = winston.createLogger({
    level: env.logger.level || "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.errors({
        stack: true,
      }),
      winston.format.splat(),
      logFormat
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
      }),
  
      new winston.transports.File({
        filename: path.join(logDir, "combined.log"),
      }),
    ],
});

// File logging (production)
if (
    env.nodeEnv === "production" ||
    env.logger.toFile 
  ) {
    // Errors only
    logger.add(
      new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
        format: winston.format.json(),
      })
    );
    // All logs
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: winston.format.json(),
    })
  );

  // HTTP logs
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "http.log"),
      level: "http",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: winston.format.json(),
    })
  );
}


export default {
    error: (message:string, meta = {}) =>
      logger.error(message, meta),
  
    warn: (message:string, meta = {}) =>
      logger.warn(message, meta),
  
    info: (message:string, meta = {}) =>
      logger.info(message, meta),
  
    http: (message:string, meta = {}) =>
      logger.http(message, meta),
  
    debug: (message:string, meta = {}) =>
      logger.debug(message, meta),
  
    silly: (message:string, meta = {}) =>
      logger.silly(message, meta),
  
    // Request logging
    logRequest: (req:Request, duration:number) => {
      logger.http(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        duration: `${duration}ms`,
      });
    },
  
    // Database query logging
    logQuery: (
      model:string,
      action:string,
      duration:string,
      data = {}
    ) => {
      logger.debug(`Prisma: ${model}.${action}`, {
        model,
        action,
        duration: `${duration}ms`,
        ...data,
      });
    },
  
    // Business events logging
    logEvent: (
      event:string,
      userId:string,
      details = {}
    ) => {
      logger.info(`Event: ${event}`, {
        event,
        userId,
        timestamp: new Date().toISOString(),
        ...details,
      });
    },
  };

