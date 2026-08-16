import { Controller, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AstrologyService } from './astrology.service.js';
import {
  CreateWesternChartDto,
  CreateVedicChartDto,
  CreateSynastryDto
} from './dto/astrology.dto.js';

@ApiTags('Astrology (Western, Vedic & Synastry)')
@Controller('v1/astrology')
export class AstrologyController {
  constructor(@Inject(AstrologyService) private readonly astrologyService: AstrologyService) {}

  @Post('western')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate Western natal chart with houses, planetary aspects, and patterns' })
  @ApiResponse({ status: 200, description: 'Western natal chart calculations' })
  calculateWesternChart(@Body() body: CreateWesternChartDto) {
    return this.astrologyService.calculateWesternChart(body);
  }

  @Post('vedic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate Vedic Kundli (D1 & D9 Navamsha), Nakshatras, and Vimshottari Dashas' })
  @ApiResponse({ status: 200, description: 'Vedic Kundli chart calculation' })
  calculateVedicKundli(@Body() body: CreateVedicChartDto) {
    return this.astrologyService.calculateVedicKundli(body);
  }

  @Post('synastry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate Synastry compatibility between two natal charts' })
  @ApiResponse({ status: 200, description: 'Synastry compatibility calculation' })
  calculateSynastry(@Body() body: CreateSynastryDto) {
    return this.astrologyService.calculateSynastry(body);
  }
}
