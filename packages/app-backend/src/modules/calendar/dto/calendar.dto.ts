import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCalendarDayDto {
  @ApiProperty({
    description: 'Gregorian date in YYYY-MM-DD format',
    example: '2026-08-16'
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Timezone offset in hours (default: 7.0 for Vietnam)',
    example: 7.0,
    default: 7.0
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
    example: '2026-08-16'
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Optional scoring profile ID or custom profile',
    example: 'general'
  })
  @IsOptional()
  @IsString()
  profileId?: string;
}
