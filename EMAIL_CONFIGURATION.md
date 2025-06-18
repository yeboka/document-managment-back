# Email Configuration Guide

This guide explains how to configure email notifications for the Document Management System.

## Required Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Email Provider Setup

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password as `SMTP_PASS`

### Outlook/Hotmail Setup
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### Yahoo Setup
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

### Custom SMTP Server
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Available Email Templates

The system includes the following email templates:

1. **document-request.hbs** - Notifies users of new document requests
2. **document-approved.hbs** - Notifies users when documents are approved
3. **document-rejected.hbs** - Notifies users when documents are rejected
4. **welcome.hbs** - Welcome email for new users
5. **password-reset.hbs** - Password reset notifications
6. **company-invitation.hbs** - Company invitation emails

## Using Email Service

The `EmailService` provides the following methods:

```typescript
// Send document request notification
await emailService.sendDocumentRequestNotification(receiver, sender, document, request);

// Send document approval notification
await emailService.sendDocumentApprovedNotification(user, document, approver);

// Send document rejection notification
await emailService.sendDocumentRejectedNotification(user, document, rejector, reason);

// Send welcome email
await emailService.sendWelcomeEmail(user);

// Send password reset email
await emailService.sendPasswordResetEmail(user, resetToken);

// Send company invitation
await emailService.sendCompanyInvitationEmail(email, inviter, companyName, invitationToken);
```

## Testing Email Configuration

You can test your email configuration by creating a simple test endpoint:

```typescript
@Get('test-email')
async testEmail() {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    company: { name: 'Test Company' }
  };
  
  await this.emailService.sendWelcomeEmail(testUser);
  return { message: 'Test email sent successfully' };
}
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check your email and password
   - Ensure 2FA is enabled and you're using an app password (for Gmail)

2. **Connection Timeout**
   - Verify SMTP host and port
   - Check firewall settings
   - Try different ports (587, 465, 25)

3. **Templates Not Found**
   - Ensure template files exist in `src/common/email/templates/`
   - Check file extensions (.hbs)

4. **Email Not Sending**
   - Check console logs for error messages
   - Verify all environment variables are set
   - Test with a simple email first

### Debug Mode

Enable debug mode by adding to your `.env`:

```env
SMTP_DEBUG=true
```

This will log detailed SMTP communication for troubleshooting. 