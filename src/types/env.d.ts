import type { Prisma } from "@prisma/client/extension";
import type e from "express";

declare namespace NodeJS {
    interface ProcessEnv{
        NODE_ENV: 'development' | 'production' | 'test';
        PORT?: string;
        DATABASE_URL: string;
        EMAIL_HOST: string;
        EMAIL_PORT: number;
        EMAIL_USERNAME: string;
        EMAIL_PASSWORD: string;
    }
}

declare global {
    var prisma: PrismaClient | undefined;
}
export {};
