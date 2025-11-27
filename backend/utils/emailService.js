const nodemailer = require('nodemailer');

// Mock email service for development
const isEmailEnabled = process.env.EMAIL_ENABLED === 'true';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

let transporter;

if (isEmailEnabled) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify transporter configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ Email transporter error:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('📧 Email service is disabled (development mode)');
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 [MOCK EMAIL] Would send email:', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      console.log('🔗 Verification URL (for testing):', mailOptions.html?.includes('href="') ? 
        mailOptions.html.match(/href="([^"]*)"/)[1] : 'No URL found');
      return { messageId: 'mock-message-id' };
    }
  };
}

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Career Guidance Platform" <${process.env.EMAIL_USER || 'noreply@careerguidance.com'}>`,
      to: email,
      subject: 'Verify Your Email - Career Guidance Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Welcome to Career Guidance Platform!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    console.log('🔗 Verification URL (for testing):', verificationUrl);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    console.log('🔗 Verification token (for testing):', verificationToken);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Career Guidance Platform" <${process.env.EMAIL_USER || 'noreply@careerguidance.com'}>`,
      to: email,
      subject: 'Reset Your Password - Career Guidance Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="word-break: break-all;">Reset link: ${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    console.log('🔗 Reset URL (for testing):', resetUrl);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    console.log('🔗 Reset token (for testing):', resetToken);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  transporter
};
