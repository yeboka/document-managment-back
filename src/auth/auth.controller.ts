import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const hashedPassword = await this.authService.hashPassword(body.password);
    return { username: body.username };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // В реальном приложении здесь нужно искать пользователя в БД
    const fakeUser = { userId: 1, username: body.username, password: '$2b$10$T6RADN7Xv8v0tu4Uvakqk.8bkbmE4TlkbtqxWOrIfJPFeVG5igrRW' };

    const isPasswordValid = await this.authService.comparePasswords(body.password, fakeUser.password);
    if (!isPasswordValid) {
      return { message: 'Invalid credentials' };
    }

    const token = await this.authService.generateToken({ userId: fakeUser.userId, username: fakeUser.username });
    return { access_token: token };
  }


}
