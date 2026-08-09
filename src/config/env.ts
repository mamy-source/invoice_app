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
    puppeteerExecutablePath: required('PUPPETEER_EXECUTABLE_PATH') || "/usr/bin/google-chrome",
    appUrl: required('APP_URL'),

    smtp: {
        host: required('SMTP_HOST'),
        port: Number(required('SMTP_PORT')),
        user: required('SMTP_USERNAME'),
        pass: required('SMTP_PASSWORD'),
        emeilFrom: required('SMTP_FROM')
    },
    pdf: {
        outputDir: required('PDF_OUTPUT_DIR'),
    },

    cors: {
        origins: required('CORS_ORIGIN').split(',').map(origin => origin.trim()),
        credentials:  required('CORS_CREDENTIALS') === 'true',

    },

    rateLimit: {
        windowMs: Number(required('RATE_LIMIT_WINDOW_MS')),
        maxRequests: Number(required('RATE_LIMIT_MAX_REQUESTS')),
    },

    logger: {
        level: required('LOG_LEVEL'),
        dir: required('LOG_DIR'),
        toFile: required('LOG_TO_FILE') === 'true',
    }
} as const;