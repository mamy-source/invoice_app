import databaseLoader from "./database.loader.js";
import expressLoader from "./express.loader.js";
import routesLoader from "./route.loader.js";
import logger from "../libs/logger.lib.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import type { Express } from "express";

//Loader principal
async function initLoaders(app:Express): Promise<void> {
    try {
      // 1. Database (Prisma)
      await databaseLoader();
      logger.info(' Database loader initialized');
  
      // 2. Express middlewares de base (helmet, cors, json, etc.)
      expressLoader();
      logger.info(' Express loader initialized');
  
  
      // 4. Routes (API endpoints)
      routesLoader(app);
      logger.info('Routes loader initialized');
  
      // 5. Error handler (farany indrindra)
      app.use(errorHandler);
      logger.info('Error handler initialized');
  
      logger.info('All loaders completed successfully');
    } catch (error) {
        if (error instanceof Error) {
            logger.error('Failed to initialize loaders:', error.message);
        }else{
            logger.error('Failed to initialize loaders:', String(error));
        }

      throw error;
    }
  }
  
  export default initLoaders;