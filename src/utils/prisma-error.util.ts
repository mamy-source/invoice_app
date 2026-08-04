import { Prisma } from "../../generated/prisma/client.js";

export interface PrismaErrorResponse {
    statusCode: number;
    message: string;
}

export function handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError
): PrismaErrorResponse {
    switch (error.code) {
        case "P2002": {
            const field =
                (error.meta?.target as string[] | undefined)?.[0] ??
                "field";

            return {
                statusCode: 409,
                message: `Duplicate value for "${field}".`,
            };
        }

        case "P2003":
            return {
                statusCode: 400,
                message: "Foreign key constraint failed.",
            };

        case "P2025":
            return {
                statusCode: 404,
                message: "Record not found.",
            };

        case "P2024":
            return {
                statusCode: 503,
                message: "Database connection timeout.",
            };

        default:
            return {
                statusCode: 400,
                message: error.message,
            };
    }
}