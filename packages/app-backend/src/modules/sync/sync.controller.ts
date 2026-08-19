import { Controller, Post, Body, Inject, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service.js';
import { SyncPushDto } from './dto/sync.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Data Synchronization')
@Controller('v1/sync')
export class SyncController {
  constructor(@Inject(SyncService) private readonly syncService: SyncService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Synchronize local offline mutations and receive server deltas' })
  @ApiResponse({ status: 200, description: 'Sync acknowledgments and server deltas' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' })
  sync(@CurrentUser('sub') userId: string, @Body() body: SyncPushDto) {
    return this.syncService.processSync(userId, body);
  }
}
