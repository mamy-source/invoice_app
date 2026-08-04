import type { Prisma } from "@prisma/client/extension";
import type e from "express";

declare namespace NodeJS {
    interface ProcessEnv{
        NODE_ENV: 'development' | 'production' | 'test';
        PORT: string;

        DATABASE_URL: string;

        SMPT_HOST: string;
        SMPT_PORT: string;
        SMPT_USERNAME: string;
        SMPT_PASSWORD: string;

        PDF_OUTPUT_DIR: string;

        CORS_ORIGIN: string;
        CORS_CREDENTIALS: string;

        RATE_LIMIT_WINDOW_MS: string;
        RATE_LIMIT_MAX_REQUESTS: string;

        LOG_LEVEL:
            | "error"
            | "warn"
            | "info"
            | "http"
            | "verbose"
            | "debug";

        LOG_DIR: string;
        LOG_TO_FILE: "true" | "false";
    }
}

declare global {
    var prisma: PrismaClient | undefined;
}
export {};
