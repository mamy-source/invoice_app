import prisma from "../config/prisma.js";
import logger from "../libs/logger.lib.js";

async function databaseLoader(){
    try {
        await prisma.$connect();
        logger.info('Database connected successfully');

        if (process.env["NODE_ENV"] === 'developement'){
            const result = await prisma.$queryRaw`SELECT 1 as connected`;
            logger.info(`Database connection test result: ${JSON.stringify(result)}`)
        }
        return prisma;
    } catch (error) {
        if (error instanceof Error) {
            logger.error("Database connection failed", error.message);
        } else {
            logger.error("Database connection failed", String(error));
        }
        throw error;
    }
}

export default databaseLoader;
export { prisma };