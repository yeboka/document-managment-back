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
      <html><body>
        <h2>New Document Request</h2>
        <p>Hello ${receiver.firstName} ${receiver.lastName},</p>
        <p>You have received a new document request from <strong>${sender.firstName} ${sender.lastName}</strong>.</p>
        <ul>
          <li><strong>Document Name:</strong> ${document.title}</li>
          <li><strong>Document Status:</strong> ${document.status}</li>
          <li><strong>Request Type:</strong> ${request.type}</li>
          <li><strong>Status:</strong> ${request.status}</li>
        </ul>
        <p>Please review this document and take appropriate action.</p>
        <p>This is an automated message from ${receiver.company?.name || 'Your Company'} Document Management System.</p>
      </body></html>
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
      <html><body>
        <h2>Document Approved</h2>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>Great news! Your document has been approved by <strong>${approver.firstName} ${approver.lastName}</strong>.</p>
        <ul>
          <li><strong>Document Name:</strong> ${document.title}</li>
          <li><strong>Document Status:</strong> ${document.status}</li>
          <li><strong>Approved By:</strong> ${approver.firstName} ${approver.lastName}</li>
        </ul>
        <p>Your document is now available for use and has been processed successfully.</p>
        <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
      </body></html>
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
      <html><body>
        <h2>Document Rejected</h2>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>Your document has been rejected by <strong>${rejector.firstName} ${rejector.lastName}</strong>.</p>
        <ul>
          <li><strong>Document Name:</strong> ${document.title}</li>
          <li><strong>Document Status:</strong> ${document.status}</li>
          <li><strong>Rejected By:</strong> ${rejector.firstName} ${rejector.lastName}</li>
        </ul>
        <div><strong>Reason for Rejection:</strong> ${reason || 'No reason provided'}</div>
        <p>Please review the feedback and make the necessary changes before resubmitting.</p>
        <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
      </body></html>
    `;
    await this.sendEmail({
      to: user.email,
      subject: 'Document Rejected',
      html,
    });
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const html = `
      <html><body>
        <h2>Welcome to Document Management System</h2>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>Welcome to the Document Management System! We're excited to have you on board.</p>
        <ul>
          <li><strong>Role:</strong> ${user.role}</li>
          <li><strong>Company:</strong> ${user.company?.name || 'Your Company'}</li>
        </ul>
        <p>To get started, please log in to your account and explore the system.</p>
        <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
      </body></html>
    `;
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Document Management System',
      html,
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const html = `
      <html><body>
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>We received a request to reset your password for your account at ${user.company?.name || 'Your Company'}.</p>
        <p><strong>Reset Token:</strong> <code>${resetToken}</code></p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This is an automated message from ${user.company?.name || 'Your Company'} Document Management System.</p>
      </body></html>
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
      <html><body>
        <h2>Invitation to join ${companyName}</h2>
        <p>Hello,</p>
        <p><strong>${inviter.firstName} ${inviter.lastName}</strong> has invited you to join <strong>${companyName}</strong> on their Document Management System.</p>
        <p><strong>Invitation Token:</strong> <code>${invitationToken}</code></p>
        <p>This invitation will expire in 7 days for security reasons.</p>
        <p>This is an automated message from ${companyName} Document Management System.</p>
      </body></html>
    `;
    await this.sendEmail({
      to: email,
      subject: `Invitation to join ${companyName}`,
      html,
    });
  }
} 