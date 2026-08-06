/**
 * Typed & Validated Environment Configuration
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file — must happen before anything else reads process.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  APP_NAME: process.env.APP_NAME || 'DevVerse API',
  APP_VERSION: process.env.APP_VERSION || '0.1.0',

  MONGODB_URI: process.env.MONGODB_URI || '',

  JWT_SECRET: process.env.JWT_SECRET || 'devverse_super_secret_jwt_key_2026_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'devverse_refresh_token_secret_key_2026_dev',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // SMTP Email Server Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || 'susmithasivakumar1832006@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || '',
};
