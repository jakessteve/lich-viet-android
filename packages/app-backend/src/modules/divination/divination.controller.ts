import { Controller, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DivinationService } from './divination.service.js';
import { CreateMaiHoaDto, CreateTamThucDto } from './dto/divination.dto.js';

@ApiTags('Divination (Mai Hoa & Tam Thức)')
@Controller('v1/divination')
export class DivinationController {
  constructor(@Inject(DivinationService) private readonly divinationService: DivinationService) {}

  @Post('mai-hoa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cast Mai Hoa Dịch Số hexagram reading from time or numbers' })
  @ApiResponse({ status: 200, description: 'Mai Hoa hexagram calculation and reading' })
  castMaiHoa(@Body() body: CreateMaiHoaDto) {
    return this.divinationService.castMaiHoa(body);
  }

  @Post('tam-thuc')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate unified Tam Thức synthesis (QMDJ + Thái Ất + Lục Nhâm)' })
  @ApiResponse({ status: 200, description: 'Tam Thức calculation reading' })
  calculateTamThuc(@Body() body: CreateTamThucDto) {
    return this.divinationService.calculateTamThuc(body);
  }
}
