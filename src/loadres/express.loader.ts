import express, {
    type Request,
    type Express,
    type Response,
    type NextFunction,
  } from "express";
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "../config/env.js";
import logger from "../libs/logger.lib.js";
import { generalRateLimit } from "../middlewares/rate-limite.middleware.js";


function expressLoader(app: Express): void {

    //Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); 

    //security headers
    app.use(helmet());
    app.use(generalRateLimit);

    //cors
    const corsOptions = {
        origin: env.cors.origins,
        credentials: env.cors.credentials === true,
        methodes: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Total-Pages'],
    };
    app.use(cors(corsOptions));

       

    //Cookie parser
    app.use(cookieParser());

    //Trust proxy (for rate limiting and IP address)
    if (env.nodeEnv === 'production') {
        app.set('trust proxy', 1);
    }

    //Request logging  in development
    if (env.nodeEnv === "development") {
        app.use((req: Request, _res: Response, next: NextFunction) => {
          logger.info(`Incoming request: ${req.method} ${req.url}`);
          next();
        });
      }
    logger.info('Express loader initialized');


}
export default expressLoader;