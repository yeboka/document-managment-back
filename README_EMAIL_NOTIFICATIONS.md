# Email Notification System

This document explains the email notification system implemented in the Document Management System.

## Overview

The email notification system provides automated email notifications for various events in the application, including:

- Document request notifications
- Document approval/rejection notifications
- Welcome emails for new users
- Password reset emails
- Company invitation emails

## Architecture

### Components

1. **EmailModule** (`src/common/email/email.module.ts`)
   - Configures the mailer with SMTP settings
   - Uses Handlebars for email templates
   - Exports EmailService for use in other modules

2. **EmailService** (`src/common/email/email.service.ts`)
   - Provides methods for sending different types of emails
   - Handles email template rendering
   - Includes error handling and logging

3. **Email Templates** (`src/common/email/templates/`)
   - HTML templates using Handlebars syntax
   - Responsive design with inline CSS
   - Professional styling for different notification types

## Setup Instructions

### 1. Install Dependencies

The required packages are already installed:
- `@nestjs-modules/mailer` - NestJS mailer module
- `nodemailer` - SMTP client
- `handlebars` - Template engine
- `@types/nodemailer` - TypeScript definitions

### 2. Environment Configuration

Add the following variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Email Provider Setup

#### Gmail (Recommended for Development)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password as `SMTP_PASS`

#### Other Providers
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your server's SMTP settings

## Available Email Types

### 1. Document Request Notification
**Trigger**: When a user sends a document request
**Template**: `document-request.hbs`
**Recipients**: Document receiver
**Content**: Document details, sender information, action buttons

### 2. Document Approval Notification
**Trigger**: When a document is approved
**Template**: `document-approved.hbs`
**Recipients**: Document owner
**Content**: Approval confirmation, document details, approver information

### 3. Document Rejection Notification
**Trigger**: When a document is rejected
**Template**: `document-rejected.hbs`
**Recipients**: Document owner
**Content**: Rejection reason, document details, rejector information

### 4. Welcome Email
**Trigger**: When a new user registers
**Template**: `welcome.hbs`
**Recipients**: New user
**Content**: Welcome message, account details, system features

### 5. Password Reset Email
**Trigger**: When user requests password reset
**Template**: `password-reset.hbs`
**Recipients**: User requesting reset
**Content**: Reset link, security warnings, token information

### 6. Company Invitation Email
**Trigger**: When inviting someone to join a company
**Template**: `company-invitation.hbs`
**Recipients**: Invited person
**Content**: Invitation details, company information, acceptance link

## Usage Examples

### In Services

```typescript
import { EmailService } from '../common/email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async someMethod() {
    // Send document request notification
    await this.emailService.sendDocumentRequestNotification(
      receiver,
      sender,
      document,
      request
    );

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user);

    // Send custom email
    await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Custom Subject',
      template: 'welcome',
      context: { userName: 'John Doe', companyName: 'ACME Corp' }
    });
  }
}
```

### Testing Email Configuration

Use the test endpoint to verify email functionality:

```bash
POST /test-email
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

## Integration Points

### Request Service
- Sends notifications when document requests are created
- Sends approval/rejection notifications when requests are processed

### Auth Service
- Sends welcome emails when users register
- Can be extended for password reset functionality

### Company Service
- Can send invitation emails when inviting new users

## Template Customization

### Adding New Templates

1. Create a new `.hbs` file in `src/common/email/templates/`
2. Use Handlebars syntax for dynamic content: `{{variableName}}`
3. Include inline CSS for email client compatibility
4. Test with different email clients

### Template Variables

Common variables available in templates:
- `userName` - Full name of the user
- `companyName` - Company name
- `documentName` - Document name
- `senderName` - Name of the person sending the request
- `receiverName` - Name of the person receiving the request
- `status` - Current status of the request/document
- `reason` - Reason for rejection (if applicable)

## Error Handling

The email service includes comprehensive error handling:

- Email failures don't break the main application flow
- Errors are logged to console for debugging
- Graceful degradation when email service is unavailable

## Security Considerations

1. **SMTP Credentials**: Store securely in environment variables
2. **App Passwords**: Use app-specific passwords for Gmail
3. **Rate Limiting**: Consider implementing rate limiting for email sending
4. **Template Injection**: Handlebars automatically escapes content to prevent XSS

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify SMTP credentials
   - Check if 2FA is enabled (for Gmail)
   - Ensure app password is used (for Gmail)

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP host and port
   - Try different ports (587, 465, 25)

3. **Templates Not Found**
   - Ensure template files exist in the correct directory
   - Check file extensions (.hbs)
   - Verify template names match exactly

4. **Emails Not Sending**
   - Check application logs for error messages
   - Verify all environment variables are set
   - Test with a simple email first

### Debug Mode

Enable debug mode by adding to your `.env`:

```env
SMTP_DEBUG=true
```

This will log detailed SMTP communication for troubleshooting.

## Performance Considerations

1. **Async Processing**: Email sending is asynchronous and doesn't block the main application
2. **Template Caching**: Handlebars templates are cached for better performance
3. **Connection Pooling**: Nodemailer handles connection pooling automatically
4. **Error Recovery**: Failed emails don't affect the main application flow

## Future Enhancements

Potential improvements for the email system:

1. **Email Queue**: Implement a queue system for better reliability
2. **Email Preferences**: Allow users to configure notification preferences
3. **Email Templates**: Add more template options and customization
4. **Analytics**: Track email open rates and engagement
5. **Multi-language Support**: Support for multiple languages in templates 