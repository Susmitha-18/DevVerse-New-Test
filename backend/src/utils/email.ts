/**
 * Nodemailer Email Service — DevVerse
 * Handles sending transactional emails (OTP codes, security alerts).
 */

import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

// Create SMTP Transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS || '',
  },
});

export interface SendOtpEmailOptions {
  toEmail: string;
  recipientName: string;
  otpCode: string;
}

/**
 * Send Admin Password Reset Email OTP
 */
export async function sendAdminPasswordOtpEmail(options: SendOtpEmailOptions): Promise<boolean> {
  const { toEmail, recipientName, otpCode } = options;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0a0a0f; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111118; border: 1px solid #1e1e2e; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; line-height: 48px; font-weight: bold; font-size: 20px; color: #fff;">DV</div>
          <h2 style="color: #f8fafc; font-size: 22px; margin-top: 12px;">DevVerse N-MARS Vault</h2>
          <p style="color: #818cf8; font-size: 12px; font-weight: bold; letter-spacing: 1px;">ADMIN SECURITY VERIFICATION</p>
        </div>

        <p style="font-size: 14px; color: #cbd5e1;">Hello ${recipientName},</p>
        <p style="font-size: 14px; color: #cbd5e1;">You have requested an Administrator password change. Use the 6-digit verification code below to complete your password update:</p>

        <div style="text-align: center; background-color: #1a1a24; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #6366f1;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #818cf8;">${otpCode}</span>
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center;">This OTP code is valid for <strong>10 minutes</strong>. If you did not initiate this request, please lock N-MARS Vault immediately.</p>

        <hr style="border: none; border-top: 1px solid #1e1e2e; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">© 2026 DevVerse • An Original Project by N-MARS • Developed by Susmitha Sivakumar</p>
      </div>
    </div>
  `;

  try {
    if (env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"DevVerse N-MARS Vault" <${env.SMTP_USER}>`,
        to: toEmail,
        subject: '🔒 Admin Password Change OTP Verification — DevVerse N-MARS Vault',
        html: htmlContent,
      });
      logger.info(`[Email Service] 📩 Real SMTP Email sent successfully to: ${toEmail}`);
      return true;
    }

    logger.warn(`[Email Service] SMTP_PASS not set in .env. Email dispatch skipped. Target: ${toEmail}`);
    return false;
  } catch (error) {
    logger.error(`[Email Service] Failed to send email to ${toEmail}:`, error);
    return false;
  }
}
