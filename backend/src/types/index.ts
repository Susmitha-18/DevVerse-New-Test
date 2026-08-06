/**
 * Shared TypeScript Types & Custom Error Classes
 *
 * WHY: A centralized types file prevents type duplication across controllers,
 * middleware, and services. The `AppError` class gives us a way to attach an
 * HTTP status code and an `isOperational` flag to any error. Operational errors
 * (e.g. "user not found") are expected — we surface them to the client.
 * Non-operational errors (e.g. database crashes) are bugs — we hide details
 * from clients and alert our logging system.
 *
 * WHERE: Imported by controllers, middleware, and services throughout the app.
 */

// ─── API Response Shape ───────────────────────────────────────────────────────

/**
 * Standardized API response envelope.
 * Every endpoint returns this shape — consistency is key for frontend clients.
 */
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  meta?: ResponseMeta;
}

/**
 * Pagination and request metadata returned with list responses.
 */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Structured validation error — one per invalid field.
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ─── Custom Application Error ─────────────────────────────────────────────────

/**
 * AppError extends the native Error class with two additional properties:
 *
 * - `statusCode`: The HTTP status to send to the client (400, 401, 403, 404, 500…)
 * - `isOperational`: true = expected error (show to client), false = bug (log only)
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Email already in use', 409);
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace, excluding the constructor itself
    Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly — required when extending built-ins in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);

    // Name the error class for cleaner logging
    this.name = 'AppError';
  }
}

// ─── HTTP Status Codes ────────────────────────────────────────────────────────

/**
 * Named HTTP status codes — use these instead of magic numbers.
 *
 * @example
 * throw new AppError('Not found', HttpStatus.NOT_FOUND);
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
