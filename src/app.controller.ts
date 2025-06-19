import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './common/email/email.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-email')
  @UseGuards(JwtAuthGuard)
  async testEmail(@Body() body: { email: string; name: string }) {
    const html = `
      <html>
        <body>
          <h2>Welcome to Document Management System</h2>
          <p>Hello ${body.name},</p>
          <p>Welcome to the Document Management System! We're excited to have you on board.</p>
          <p>This is an automated message from Test Company Document Management System.</p>
        </body>
      </html>
    `;
    try {
      await this.emailService.sendEmail({
        to: body.email,
        subject: 'Test Email from Document Management System',
        html,
      });
      return {
        success: true,
        message: 'Test email sent successfully',
        sentTo: body.email,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test email',
        error: error.message,
      };
    }
  }
}
