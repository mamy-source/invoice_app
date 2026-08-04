import type { Prisma } from "../../generated/prisma/client.js";

export interface AppErrorInterface extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;

    code?: string;

    meta?: Prisma.PrismaClientKnownRequestError["meta"];

    details?: unknown;
    errors?: unknown;
}