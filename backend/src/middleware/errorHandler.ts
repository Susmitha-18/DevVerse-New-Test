/**
 * Global Error Handler Middleware
 *
 * WHY: In Express, any middleware with exactly 4 parameters
 * `(err, req, res, next)` is treated as an error handler. All errors
 * thrown anywhere in the app (via `throw new AppError(...)` or
 * `next(error)`) flow here. This is the single place we decide:
 *
 *   1. Is this a known operational error? → Send clean JSON to client.
 *   2. Is this an unknown bug?            → Log details, send generic message.
 *   3. Are we in development?             → Include stack trace in response.
 *   4. Are we in production?              → Hide internals from the client.
 *
 * WHERE: Registered LAST in app.ts — after all routes and the 404 handler.
 * Express error middleware MUST be registered last.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse, HttpStatus } from '@/types';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

// ─── Error Normalizers ────────────────────────────────────────────────────────

/**
 * Mongoose CastError: happens when an invalid ObjectId is passed.
 * e.g. GET /users/not-a-valid-id
 */
function handleCastError(err: { path: string; value: unknown }): AppError {
  return new AppError(`Invalid value for field: ${err.path}`, HttpStatus.BAD_REQUEST);
}

/**
 * Mongoose duplicate key error (code 11000).
 * e.g. registering with an email that already exists.
 */
function handleDuplicateKeyError(err: { keyValue: Record<string, unknown> }): AppError {
  const field = Object.keys(err.keyValue)[0] ?? 'field';
  const value = err.keyValue[field];
  return new AppError(
    `Duplicate value for ${field}: "${String(value)}". Please use a different value.`,
    HttpStatus.CONFLICT,
  );
}

/**
 * Mongoose ValidationError: schema-level validation failed.
 * e.g. required field missing.
 */
function handleValidationError(err: { errors: Record<string, { message: string }> }): AppError {
  const messages = Object.values(err.errors)
    .map((e) => e.message)
    .join('. ');
  return new AppError(`Validation failed: ${messages}`, HttpStatus.UNPROCESSABLE_ENTITY);
}

/**
 * JWT errors — invalid or expired tokens.
 */
function handleJWTError(): AppError {
  return new AppError('Invalid token. Please log in again.', HttpStatus.UNAUTHORIZED);
}

function handleJWTExpiredError(): AppError {
  return new AppError('Your session has expired. Please log in again.', HttpStatus.UNAUTHORIZED);
}

// ─── Response Senders ─────────────────────────────────────────────────────────

function sendDevelopmentError(err: AppError, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: err.message,
    // In development, expose the stack trace so we can debug quickly
    data: {
      stack: err.stack,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    } as unknown as null,
  };
  res.status(err.statusCode).json(response);
}

function sendProductionError(err: AppError, res: Response): void {
  if (err.isOperational) {
    // Operational (expected) errors: safe to show to the client
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
  } else {
    // Programming/unknown errors: log it, send generic message
    logger.error('UNEXPECTED ERROR', { error: err });
    const response: ApiResponse = {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }
}

// ─── Global Error Handler ─────────────────────────────────────────────────────

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Cast to AppError — we'll normalize below if it's not one
  let error =
    err instanceof AppError
      ? err
      : new AppError(
          err.message || 'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          false,
        );

  // Log every error with the appropriate level
  if (error.statusCode >= 500) {
    logger.error(`[${error.statusCode}] ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`[${error.statusCode}] ${error.message}`);
  }

  // Normalize known framework errors into AppErrors
  const errName = err.name;
  const errCode = (err as { code?: number }).code;

  if (errName === 'CastError') {
    error = handleCastError(err as unknown as { path: string; value: unknown });
  } else if (errCode === 11000) {
    error = handleDuplicateKeyError(err as unknown as { keyValue: Record<string, unknown> });
  } else if (errName === 'ValidationError') {
    error = handleValidationError(
      err as unknown as { errors: Record<string, { message: string }> },
    );
  } else if (errName === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (errName === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send appropriate response based on environment
  if (env.NODE_ENV === 'development') {
    sendDevelopmentError(error, res);
  } else {
    sendProductionError(error, res);
  }
};
