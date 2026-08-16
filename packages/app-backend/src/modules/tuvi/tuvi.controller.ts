import { Controller, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TuViService } from './tuvi.service.js';
import { CreateTuViChartDto } from './dto/tuvi.dto.js';

@ApiTags('Tử Vi Đẩu Số')
@Controller('v1/tu-vi')
export class TuViController {
  constructor(@Inject(TuViService) private readonly tuviService: TuViService) {}

  @Post('chart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate 12-palace Tử Vi chart with stars, Mệnh/Thân, and Hạn timeline' })
  @ApiResponse({ status: 200, description: 'Tử Vi chart details and palace layout' })
  generateChart(@Body() body: CreateTuViChartDto) {
    return this.tuviService.generateChart(body);
  }
}
