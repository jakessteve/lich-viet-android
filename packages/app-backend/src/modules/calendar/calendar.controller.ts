import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  Inject,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CalendarService } from './calendar.service.js';
import {
  GetCalendarDayDto,
  GetDungSuDto,
  GetCalendarEventsQueryDto,
  CreateBackendCalendarEventDto,
} from './dto/calendar.dto.js';

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

  @Get('events')
  @ApiOperation({ summary: 'List calendar events in date range' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'List of calendar events' })
  getEvents(@Query() query: GetCalendarEventsQueryDto, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.calendarService.getEvents(userId, query.start, query.end);
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 201, description: 'Created calendar event' })
  createEvent(@Body() body: CreateBackendCalendarEventDto, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.calendarService.createEvent(userId, body);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a calendar event' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token', required: false })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  deleteEvent(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.calendarService.deleteEvent(userId, id);
  }

  private extractUserId(authHeader?: string): string {
    if (!authHeader) return 'demo-user-001';
    const parts = authHeader.replace(/^Bearer\s+/i, '').split('-');
    if (parts.length >= 2 && parts[0] === 'jwt') {
      return parts.slice(1, parts.length - 1).join('-');
    }
    return 'demo-user-001';
  }
}
