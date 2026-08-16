import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BirthLocationDto {
  @ApiPropertyOptional({ description: 'Latitude (default: 21.0285)', default: 21.0285 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude (default: 105.8542)', default: 105.8542 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Altitude in meters (default: 19)', default: 19 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-500)
  @Max(9000)
  altitudeMeters?: number;

  @ApiPropertyOptional({ description: 'Timezone offset (default: 7.0)', default: 7.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-12)
  @Max(14)
  timezone?: number;
}

export class CreateWesternChartDto {
  @ApiProperty({
    description: 'Birth date and time in ISO format',
    example: '1995-10-24T14:30:00.000Z'
  })
  @IsDateString()
  birthDate!: string;

  @ApiPropertyOptional({ type: () => BirthLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthLocationDto)
  birthLocation?: BirthLocationDto;

  @ApiPropertyOptional({
    description: 'House calculation system',
    enum: ['placidus', 'koch', 'whole_sign', 'equal', 'porphyry'],
    default: 'placidus'
  })
  @IsOptional()
  @IsEnum(['placidus', 'koch', 'whole_sign', 'equal', 'porphyry'])
  houseSystem?: 'placidus' | 'koch' | 'whole_sign' | 'equal' | 'porphyry';
}

export class CreateVedicChartDto {
  @ApiProperty({
    description: 'Birth date and time in ISO format',
    example: '1995-10-24T14:30:00.000Z'
  })
  @IsDateString()
  birthDate!: string;

  @ApiPropertyOptional({ type: () => BirthLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthLocationDto)
  birthLocation?: BirthLocationDto;

  @ApiPropertyOptional({
    description: 'Ayanamsa mode for sidereal calculation',
    enum: ['lahiri', 'raman', 'krishnamurti', 'fagan_bradley', 'true_citra'],
    default: 'lahiri'
  })
  @IsOptional()
  @IsString()
  ayanamsa?: string;
}

export class CreateSynastryDto {
  @ApiProperty({ type: () => CreateWesternChartDto, description: 'Birth profile of Person 1' })
  @ValidateNested()
  @Type(() => CreateWesternChartDto)
  person1!: CreateWesternChartDto;

  @ApiProperty({ type: () => CreateWesternChartDto, description: 'Birth profile of Person 2' })
  @ValidateNested()
  @Type(() => CreateWesternChartDto)
  person2!: CreateWesternChartDto;
}
