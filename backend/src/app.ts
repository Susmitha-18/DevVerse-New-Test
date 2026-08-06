/**
 * Express Application Config — DevVerse Backend
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from '@/config/env';
import { morganStream } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';

import authRoutes from '@/routes/auth.routes';
import adminRoutes from '@/routes/admin.routes';

export function createApp(): Application {
  const app: Application = express();

  // ── 1. Security Headers ───────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ── 2. CORS ───────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (_origin, callback) => {
        // Allow all desktop & browser origins
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token', 'x-nmars-vault-token'],
    }),
  );

  // ── 3. Request Parsers & Body Limit ───────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── 4. Compression ────────────────────────────────────────────────────────
  app.use(compression());

  // ── 5. Logging ────────────────────────────────────────────────────────────
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

  // ── 6. Health Checks ──────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'DevVerse API is healthy',
      data: {
        environment: env.NODE_ENV,
        version: env.APP_VERSION,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
    });
  });

  // Feature routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 Handler
  app.use(notFound);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
