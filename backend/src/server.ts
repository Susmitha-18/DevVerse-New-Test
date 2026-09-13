/**
 * Server Entry Point
 *
 * WHY THIS FILE EXISTS:
 * This is the ONLY file responsible for starting the HTTP server.
 * It imports the configured Express `app` and binds it to a port.
 * Keeping this separate from app.ts means tests can import the app
 * without ever starting a real server.
 *
 * RESPONSIBILITIES:
 * - Start the HTTP server
 * - Connect to MongoDB (Step 4)
 * - Handle process-level errors (uncaughtException, unhandledRejection)
 * - Gracefully shut down on SIGTERM / SIGINT
 *
 * GRACEFUL SHUTDOWN:
 * When Kubernetes/Docker/PM2 sends SIGTERM, we:
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete
 * 3. Close the database connection
 * 4. Exit with code 0
 * This prevents data corruption and dropped requests during deployments.
 */

import { app } from './app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { connectDatabase, disconnectDatabase, registerDatabaseEvents } from '@/database/connection';

// ─── Catch Synchronous Errors Before Server Starts ───────────────────────────

/**
 * Uncaught exceptions are programming bugs — log and exit immediately.
 * The process is in an unknown state and cannot safely continue.
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION — Shutting down...', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// ─── Start Server ─────────────────────────────────────────────────────────────

// Register DB event listeners before connecting
registerDatabaseEvents();

// Connect to MongoDB Atlas, then start the HTTP server
// WHY: We connect to the database first. If the DB is unavailable,
// the server never starts — preventing a degraded running state.
void connectDatabase()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      logger.info('═══════════════════════════════════════════');
      logger.info(`  ${env.APP_NAME} v${env.APP_VERSION}`);
      logger.info(`  Environment : ${env.NODE_ENV}`);
      logger.info(`  Port        : ${env.PORT}`);
      logger.info(`  Health      : http://localhost:${env.PORT}/health`);
      logger.info(`  API         : http://localhost:${env.PORT}/api/v1`);
      logger.info('═══════════════════════════════════════════');
    });

    // ── Catch Async Errors After Server Starts ──────────────────────────
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('UNHANDLED REJECTION — Shutting down...', { reason });
      server.close(() => {
        process.exit(1);
      });
    });

    // ── Graceful Shutdown ───────────────────────────────────────────────
    function gracefulShutdown(signal: string): void {
      logger.info(`${signal} received — starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed — no new connections accepted');
        await disconnectDatabase();
        logger.info('Graceful shutdown complete. Goodbye! 👋');
        process.exit(0);
      });

      // Force shutdown after 30 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
      }, 30_000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((error: Error) => {
    logger.error('Failed to start server — database connection error', {
      error: error.message,
    });
    process.exit(1);
  });
