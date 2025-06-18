// src/request/request.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request } from './request.entity';
import { User } from '../auth/user.entity';
import { Document } from '../documents/document.entity';
import { AuthModule } from '../auth/auth.module'; // Импортируем AuthModule
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Document]),
    AuthModule,  // Добавляем AuthModule сюда
    EmailModule, // Add EmailModule for email notifications
  ],
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
