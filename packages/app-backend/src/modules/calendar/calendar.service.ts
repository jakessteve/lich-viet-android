import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CalendarEventDto } from '@lich-viet/contracts';
import { createCalendarDayDetail, createDungSuCatalog, createDungSuScoreDetail } from '../../frontend-readiness.js';
import { CreateBackendCalendarEventDto, UpdateBackendCalendarEventDto } from './dto/calendar.dto.js';
import { DatabaseService, DbCalendarEvent } from '../../db/database.service.js';

@Injectable()
export class CalendarService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {
    this.seedDemoEvent();
  }

  private seedDemoEvent() {
    const existing = this.db.prepare<DbCalendarEvent>('SELECT id FROM calendar_events WHERE id = ?').get('seed-trung-thu-demo');
    if (!existing) {
      const now = new Date().toISOString();
      this.db
        .prepare(
          `INSERT INTO calendar_events (
            id, user_id, title, description, calendar_type, solar_date,
            lunar_day, lunar_month, lunar_year, is_leap_month, recurrence,
            category, emoji, alarm_offsets_minutes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          'seed-trung-thu-demo',
          'demo-user-001',
          'Tết Trung Thu',
          'Lễ hội trăng rằm tháng 8',
          'lunar',
          '2026-09-25',
          15,
          8,
          'yearly_lunar',
          'ritual',
          '🥮',
          JSON.stringify([60, 1440]),
          now,
          now,
        );
    }
  }

  private toCalendarEventDto(row: DbCalendarEvent): CalendarEventDto {
    let alarmOffsets: number[] = [];
    if (row.alarm_offsets_minutes) {
      try {
        alarmOffsets = JSON.parse(row.alarm_offsets_minutes);
      } catch {
        // ignore
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || undefined,
      calendarType: (row.calendar_type as 'solar' | 'lunar') || 'solar',
      solarDate: row.solar_date,
      lunarDay: row.lunar_day ?? undefined,
      lunarMonth: row.lunar_month ?? undefined,
      lunarYear: row.lunar_year ?? undefined,
      isLeapMonth: Boolean(row.is_leap_month),
      recurrence: (row.recurrence as 'none' | 'daily' | 'weekly' | 'monthly_solar' | 'monthly_lunar' | 'yearly_solar' | 'yearly_lunar') || 'none',
      recurrenceEndDate: row.recurrence_end_date || undefined,
      category: (row.category as 'personal' | 'dam_gio' | 'memorial' | 'work' | 'family' | 'ritual') || 'personal',
      emoji: row.emoji || undefined,
      color: row.color || undefined,
      alarmOffsetsMinutes: alarmOffsets,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    let sql = 'SELECT * FROM calendar_events WHERE user_id = ?';
    const params: (string | number)[] = [userId];

    if (start) {
      sql += ' AND solar_date >= ?';
      params.push(start);
    }
    if (end) {
      sql += ' AND solar_date <= ?';
      params.push(end);
    }

    sql += ' ORDER BY solar_date ASC';

    const rows = this.db.prepare<DbCalendarEvent>(sql).all(...params);
    return rows.map((r) => this.toCalendarEventDto(r));
  }

  async createEvent(userId: string, dto: CreateBackendCalendarEventDto): Promise<CalendarEventDto> {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const alarmOffsetsJson = dto.alarmOffsetsMinutes ? JSON.stringify(dto.alarmOffsetsMinutes) : null;

    this.db
      .prepare(
        `INSERT INTO calendar_events (
          id, user_id, title, description, calendar_type, solar_date,
          lunar_day, lunar_month, lunar_year, is_leap_month, recurrence,
          recurrence_end_date, category, emoji, color, alarm_offsets_minutes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        userId,
        dto.title,
        dto.description || null,
        dto.calendarType || 'solar',
        dto.solarDate,
        dto.lunarDay ?? null,
        dto.lunarMonth ?? null,
        dto.lunarYear ?? null,
        dto.isLeapMonth ? 1 : 0,
        dto.recurrence || 'none',
        dto.recurrenceEndDate || null,
        dto.category || 'personal',
        dto.emoji || null,
        dto.color || null,
        alarmOffsetsJson,
        now,
        now,
      );

    const created = this.db.prepare<DbCalendarEvent>('SELECT * FROM calendar_events WHERE id = ?').get(id);
    if (!created) {
      throw new NotFoundException('Failed to create calendar event');
    }
    return this.toCalendarEventDto(created);
  }

  async updateEvent(userId: string, id: string, dto: UpdateBackendCalendarEventDto): Promise<CalendarEventDto> {
    const existing = this.db.prepare<DbCalendarEvent>('SELECT * FROM calendar_events WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundException(`Calendar event #${id} not found`);
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException(`You are not authorized to modify event #${id}`);
    }

    const now = new Date().toISOString();
    const title = dto.title !== undefined ? dto.title : existing.title;
    const description = dto.description !== undefined ? dto.description : existing.description;
    const solarDate = dto.solarDate !== undefined ? dto.solarDate : existing.solar_date;
    const calendarType = dto.calendarType !== undefined ? dto.calendarType : existing.calendar_type;
    const lunarDay = dto.lunarDay !== undefined ? dto.lunarDay : existing.lunar_day;
    const lunarMonth = dto.lunarMonth !== undefined ? dto.lunarMonth : existing.lunar_month;
    const lunarYear = dto.lunarYear !== undefined ? dto.lunarYear : existing.lunar_year;
    const isLeapMonth = dto.isLeapMonth !== undefined ? (dto.isLeapMonth ? 1 : 0) : existing.is_leap_month;
    const recurrence = dto.recurrence !== undefined ? dto.recurrence : existing.recurrence;
    const recurrenceEndDate = dto.recurrenceEndDate !== undefined ? dto.recurrenceEndDate : existing.recurrence_end_date;
    const category = dto.category !== undefined ? dto.category : existing.category;
    const emoji = dto.emoji !== undefined ? dto.emoji : existing.emoji;
    const color = dto.color !== undefined ? dto.color : existing.color;
    const alarmOffsetsJson =
      dto.alarmOffsetsMinutes !== undefined
        ? JSON.stringify(dto.alarmOffsetsMinutes)
        : existing.alarm_offsets_minutes;

    this.db
      .prepare(
        `UPDATE calendar_events SET
          title = ?, description = ?, solar_date = ?, calendar_type = ?,
          lunar_day = ?, lunar_month = ?, lunar_year = ?, is_leap_month = ?,
          recurrence = ?, recurrence_end_date = ?, category = ?, emoji = ?,
          color = ?, alarm_offsets_minutes = ?, updated_at = ?
        WHERE id = ? AND user_id = ?`,
      )
      .run(
        title,
        description,
        solarDate,
        calendarType,
        lunarDay,
        lunarMonth,
        lunarYear,
        isLeapMonth,
        recurrence,
        recurrenceEndDate,
        category,
        emoji,
        color,
        alarmOffsetsJson,
        now,
        id,
        userId,
      );

    const updated = this.db.prepare<DbCalendarEvent>('SELECT * FROM calendar_events WHERE id = ?').get(id);
    if (!updated) {
      throw new NotFoundException(`Calendar event #${id} not found after update`);
    }
    return this.toCalendarEventDto(updated);
  }

  async deleteEvent(userId: string, id: string): Promise<void> {
    const existing = this.db.prepare<DbCalendarEvent>('SELECT * FROM calendar_events WHERE id = ?').get(id);
    if (!existing) {
      throw new NotFoundException(`Calendar event #${id} not found`);
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException(`You are not authorized to delete event #${id}`);
    }

    this.db.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?').run(id, userId);
  }

  async upsertEventFromSync(userId: string, id: string, payload?: Record<string, unknown>): Promise<void> {
    if (!payload) return;
    const existing = this.db.prepare<DbCalendarEvent>('SELECT * FROM calendar_events WHERE id = ?').get(id);
    const now = new Date().toISOString();
    const alarmOffsetsJson = payload.alarmOffsetsMinutes ? JSON.stringify(payload.alarmOffsetsMinutes) : null;

    if (existing) {
      if (existing.user_id !== userId) return; // Prevent IDOR cross-tenant overwrite
      this.db
        .prepare(
          `UPDATE calendar_events SET
            title = ?, description = ?, solar_date = ?, calendar_type = ?,
            lunar_day = ?, lunar_month = ?, lunar_year = ?, is_leap_month = ?,
            recurrence = ?, recurrence_end_date = ?, category = ?, emoji = ?,
            color = ?, alarm_offsets_minutes = ?, updated_at = ?
          WHERE id = ? AND user_id = ?`,
        )
        .run(
          payload.title !== undefined ? String(payload.title) : existing.title,
          payload.description !== undefined ? (payload.description ? String(payload.description) : null) : existing.description,
          payload.solarDate !== undefined ? String(payload.solarDate) : existing.solar_date,
          payload.calendarType !== undefined ? String(payload.calendarType) : existing.calendar_type,
          payload.lunarDay !== undefined ? Number(payload.lunarDay) : existing.lunar_day,
          payload.lunarMonth !== undefined ? Number(payload.lunarMonth) : existing.lunar_month,
          payload.lunarYear !== undefined ? Number(payload.lunarYear) : existing.lunar_year,
          payload.isLeapMonth !== undefined ? (payload.isLeapMonth ? 1 : 0) : existing.is_leap_month,
          payload.recurrence !== undefined ? String(payload.recurrence) : existing.recurrence,
          payload.recurrenceEndDate !== undefined ? (payload.recurrenceEndDate ? String(payload.recurrenceEndDate) : null) : existing.recurrence_end_date,
          payload.category !== undefined ? String(payload.category) : existing.category,
          payload.emoji !== undefined ? (payload.emoji ? String(payload.emoji) : null) : existing.emoji,
          payload.color !== undefined ? (payload.color ? String(payload.color) : null) : existing.color,
          alarmOffsetsJson !== null ? alarmOffsetsJson : existing.alarm_offsets_minutes,
          now,
          id,
          userId,
        );
    } else {
      this.db
        .prepare(
          `INSERT INTO calendar_events (
            id, user_id, title, description, calendar_type, solar_date,
            lunar_day, lunar_month, lunar_year, is_leap_month, recurrence,
            recurrence_end_date, category, emoji, color, alarm_offsets_minutes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          id,
          userId,
          payload.title ? String(payload.title) : 'Sự kiện không tên',
          payload.description ? String(payload.description) : null,
          payload.calendarType ? String(payload.calendarType) : 'solar',
          payload.solarDate ? String(payload.solarDate) : now.slice(0, 10),
          payload.lunarDay !== undefined ? Number(payload.lunarDay) : null,
          payload.lunarMonth !== undefined ? Number(payload.lunarMonth) : null,
          payload.lunarYear !== undefined ? Number(payload.lunarYear) : null,
          payload.isLeapMonth ? 1 : 0,
          payload.recurrence ? String(payload.recurrence) : 'none',
          payload.recurrenceEndDate ? String(payload.recurrenceEndDate) : null,
          payload.category ? String(payload.category) : 'personal',
          payload.emoji ? String(payload.emoji) : null,
          payload.color ? String(payload.color) : null,
          alarmOffsetsJson,
          payload.createdAt ? String(payload.createdAt) : now,
          payload.updatedAt ? String(payload.updatedAt) : now,
        );
    }
  }
}
