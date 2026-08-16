import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserBirthDataDto {
  @ApiProperty({ description: 'Julian Day of birth', example: 2460826.5 })
  @Type(() => Number)
  @IsNumber()
  jd!: number;

  @ApiProperty({ description: 'Latitude', example: 10.8231 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ description: 'Longitude', example: 106.6297 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @ApiProperty({ description: 'Altitude in meters', example: 19, default: 19 })
  @Type(() => Number)
  @IsNumber()
  @Min(-500)
  @Max(9000)
  alt!: number;
}

export class SearchWindowDto {
  @ApiProperty({ description: 'Search window start Julian Day', example: 2460826.5 })
  @Type(() => Number)
  @IsNumber()
  startJd!: number;

  @ApiProperty({ description: 'Search window end Julian Day', example: 2460827.5 })
  @Type(() => Number)
  @IsNumber()
  endJd!: number;
}

export class ElectionScanRequestDto {
  @ApiProperty({ description: 'Unique task identifier', example: 'scan-task-001' })
  @IsString()
  taskId!: string;

  @ApiPropertyOptional({ description: 'Dụng Sự event ID (e.g. ds_kai_shi, ds_jia_qu)', example: 'ds_kai_shi' })
  @IsOptional()
  @IsString()
  dungSuEventId?: string;

  @ApiProperty({ type: () => UserBirthDataDto })
  @ValidateNested()
  @Type(() => UserBirthDataDto)
  userBirthData!: UserBirthDataDto;

  @ApiProperty({ type: () => SearchWindowDto })
  @ValidateNested()
  @Type(() => SearchWindowDto)
  searchWindow!: SearchWindowDto;
}

export class ElectionScanOptionsDto {
  @ApiPropertyOptional({ description: 'Hours per chunk partition (default: 24)', default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(720)
  chunkHours?: number;

  @ApiPropertyOptional({ description: 'Control zone code', example: 'VN_ICT' })
  @IsOptional()
  @IsString()
  controlZone?: string;

  @ApiPropertyOptional({ description: 'Strict mode validation', default: true })
  @IsOptional()
  @IsBoolean()
  strictMode?: boolean;
}

export class RunElectionScanDto {
  @ApiProperty({ type: () => ElectionScanRequestDto })
  @ValidateNested()
  @Type(() => ElectionScanRequestDto)
  request!: ElectionScanRequestDto;

  @ApiPropertyOptional({ type: () => ElectionScanOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ElectionScanOptionsDto)
  options?: ElectionScanOptionsDto;
}
