/**
 * API Response Utilities
 *
 * WHY: Every controller needs to send responses in the same envelope shape.
 * Instead of duplicating `{ success: true, message, data }` in every handler,
 * these helpers enforce the standard format and reduce boilerplate.
 *
 * WHERE: Imported by controllers only — never by services or models.
 */

import { Response } from 'express';
import { ApiResponse, HttpStatus, ResponseMeta } from '@/types';

// ─── Success Response ─────────────────────────────────────────────────────────

/**
 * Send a successful JSON response.
 *
 * @example
 * sendSuccess(res, { user }, 'Login successful', HttpStatus.OK);
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HttpStatus.OK,
  meta?: ResponseMeta,
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
}

// ─── Created Response ─────────────────────────────────────────────────────────

/**
 * Send a 201 Created response — for resource creation endpoints.
 */
export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, HttpStatus.CREATED);
}

// ─── No Content Response ──────────────────────────────────────────────────────

/**
 * Send a 204 No Content response — for DELETE or logout endpoints.
 */
export function sendNoContent(res: Response): void {
  res.status(HttpStatus.NO_CONTENT).send();
}

// ─── Error Response ───────────────────────────────────────────────────────────

/**
 * Send an error JSON response.
 * Prefer throwing AppError in services and letting errorHandler.ts handle it.
 * Use this only when you need direct control in a controller.
 */
export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
): void {
  const response: ApiResponse = {
    success: false,
    message,
  };
  res.status(statusCode).json(response);
}
