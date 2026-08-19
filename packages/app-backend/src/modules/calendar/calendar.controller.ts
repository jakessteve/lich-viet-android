import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service.js';
import {
  GetCalendarDayDto,
  GetDungSuDto,
  GetCalendarEventsQueryDto,
  CreateBackendCalendarEventDto,
} from './dto/calendar.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List calendar events in date range' })
  @ApiResponse({ status: 200, description: 'List of calendar events' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' })
  getEvents(@CurrentUser('sub') userId: string, @Query() query: GetCalendarEventsQueryDto) {
    return this.calendarService.getEvents(userId, query.start, query.end);
  }

  @Post('events')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiResponse({ status: 201, description: 'Created calendar event' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' })
  createEvent(@CurrentUser('sub') userId: string, @Body() body: CreateBackendCalendarEventDto) {
    return this.calendarService.createEvent(userId, body);
  }

  @Put('events/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a calendar event' })
  @ApiResponse({ status: 200, description: 'Updated calendar event' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify another user event' })
  updateEvent(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() body: CreateBackendCalendarEventDto,
  ) {
    return this.calendarService.updateEvent(userId, id, body);
  }

  @Delete('events/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a calendar event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete another user event' })
  deleteEvent(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.calendarService.deleteEvent(userId, id);
  }
}
