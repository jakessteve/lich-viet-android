import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Calendar System', enum: ['solar', 'lunar'], default: 'solar' })
  @IsOptional()
  @IsEnum(['solar', 'lunar'])
  calendarType?: 'solar' | 'lunar';

  @ApiProperty({ description: 'Solar Date in YYYY-MM-DD', example: '2026-08-20' })
  @IsDateString()
  solarDate!: string;

  @ApiPropertyOptional({ description: 'Lunar Day (1-30)' })
  @IsOptional()
  @IsNumber()
  lunarDay?: number;

  @ApiPropertyOptional({ description: 'Lunar Month (1-12)' })
  @IsOptional()
  @IsNumber()
  lunarMonth?: number;

  @ApiPropertyOptional({ description: 'Lunar Year' })
  @IsOptional()
  @IsNumber()
  lunarYear?: number;

  @ApiPropertyOptional({ description: 'Is Leap Lunar Month' })
  @IsOptional()
  @IsBoolean()
  isLeapMonth?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence Rule',
    enum: ['none', 'daily', 'weekly', 'monthly_solar', 'monthly_lunar', 'yearly_solar', 'yearly_lunar'],
    default: 'none',
  })
  @IsOptional()
  @IsEnum(['none', 'daily', 'weekly', 'monthly_solar', 'monthly_lunar', 'yearly_solar', 'yearly_lunar'])
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly_solar' | 'monthly_lunar' | 'yearly_solar' | 'yearly_lunar';

  @ApiPropertyOptional({ description: 'Recurrence End Date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Category',
    enum: ['personal', 'dam_gio', 'memorial', 'work', 'family', 'ritual'],
    default: 'personal',
  })
  @IsOptional()
  @IsEnum(['personal', 'dam_gio', 'memorial', 'work', 'family', 'ritual'])
  category?: 'personal' | 'dam_gio' | 'memorial' | 'work' | 'family' | 'ritual';

  @ApiPropertyOptional({ description: 'Emoji icon' })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiPropertyOptional({ description: 'Color tag' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Alarm offsets in minutes', default: [] })
  @IsOptional()
  @IsArray()
  alarmOffsetsMinutes?: number[];
}

export class UpdateBackendCalendarEventDto extends CreateBackendCalendarEventDto {}
