import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCalendarDayDto {
  @ApiProperty({
    description: 'Gregorian date in YYYY-MM-DD format',
    example: '2026-08-16',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Timezone offset in hours (default: 7.0 for Vietnam)',
    example: 7.0,
    default: 7.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-12)
  @Max(14)
  timezone?: number;
}

export class GetDungSuDto {
  @ApiProperty({
    description: 'Gregorian date in YYYY-MM-DD format',
    example: '2026-08-16',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Optional scoring profile ID or custom profile',
    example: 'general',
  })
  @IsOptional()
  @IsString()
  profileId?: string;
}

export class GetCalendarEventsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  end?: string;
}

export class CreateBackendCalendarEventDto {
  @ApiProperty({ description: 'Event title', example: 'Lễ Động Thổ' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Solar Date in YYYY-MM-DD', example: '2026-08-20' })
  @IsDateString()
  solarDate!: string;

  @ApiProperty({ description: 'Category', enum: ['personal', 'dam_gio', 'holiday', 'ritual'], example: 'personal' })
  @IsEnum(['personal', 'dam_gio', 'holiday', 'ritual'])
  category!: 'personal' | 'dam_gio' | 'holiday' | 'ritual';

  @ApiPropertyOptional({ description: 'Alarm offsets in minutes', default: [] })
  @IsOptional()
  @IsArray()
  alarmOffsetsMinutes?: number[];
}
