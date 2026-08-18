import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarEventDto } from '@lich-viet/contracts';
import { createCalendarDayDetail, createDungSuCatalog, createDungSuScoreDetail } from '../../frontend-readiness.js';
import { CreateBackendCalendarEventDto, UpdateBackendCalendarEventDto } from './dto/calendar.dto.js';

@Injectable()
export class CalendarService {
  private events: Map<string, CalendarEventDto> = new Map();

  constructor() {
    // Seed initial event with recurrence
    this.createEvent('demo-user-001', {
      title: 'Tết Trung Thu',
      description: 'Lễ hội trăng rằm tháng 8',
      calendarType: 'lunar',
      solarDate: '2026-09-25',
      lunarDay: 15,
      lunarMonth: 8,
      recurrence: 'yearly_lunar',
      category: 'ritual',
      emoji: '🥮',
      alarmOffsetsMinutes: [60, 1440],
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
      calendarType: dto.calendarType ?? 'solar',
      solarDate: dto.solarDate,
      lunarDay: dto.lunarDay,
      lunarMonth: dto.lunarMonth,
      lunarYear: dto.lunarYear,
      isLeapMonth: dto.isLeapMonth,
      recurrence: dto.recurrence ?? 'none',
      recurrenceEndDate: dto.recurrenceEndDate,
      category: dto.category ?? 'personal',
      emoji: dto.emoji,
      color: dto.color,
      alarmOffsetsMinutes: dto.alarmOffsetsMinutes ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(userId: string, id: string, dto: UpdateBackendCalendarEventDto): Promise<CalendarEventDto> {
    const existing = this.events.get(id);
    if (!existing) {
      throw new NotFoundException(`Calendar event #${id} not found`);
    }

    const now = new Date().toISOString();
    const updated: CalendarEventDto = {
      ...existing,
      ...dto,
      id,
      userId: existing.userId,
      updatedAt: now,
    };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(userId: string, id: string): Promise<void> {
    if (!this.events.has(id)) {
      throw new NotFoundException(`Calendar event #${id} not found`);
    }
    this.events.delete(id);
  }
}
