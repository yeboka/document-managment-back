import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,  // Инжектируем репозиторий User
  ) {}

  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userProfile } = user;

    return userProfile;  // Возвращаем только нужные данные без пароля
  }
}
