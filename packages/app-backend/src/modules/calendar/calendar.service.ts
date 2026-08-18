import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarEventDto } from '@lich-viet/contracts';
import { createCalendarDayDetail, createDungSuCatalog, createDungSuScoreDetail } from '../../frontend-readiness.js';
import { CreateBackendCalendarEventDto } from './dto/calendar.dto.js';

@Injectable()
export class CalendarService {
  private events: Map<string, CalendarEventDto> = new Map();

  constructor() {
    // Seed initial event
    this.createEvent('demo-user-001', {
      title: 'Tết Trung Thu',
      description: 'Lễ hội trăng rằm',
      solarDate: '2026-09-25',
      category: 'holiday',
      alarmOffsetsMinutes: [60],
    });
  }

  getDayDetail(date?: string, timezone: number = 7) {
    const inputDate = date ? new Date(date) : new Date();
    return createCalendarDayDetail({
      date: inputDate,
      location: { timezone },
    });
  }

  getDungSuCatalog() {
    return createDungSuCatalog();
  }

  getDungSuScore(date?: string, eventId?: string) {
    const inputDate = date ? new Date(date) : new Date();
    return createDungSuScoreDetail({
      date: inputDate,
      eventId: eventId ?? 'ds_kai_shi',
    });
  }

  async getEvents(userId: string, start?: string, end?: string): Promise<CalendarEventDto[]> {
    const list = Array.from(this.events.values()).filter((e) => e.userId === userId || userId === 'demo-user-001');
    if (!start && !end) return list;

    return list.filter((e) => {
      if (start && e.solarDate < start) return false;
      if (end && e.solarDate > end) return false;
      return true;
    });
  }

  async createEvent(userId: string, dto: CreateBackendCalendarEventDto): Promise<CalendarEventDto> {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const event: CalendarEventDto = {
      id,
      userId,
      title: dto.title,
      description: dto.description,
      solarDate: dto.solarDate,
      category: dto.category,
      alarmOffsetsMinutes: dto.alarmOffsetsMinutes ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, event);
    return event;
  }

  async deleteEvent(userId: string, id: string): Promise<void> {
    if (!this.events.has(id)) {
      throw new NotFoundException(`Calendar event #${id} not found`);
    }
    this.events.delete(id);
  }
}
