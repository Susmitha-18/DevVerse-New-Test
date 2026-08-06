/**
 * MongoDB Atlas — Database Connection
 *
 * ARCHITECTURE NOTE:
 * MongoDB Atlas is used EXCLUSIVELY for identity and authentication data:
 *   ✅ User accounts
 *   ✅ JWT refresh tokens / sessions
 *   ✅ User preferences (cloud)
 *   ✅ Connected services metadata (connection status only)
 *
 * NEVER store the following in MongoDB Atlas:
 *   ❌ Source code or project files
 *   ❌ Git repositories
 *   ❌ Docker data
 *   ❌ AI chat history
 *   ❌ Secrets or credentials
 *   ❌ Any local developer workspace data
 *
 * All developer data lives in the local SQLite database (desktop app).
 * See docs/ARCHITECTURE.md for the full hybrid storage specification.
 *
 * WHY MONGOOSE:
 * Raw MongoDB driver requires manual schema management. Mongoose gives us:
 *   - Schema validation at the application layer
 *   - TypeScript type inference via generics
 *   - Built-in timestamps, virtuals, and middleware hooks
 *   - Connection pooling managed automatically
 */

import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

// ─── Connection Options ───────────────────────────────────────────────────────

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  // How long to wait for a connection before timing out
  serverSelectionTimeoutMS: 10_000,

  // How long to wait for a socket operation before timing out
  socketTimeoutMS: 45_000,

  // Maximum number of connections in the pool
  maxPoolSize: 10,

  // Minimum number of connections to keep open
  minPoolSize: 2,

  // Automatically try to reconnect when disconnected
  autoIndex: env.NODE_ENV !== 'production', // Disable in production for performance
};

// ─── Connection State ─────────────────────────────────────────────────────────

let isConnected = false;

// ─── Connect ──────────────────────────────────────────────────────────────────

/**
 * Establishes a connection to MongoDB Atlas with retry logic.
 *
 * Called once from server.ts on startup. Mongoose maintains the connection
 * pool internally — you do not need to call this per-request.
 *
 * @param retries - Number of retry attempts before giving up (default: 5)
 * @param delay   - Delay in ms between retries, doubles each attempt (default: 2000)
 */
export async function connectDatabase(retries = 5, delay = 2000): Promise<void> {
  if (isConnected) {
    logger.info('[MongoDB] Already connected — skipping reconnect');
    return;
  }

  logger.info('[MongoDB] Connecting to Atlas...');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
      isConnected = true;
      logger.info(`[MongoDB] ✅ Connected to Atlas — database: "${mongoose.connection.name}"`);
      return;
    } catch (error) {
      const err = error as Error;
      logger.error(
        `[MongoDB] ❌ Connection attempt ${attempt}/${retries} failed: ${err.message}`,
      );

      if (attempt === retries) {
        throw new Error(
          `[MongoDB] Failed to connect after ${retries} attempts. ` +
            `Check your MONGODB_URI in .env and ensure your Atlas cluster is accessible.\n` +
            `Original error: ${err.message}`,
        );
      }

      // Exponential backoff: 2s → 4s → 8s → 16s
      const backoff = delay * Math.pow(2, attempt - 1);
      logger.warn(`[MongoDB] Retrying in ${backoff / 1000}s...`);
      await sleep(backoff);
    }
  }
}

// ─── Disconnect ───────────────────────────────────────────────────────────────

/**
 * Gracefully closes the MongoDB connection.
 * Called from server.ts during SIGTERM/SIGINT graceful shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    logger.info('[MongoDB] No active connection to close');
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('[MongoDB] 👋 Connection closed gracefully');
  } catch (error) {
    const err = error as Error;
    logger.error(`[MongoDB] Error closing connection: ${err.message}`);
    throw err;
  }
}

// ─── Connection Health ────────────────────────────────────────────────────────

/**
 * Returns the current state of the MongoDB connection.
 * Used by the /health endpoint to report database status.
 *
 * Mongoose readyState values:
 *   0 = disconnected
 *   1 = connected
 *   2 = connecting
 *   3 = disconnecting
 */
export function getDatabaseStatus(): {
  connected: boolean;
  state: string;
  database: string | undefined;
} {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    connected: mongoose.connection.readyState === 1,
    state: stateMap[mongoose.connection.readyState] ?? 'unknown',
    database: mongoose.connection.name,
  };
}

// ─── Connection Event Listeners ───────────────────────────────────────────────

/**
 * Attach Mongoose connection lifecycle events.
 * Called once during app startup so we log all connection state changes.
 */
export function registerDatabaseEvents(): void {
  const conn = mongoose.connection;

  conn.on('connected', () => {
    logger.info('[MongoDB] Event: connected');
    isConnected = true;
  });

  conn.on('disconnected', () => {
    logger.warn('[MongoDB] Event: disconnected — Mongoose will attempt to reconnect');
    isConnected = false;
  });

  conn.on('reconnected', () => {
    logger.info('[MongoDB] Event: reconnected ✅');
    isConnected = true;
  });

  conn.on('error', (err: Error) => {
    logger.error(`[MongoDB] Connection error: ${err.message}`);
  });

  conn.on('close', () => {
    logger.info('[MongoDB] Event: connection closed');
    isConnected = false;
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
