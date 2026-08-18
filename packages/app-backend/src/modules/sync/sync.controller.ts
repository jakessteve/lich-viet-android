import { Controller, Post, Body, Inject, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SyncService } from './sync.service.js';
import { SyncPushDto } from './dto/sync.dto.js';

@ApiTags('Data Synchronization')
@Controller('v1/sync')
export class SyncController {
  constructor(@Inject(SyncService) private readonly syncService: SyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synchronize local offline mutations and receive server deltas' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'Sync acknowledgments and server deltas' })
  sync(@Body() body: SyncPushDto, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.syncService.processSync(userId, body);
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
