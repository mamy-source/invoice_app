import "dotenv/config";

function required(name: keyof NodeJS.ProcessEnv): string {
    const value = process.env[name];
    if (!value){
        throw new Error(`Environment variable "${name}" is missing.`);

    }
    return value;

}

export const env = {
    port : Number(process.env["PORT"]) || 3000,
    nodeEnv: required('NODE_ENV'),
    databaseUrl: required('DATABASE_URL'),

    smtp: {
        host: required('EMAIL_HOST'),
        port: Number(required('EMAIL_PORT')),
        user: required('EMAIL_USERNAME'),
        pass: required('EMAIL_PASSWORD'),
    }
} as const;