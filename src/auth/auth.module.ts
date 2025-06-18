import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Company } from '../company/company.entity';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]), // Add User and Company to the repository
    JwtModule.register({
      secret: 'SECRET_KEY', // Make sure to replace this with a more secure secret key
      signOptions: { expiresIn: '1h' }, // Access token expiration
    }),
    EmailModule, // Add EmailModule for email notifications
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Export JwtService and AuthService so they can be used in other modules
})
export class AuthModule {}