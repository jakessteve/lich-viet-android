import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { SyncAction, SyncEntityType } from '@lich-viet/contracts';

export class SyncMutationDto {
  @ApiProperty({ description: 'Client mutation unique ID' })
  @IsNotEmpty()
  @IsString()
  mutationId!: string;

  @ApiProperty({ description: 'Target entity type', enum: ['dam_gio', 'user_note', 'calendar_event', 'birth_profile'] })
  @IsEnum(['dam_gio', 'user_note', 'calendar_event', 'birth_profile'])
  entityType!: SyncEntityType;

  @ApiProperty({ description: 'Entity unique ID' })
  @IsNotEmpty()
  @IsString()
  entityId!: string;

  @ApiProperty({ description: 'Sync mutation action', enum: ['insert', 'update', 'delete'] })
  @IsEnum(['insert', 'update', 'delete'])
  action!: SyncAction;

  @ApiPropertyOptional({ description: 'Entity payload' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiProperty({ description: 'Client updated ISO timestamp' })
  @IsNotEmpty()
  @IsString()
  clientUpdatedAt!: string;
}

export class SyncPushDto {
  @ApiProperty({ description: 'Client high watermark timestamp', example: '2026-01-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsString()
  clientWatermark!: string;

  @ApiProperty({ description: 'List of mutations to sync', type: [SyncMutationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncMutationDto)
  mutations!: SyncMutationDto[];
}
