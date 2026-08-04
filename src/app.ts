import express, { type Express }  from "express";
import initLoaders from "./loadres/index.js";
import logger from "./libs/logger.lib.js";



const app: Express = express();

const startApp = async() =>{
    try {
        await initLoaders(app);
        logger.info('Application initialized successfully');
        return app;
    } catch (error) {
        if (error instanceof Error) {
            logger.error('Failed to start application:', error.message);
        }else {
            logger.error('Failed to start application:', String(error));
        }
        throw error;
    }
}

export {app, startApp};
