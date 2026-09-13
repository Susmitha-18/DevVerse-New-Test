/**
 * Authentication Input Validators
 *
 * WHY express-validator:
 * Validation MUST happen at the edge — before any business logic runs.
 * express-validator gives us declarative, chainable validation rules that
 * run as middleware. If validation fails, we return 422 immediately and
 * never touch the database.
 *
 * PATTERN:
 * Each exported array is a middleware chain:
 *   [validationRule1, validationRule2, ..., handleValidationErrors]
 *
 * The last item (handleValidationErrors) collects all errors and responds
 * with 422 + list of field errors if any rule failed.
 *
 * WHERE: Applied in route definitions between the route path and controller.
 *   router.post('/register', registerValidator, authController.register)
 */

import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, HttpStatus, ValidationError } from '@/types';

// ─── Validation Error Handler ─────────────────────────────────────────────────

/**
 * Must be the LAST item in every validator array.
 * Collects all validation errors and responds with 422 if any exist.
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg as string,
      value: err.type === 'field' ? (err.value as unknown) : undefined,
    }));

    const response: ApiResponse = {
      success: false,
      message: 'Validation failed. Please check the fields below.',
      errors: validationErrors,
    };

    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(response);
    return;
  }

  next();
};

// ─── Register Validator ───────────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/v1/auth/register
 */
export const registerValidator = [
  // Full Name
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),

  // Username
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, underscores, and hyphens'),

  // Email
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),

  // Password
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 })
    .withMessage('Password must be at most 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  // Confirm Password — must match password
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value: string, { req }) => {
      if (value !== (req.body as { password: string }).password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  // Terms acceptance
  body('acceptTerms')
    .equals('true')
    .withMessage('You must accept the Terms of Service to create an account'),

  handleValidationErrors,
];

// ─── Login Validator ──────────────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/v1/auth/login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),

  body('rememberMe').optional().isBoolean().withMessage('Remember me must be a boolean'),

  handleValidationErrors,
];

// ─── Forgot Password Validator ────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/v1/auth/forgot-password
 * (Backend not implemented yet — UI only in Milestone 1)
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors,
];

// ─── Change Password Validator ────────────────────────────────────────────────

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value: string, { req }) => {
      if (value !== (req.body as { newPassword: string }).newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors,
];
