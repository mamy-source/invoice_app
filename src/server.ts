import {app, startApp} from "./app.js";
import type { Server } from "node:http";
import logger from "./libs/logger.lib.js";


const PORT = process.env["PORT"] || 3000;
const bootstrap = async (): Promise<void> => {
  try {
    await startApp();

    const server: Server = app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

    // Graceful shutdown
    const shutdown = (signal: string): void => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    if (error instanceof Error) {
      logger.error("Server startup failed", error.message);
    }else{
        logger.error("Server startup failed", String(error));
    }
    process.exit(1);
  }
};

bootstrap();