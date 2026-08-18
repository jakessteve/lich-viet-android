import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { DamGioService } from './dam-gio.service.js';
import { CreateDamGioDto, UpdateDamGioDto } from './dto/dam-gio.dto.js';

@ApiTags('Đám Giỗ (Ancestral Anniversaries)')
@Controller('v1/dam-gio')
export class DamGioController {
  constructor(@Inject(DamGioService) private readonly damGioService: DamGioService) {}

  @Get()
  @ApiOperation({ summary: 'List all Đám Giỗ records for the authenticated user' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'List of Đám Giỗ records' })
  list(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.damGioService.listDamGio(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Đám Giỗ record' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 201, description: 'Created Đám Giỗ record' })
  create(@Body() body: CreateDamGioDto, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.damGioService.createDamGio(userId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing Đám Giỗ record' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'Updated Đám Giỗ record' })
  update(@Param('id') id: string, @Body() body: UpdateDamGioDto, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.damGioService.updateDamGio(userId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a Đám Giỗ record' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 204, description: 'Record deleted successfully' })
  delete(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.damGioService.deleteDamGio(userId, id);
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
