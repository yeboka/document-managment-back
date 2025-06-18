// common/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Обязательно импортируйте ConfigModule здесь
      useFactory: async (configService: ConfigService) => {
        // Логирование всех переменных, которые вы пытаетесь получить
        const smtpHost = configService.get<string>('SMTP_HOST');
        const smtpPort = configService.get<string>('SMTP_PORT'); // Используйте string для порта, затем парсите
        const smtpUser = configService.get<string>('SMTP_USER');
        const db = configService.get<string>('DB_NAME');
        const smtpPass = configService.get<string>('SMTP_PASS');

        console.log('--- EmailModule SMTP Config Check ---');
        console.log('ConfigService SMTP_HOST:', smtpHost);
        console.log('ConfigService SMTP_PORT:', smtpPort);
        console.log('ConfigService db:', db);
        console.log('ConfigService SMTP_USER:', smtpUser);
        console.log('ConfigService SMTP_PASS:', smtpPass ? '[SET]' : '[NOT SET]'); // Никогда не логируйте пароль

        // Проверяем, что все необходимые переменные установлены
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
          console.error('❌ SMTP configuration incomplete!');
          console.error('Missing variables:');
          if (!smtpHost) console.error('  - SMTP_HOST');
          if (!smtpPort) console.error('  - SMTP_PORT');
          if (!smtpUser) console.error('  - SMTP_USER');
          if (!smtpPass) console.error('  - SMTP_PASS');
          console.error('Please add these variables to your .env file');
        } else {
          console.log('✅ SMTP configuration complete!');
        }

        const port = parseInt(smtpPort || '587', 10);
        const isSecure = port === 465;

        return {
          transport: {
            host: smtpHost || 'smtp.gmail.com',
            port: port,
            secure: isSecure, // true for 465, false for other ports
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            // Дополнительные настройки для избежания проблем с IPv6
            tls: {
              rejectUnauthorized: false
            },
            // Принудительно использовать IPv4
            family: 4
          },
          defaults: {
            from: `"Document Management System" <${smtpUser}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}