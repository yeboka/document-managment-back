// src/company/company.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { User } from "../auth/user.entity";
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User]),
    AuthModule // Ensure AuthModule is imported
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
