/**
 * 404 Not Found Handler
 *
 * WHY: Express only reaches this middleware if NO route matched the request.
 * Instead of sending a bare HTML "Cannot GET /xyz" response (Express default),
 * we return a consistent JSON response matching our ApiResponse envelope.
 *
 * WHERE: Registered in app.ts AFTER all route definitions.
 * If registered before routes, it would intercept all requests.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, HttpStatus } from '@/types';

/**
 * Catches any request that didn't match a registered route.
 * Creates an AppError and passes it to the global error handler.
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    HttpStatus.NOT_FOUND,
  );
  next(error);
};
