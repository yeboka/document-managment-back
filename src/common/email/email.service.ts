import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../../auth/user.entity';
import { Document } from '../../documents/document.entity';
import { Request } from '../../request/request.entity';

export interface EmailNotificationData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(data: EmailNotificationData): Promise<void> {
    try {
      // Temporary: Skip email sending if SMTP is not configured
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass) {
        console.log('📧 Email would be sent (SMTP not configured):', {
          to: data.to,
          subject: data.subject,
          template: data.template,
          context: data.context
        });
        return; // Skip sending if SMTP not configured
      }

      try {
        await this.mailerService.sendMail({
          to: data.to,
          subject: data.subject,
          template: data.template,
          context: data.context,
        });
        
        console.log('✅ Email sent successfully to:', data.to);
      } catch (templateError) {
        console.warn('⚠️ Template email failed, trying simple email:', templateError.message);
        
        // Fallback: Send simple HTML email without template
        await this.sendSimpleEmail(data);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private async sendSimpleEmail(data: EmailNotificationData): Promise<void> {
    const htmlContent = this.generateSimpleHtml(data);
    
    await this.mailerService.sendMail({
      to: data.to,
      subject: data.subject,
      html: htmlContent,
    });
    
    console.log('✅ Simple email sent successfully to:', data.to);
  }

  private generateSimpleHtml(data: EmailNotificationData): string {
    const context = data.context;
    
    switch (data.template) {
      case 'welcome':
        return `
          <html>
            <body>
              <h2>Welcome to Document Management System</h2>
              <p>Hello ${context.userName || 'User'},</p>
              <p>Welcome to the Document Management System! We're excited to have you on board.</p>
              <p>Your account has been created successfully.</p>
              <p>Best regards,<br>Document Management Team</p>
            </body>
          </html>
        `;
      
      case 'document-request':
        return `
          <html>
            <body>
              <h2>New Document Request</h2>
              <p>Hello ${context.receiverName || 'User'},</p>
              <p>You have received a new document request from ${context.senderName || 'Sender'}.</p>
              <p><strong>Document:</strong> ${context.documentName || 'Document'}</p>
              <p>Please review this document and take appropriate action.</p>
              <p>Best regards,<br>Document Management Team</p>
            </body>
          </html>
        `;
      
      case 'document-approved':
        return `
          <html>
            <body>
              <h2>Document Approved</h2>
              <p>Hello ${context.userName || 'User'},</p>
              <p>Great news! Your document has been approved by ${context.approverName || 'Approver'}.</p>
              <p><strong>Document:</strong> ${context.documentName || 'Document'}</p>
              <p>Your document is now available for use.</p>
              <p>Best regards,<br>Document Management Team</p>
            </body>
          </html>
        `;
      
      case 'document-rejected':
        return `
          <html>
            <body>
              <h2>Document Rejected</h2>
              <p>Hello ${context.userName || 'User'},</p>
              <p>Your document has been rejected by ${context.rejectorName || 'Rejector'}.</p>
              <p><strong>Document:</strong> ${context.documentName || 'Document'}</p>
              <p><strong>Reason:</strong> ${context.reason || 'No reason provided'}</p>
              <p>Please review the feedback and make necessary changes.</p>
              <p>Best regards,<br>Document Management Team</p>
            </body>
          </html>
        `;
      
      default:
        return `
          <html>
            <body>
              <h2>${data.subject}</h2>
              <p>This is an automated message from Document Management System.</p>
              <p>Best regards,<br>Document Management Team</p>
            </body>
          </html>
        `;
    }
  }

  async sendDocumentRequestNotification(
    receiver: User,
    sender: User,
    document: Document,
    request: Request,
  ): Promise<void> {
    await this.sendEmail({
      to: receiver.email,
      subject: 'New Document Request',
      template: 'document-request',
      context: {
        receiverName: `${receiver.firstName} ${receiver.lastName}`,
        senderName: `${sender.firstName} ${sender.lastName}`,
        documentName: document.title,
        documentStatus: document.status,
        requestType: request.type,
        status: request.status,
        companyName: receiver.company?.name || 'Your Company',
      },
    });
  }

  async sendDocumentApprovedNotification(
    user: User,
    document: Document,
    approver: User,
  ): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Document Approved',
      template: 'document-approved',
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        documentName: document.title,
        documentStatus: document.status,
        approverName: `${approver.firstName} ${approver.lastName}`,
        companyName: user.company?.name || 'Your Company',
      },
    });
  }

  async sendDocumentRejectedNotification(
    user: User,
    document: Document,
    rejector: User,
    reason?: string,
  ): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Document Rejected',
      template: 'document-rejected',
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        documentName: document.title,
        documentStatus: document.status,
        rejectorName: `${rejector.firstName} ${rejector.lastName}`,
        reason: reason || 'No reason provided',
        companyName: user.company?.name || 'Your Company',
      },
    });
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Document Management System',
      template: 'welcome',
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        companyName: user.company?.name || 'Your Company',
        role: user.role,
      },
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        resetToken,
        companyName: user.company?.name || 'Your Company',
      },
    });
  }

  async sendCompanyInvitationEmail(
    email: string,
    inviter: User,
    companyName: string,
    invitationToken: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Invitation to join ${companyName}`,
      template: 'company-invitation',
      context: {
        inviterName: `${inviter.firstName} ${inviter.lastName}`,
        companyName,
        invitationToken,
      },
    });
  }
} 