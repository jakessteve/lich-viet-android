import { Controller, Get, Query, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalendarService } from './calendar.service.js';
import { GetCalendarDayDto, GetDungSuDto } from './dto/calendar.dto.js';

@ApiTags('Calendar & Dụng Sự')
@Controller('v1/calendar')
export class CalendarController {
  constructor(@Inject(CalendarService) private readonly calendarService: CalendarService) {}

  @Get('day')
  @ApiOperation({ summary: 'Get solar/lunar calendar day details with Can Chi and solar terms' })
  @ApiResponse({ status: 200, description: 'Calendar day calculation details' })
  getDayDetail(@Query() query: GetCalendarDayDto) {
    return this.calendarService.getDayDetail(query.date, query.timezone ? Number(query.timezone) : 7);
  }

  @Get('dung-su/catalog')
  @ApiOperation({ summary: 'Get catalog of auspicious events and categories for Dụng Sự' })
  @ApiResponse({ status: 200, description: 'Dụng Sự event catalog' })
  getDungSuCatalog() {
    return this.calendarService.getDungSuCatalog();
  }

  @Post('dung-su/score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate auspiciousness score for a specific date and event' })
  @ApiResponse({ status: 200, description: 'Dụng Sự calculation score' })
  getDungSuScore(@Body() body: GetDungSuDto) {
    return this.calendarService.getDungSuScore(body.date, body.profileId);
  }
}
