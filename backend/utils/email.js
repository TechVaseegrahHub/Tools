import nodemailer from 'nodemailer';

/**
 * Send an OTP email to the given address.
 * Transporter is created lazily on each call so that
 * process.env values are guaranteed to be loaded by dotenv.config().
 *
 * @param {string} toEmail
 * @param {string} otp
 */
export const sendOtpEmail = async (toEmail, otp) => {
  // Create transporter lazily — env vars are loaded by now
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ToolRoom" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your ToolRoom Password Reset OTP',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin-bottom: 12px;">
            <span style="font-size: 28px;">🔧</span>
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e293b;">ToolRoom</h1>
        </div>

        <div style="background: white; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">Password Reset Request</h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #c7d2fe; border-radius: 12px; padding: 16px 40px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4f46e5;">${otp}</span>
            </div>
          </div>

          <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
            If you didn't request this, simply ignore this email. Your password won't change.
          </p>
        </div>

        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} ToolRoom. All rights reserved.
        </p>
      </div>
    `,
  });
};
