/**
 * Application Logger
 *
 * WHY: `console.log` in production is an anti-pattern. It has no levels,
 * no timestamps, no structured output, and can't be turned off. Winston
 * gives us leveled, timestamped, formatted logs with separate transports
 * for console (dev) and file (production).
 *
 * WHERE: Imported by every module that needs logging — server startup,
 * database connection, middleware, controllers, services.
 *
 * HOW IT WORKS:
 *   - Development: colorized, human-readable logs in the terminal
 *   - Production : structured JSON logs written to files
 *   - Error logs : always written to `logs/error.log` regardless of env
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '@/config/env';

// ─── Ensure logs directory exists ─────────────────────────────────────────────

const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ─── Custom Log Format ────────────────────────────────────────────────────────

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

/**
 * Human-readable format for development.
 * Example output:
 *   2026-08-01 14:00:00 [INFO]  Server started on port 5000
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `${ts as string} [${level}] ${message as string}\n${stack as string}`
      : `${ts as string} [${level}] ${message as string}`;
  }),
);

/**
 * Structured JSON format for production.
 * Easily ingested by log aggregators (CloudWatch, Datadog, Splunk).
 */
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

// ─── Transports ───────────────────────────────────────────────────────────────

const transports: winston.transport[] = [
  // Always log errors to a dedicated file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    format: prodFormat,
  }),
];

if (env.NODE_ENV === 'production') {
  // In production: write all logs as JSON to combined.log
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      format: prodFormat,
    }),
  );
} else {
  // In development: write to console with colors
  transports.push(
    new winston.transports.Console({
      format: devFormat,
    }),
  );
}

// ─── Logger Instance ──────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  silent: env.NODE_ENV === 'test', // Silence during tests — no noise in test output
  transports,
  // Don't crash the process on uncaught exceptions — we handle those in server.ts
  exitOnError: false,
});

// ─── HTTP Request Logger Stream (for Morgan) ──────────────────────────────────

/**
 * Morgan needs a write stream. We pipe it through our Winston logger
 * so HTTP access logs use the same format and transport as all other logs.
 */
export const morganStream = {
  write: (message: string): void => {
    // Morgan adds a trailing newline — strip it
    logger.http(message.trim());
  },
};
