import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDamGioDto {
  @ApiProperty({ description: 'Tên người đã khuất', example: 'Cụ Nguyễn Văn Tổ' })
  @IsNotEmpty()
  @IsString()
  deceasedName!: string;

  @ApiProperty({ description: 'Mối quan hệ', example: 'Ông Cố' })
  @IsNotEmpty()
  @IsString()
  relationship!: string;

  @ApiProperty({ description: 'Ngày âm lịch (1-30)', example: 15 })
  @IsNumber()
  @Min(1)
  @Max(30)
  lunarDay!: number;

  @ApiProperty({ description: 'Tháng âm lịch (1-12)', example: 7 })
  @IsNumber()
  @Min(1)
  @Max(12)
  lunarMonth!: number;

  @ApiPropertyOptional({ description: 'Là tháng nhuận', default: false })
  @IsOptional()
  @IsBoolean()
  isLeapMonth?: boolean;

  @ApiPropertyOptional({ description: 'Ghi chú lễ cúng/phong tục' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Số ngày nhắc trước (ví dụ [1, 3, 7])', default: [1] })
  @IsOptional()
  @IsArray()
  alarmLeadDays?: number[];
}

export class UpdateDamGioDto {
  @ApiPropertyOptional({ description: 'Tên người đã khuất' })
  @IsOptional()
  @IsString()
  deceasedName?: string;

  @ApiPropertyOptional({ description: 'Mối quan hệ' })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({ description: 'Ngày âm lịch (1-30)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  lunarDay?: number;

  @ApiPropertyOptional({ description: 'Tháng âm lịch (1-12)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  lunarMonth?: number;

  @ApiPropertyOptional({ description: 'Là tháng nhuận' })
  @IsOptional()
  @IsBoolean()
  isLeapMonth?: boolean;

  @ApiPropertyOptional({ description: 'Ghi chú lễ cúng/phong tục' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Số ngày nhắc trước' })
  @IsOptional()
  @IsArray()
  alarmLeadDays?: number[];
}
