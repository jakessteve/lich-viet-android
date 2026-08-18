import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaiHoaDto {
  @ApiPropertyOptional({
    description: 'Timestamp or Date ISO for time-based divination casting',
    example: '2026-08-16T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'First number for number-based casting (1-64)',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  number1?: number;

  @ApiPropertyOptional({
    description: 'Second number for number-based casting (1-64)',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  number2?: number;

  @ApiPropertyOptional({
    description: 'Third number or hour branch for changing line calculation',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  number3?: number;

  @ApiPropertyOptional({
    description: 'Divination question or intent description',
    example: 'Khai trương cửa hàng ngày mai có thuận lợi không?',
  })
  @IsOptional()
  @IsString()
  query?: string;
}

export class CreateTamThucDto {
  @ApiProperty({
    description: 'Date and time in ISO format for Tam Thức synthesis (QMDJ + Thái Ất + Lục Nhâm)',
    example: '2026-08-16T14:30:00.000Z',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Timezone offset (default: 7.0)',
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
