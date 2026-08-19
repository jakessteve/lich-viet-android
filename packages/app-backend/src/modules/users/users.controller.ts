import { Controller, Get, Patch, Body, Inject, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service.js';
import { UpdateUserProfileDto } from './dto/user.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Users & Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  getProfile(@CurrentUser('sub') userId: string) {
    const profile = this.authService.getUserById(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }
    return profile;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  updateProfile(@CurrentUser('sub') userId: string, @Body() body: UpdateUserProfileDto) {
    return this.authService.updateUserProfile(userId, body);
  }
}
