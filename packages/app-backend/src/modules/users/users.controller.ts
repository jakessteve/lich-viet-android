import { Controller, Get, Patch, Body, Inject, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service.js';
import { UpdateUserProfileDto } from './dto/user.dto.js';

@ApiTags('Users & Profile')
@Controller('v1/users')
export class UsersController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getProfile(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    const profile = this.authService.getUserById(userId);
    if (profile) return profile;

    return {
      id: userId || 'demo-user-001',
      email: 'demo@lichviet.local',
      name: 'Người Dùng Lịch Việt',
      tier: 'curious',
      role: 'user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  updateProfile(@Body() body: UpdateUserProfileDto, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader) || 'demo-user-001';
    return this.authService.updateUserProfile(userId, body);
  }

  private extractUserId(authHeader?: string): string {
    if (!authHeader) return 'demo-user-001';
    const parts = authHeader.replace(/^Bearer\s+/i, '').split('-');
    if (parts.length >= 2 && parts[0] === 'jwt') {
      return parts.slice(1, parts.length - 1).join('-');
    }
    return 'demo-user-001';
  }
}
