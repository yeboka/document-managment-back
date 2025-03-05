import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: 'User login' })
  username: string;
  @ApiProperty({ example: 'StrongPass123!', description: 'User password' })
  password: string;
}

class LoginDto {
  @ApiProperty({ example: 'john_doe', description: 'User login' })
  username: string;
  @ApiProperty({ example: 'StrongPass123!', description: 'User password' })
  password: string;
}

@ApiTags('Auth') // Группировка в Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User Registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.username, body.password);
  }

  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'JWT Token returned' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { access_token: await this.authService.generateToken(user) };
  }
}
