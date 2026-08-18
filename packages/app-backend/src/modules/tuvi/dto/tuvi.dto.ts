import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTuViChartDto {
  @ApiProperty({
    description: 'Birth date and time in ISO format or YYYY-MM-DD',
    example: '1990-05-15T08:30:00.000Z',
  })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({
    description: 'Gender of the person',
    enum: ['male', 'female'],
    example: 'male',
  })
  @IsEnum(['male', 'female'])
  gender!: 'male' | 'female';

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Birth latitude (default: 21.0285 for Hanoi)',
    example: 21.0285,
    default: 21.0285,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Birth longitude (default: 105.8542 for Hanoi)',
    example: 105.8542,
    default: 105.8542,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

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

  @ApiPropertyOptional({
    description: 'Astrological tradition/school',
    enum: ['nam_phai', 'bac_phai'],
    default: 'nam_phai',
  })
  @IsOptional()
  @IsEnum(['nam_phai', 'bac_phai'])
  school?: 'nam_phai' | 'bac_phai';
}
