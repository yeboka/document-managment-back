import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
