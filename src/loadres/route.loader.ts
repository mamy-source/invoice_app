// import apiRoutes from '../routes/index.js';
import { env } from '../config/env.js';
import logger from '../libs/logger.lib.js';
import type { Express, Request, Response } from 'express';

function routesLoader(app:Express): Express {
  // Health check endpoint
  app.get('/health', (_req:Request, res:Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.nodeEnv,
    });
  });
  
  // Readiness probe (for k8s)
  app.get('/ready', (_req:Request, res:Response) => {
    res.status(200).json({ status: 'ready' });
  });
  
  // Liveness probe (for k8s)
  app.get('/live', (_req:Request, res:Response) => {
    res.status(200).json({ status: 'alive' });
  });
  
  // API routes
//   app.use('/api', apiRoutes);
  
  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });
  
  logger.info('Routes configured');
  
  return app;
}

export default routesLoader;