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
    try {
      // Test sending a simple email directly
      await this.emailService.sendEmail({
        to: body.email,
        subject: 'Test Email from Document Management System',
        template: 'welcome',
        context: {
          userName: body.name,
          companyName: 'Test Company',
          role: 'employee',
        },
      });
      
      return { 
        success: true, 
        message: 'Test email sent successfully',
        sentTo: body.email 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to send test email',
        error: error.message 
      };
    }
  }
}
