import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../../auth/user.entity';
import { Document } from '../../documents/document.entity';
import { Request } from '../../request/request.entity';

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(data: EmailNotificationData): Promise<void> {
    try {
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (!smtpUser || !smtpPass) {
        console.log('📧 Email would be sent (SMTP not configured):', {
          to: data.to,
          subject: data.subject,
          html: data.html
        });
        return;
      }
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
      console.log('✅ Email sent successfully to:', data.to);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendDocumentRequestNotification(
    receiver: User,
    sender: User,
    document: Document,
    request: Request,
  ): Promise<void> {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>New Document Request</h2>
          </div>
          <div class="content">
            <p>Hello ${receiver.firstName} ${receiver.lastName},</p>
            <p>You have received a new document request from <strong>${sender.firstName} ${sender.lastName}</strong>.</p>
            <ul>
              <li><strong>Document Name:</strong> ${document.title}</li>
              <li><strong>Document Status:</strong> ${document.status}</li>
              <li><strong>Request Type:</strong> ${request.type}</li>
              <li><strong>Status:</strong> ${request.status}</li>
            </ul>
            <p>Please review this document and take appropriate action.</p>
            <a href="#" class="button">View Document</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${receiver.company?.name || 'Your Company'} Document Management System.</p>
          </div>
        </body>
      </html>
    `;
    await this.sendEmail({
      to: receiver.email,
      subject: 'New Document Request',
      html,
    });
  }

  async sendDocumentApprovedNotification(
    user: User,
    document: Document,
    approver: User,
  ): Promise<void> {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #c3e6cb; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>✅ Document Approved</h2>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Great news! Your document has been approved by <strong>${approver.firstName} ${approver.lastName}</strong>.</p>
            <ul>
              <li><strong>Document Name:</strong> ${document.title}</li>
              <li><strong>Document Status:</strong> ${document.status}</li>
              <li><strong>Approved By:</strong> ${approver.firstName} ${approver.lastName}</li>
            </ul>
            <p>Your document is now available for use and has been processed successfully.</p>
            <a href="#" class="button">View Document</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
          </div>
        </body>
      </html>
    `;
    await this.sendEmail({
      to: user.email,
      subject: 'Document Approved',
      html,
    });
  }

  async sendDocumentRejectedNotification(
    user: User,
    document: Document,
    rejector: User,
    reason?: string,
  ): Promise<void> {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8d7da; padding: 20px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #f5c6cb; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
            .reason-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>❌ Document Rejected</h2>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Your document has been rejected by <strong>${rejector.firstName} ${rejector.lastName}</strong>.</p>
            <ul>
              <li><strong>Document Name:</strong> ${document.title}</li>
              <li><strong>Document Status:</strong> ${document.status}</li>
              <li><strong>Rejected By:</strong> ${rejector.firstName} ${rejector.lastName}</li>
            </ul>
            <div class="reason-box">
              <h4>Reason for Rejection:</h4>
              <p>${reason || 'No reason provided'}</p>
            </div>
            <p>Please review the feedback and make the necessary changes before resubmitting.</p>
            <a href="#" class="button">Edit Document</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
          </div>
        </body>
      </html>
    `;
    await this.sendEmail({
      to: user.email,
      subject: 'Document Rejected',
      html,
    });
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 30px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
            .role-badge { display: inline-block; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to ${user.company?.name || 'Your Company'}!</h1>
            <p>Document Management System</p>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Welcome to the Document Management System! We're excited to have you on board.</p>
            <h3>Your Account Details:</h3>
            <ul>
              <li><strong>Role:</strong> <span class="role-badge">${user.role}</span></li>
              <li><strong>Company:</strong> ${user.company?.name || 'Your Company'}</li>
            </ul>
            <h3>What you'll be able to do:</h3>
            <ul>
              <li>Access and manage company documents</li>
              <li>Collaborate with team members</li>
              <li>Track document workflows</li>
              <li>Stay updated on important changes</li>
            </ul>
            <p>To get started, please log in to your account and explore the system.</p>
            <a href="https://your-app.com/login" class="button">Access Your Account</a>
            <p style="margin-top: 20px;">
              <strong>Need help?</strong> Contact your system administrator or check our documentation for guidance.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
            <p>If you have any questions, please contact your system administrator.</p>
          </div>
        </body>
      </html>
    `;
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Document Management System',
      html,
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffeaa7; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
            .warning { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🔐 Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>We received a request to reset your password for your account at ${user.company?.name || 'Your Company'}.</p>
            <div class="warning">
              <p><strong>Important:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <p>To reset your password, click the button below:</p>
            <a href="https://your-app.com/reset-password?token=${resetToken}" class="button">Reset Password</a>
            <p style="margin-top: 20px;">
              <strong>Reset Token:</strong> <code>${resetToken}</code>
            </p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
            <p>For security reasons, never share this email with anyone.</p>
          </div>
        </body>
      </html>
    `;
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendCompanyInvitationEmail(
    email: string,
    inviter: User,
    companyName: string,
    invitationToken: string,
  ): Promise<void> {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #17a2b8; color: white; padding: 30px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
            .invitation-box { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #17a2b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📧 You're Invited!</h1>
            <p>${companyName} wants you to join their team</p>
          </div>
          <div class="content">
            <p>Hello there!</p>
            <p><strong>${inviter.firstName} ${inviter.lastName}</strong> has invited you to join <strong>${companyName}</strong> on their Document Management System.</p>
            <div class="invitation-box">
              <h3>🎯 What you'll be able to do:</h3>
              <ul>
                <li>Access and manage company documents</li>
                <li>Collaborate with team members</li>
                <li>Track document workflows</li>
                <li>Stay updated on important changes</li>
              </ul>
            </div>
            <p>To accept this invitation and create your account, click the button below:</p>
            <a href="https://your-app.com/accept-invitation?token=${invitationToken}" class="button">Accept Invitation</a>
            <p style="margin-top: 20px;">
              <strong>Invitation Token:</strong> <code>${invitationToken}</code>
            </p>
            <p>This invitation will expire in 7 days for security reasons.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${companyName} Document Management System.</p>
          </div>
        </body>
      </html>
    `;
    await this.sendEmail({
      to: email,
      subject: `Invitation to join ${companyName}`,
      html,
    });
  }
} 