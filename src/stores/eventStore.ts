/**
 * Calendar Event Store — Offline-first Zustand State
 *
 * Manages user-created events with one-off and repeating recurrence rules,
 * with local persistence and seamless integration into upcoming cards & calendar cells.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CalendarEventDto,
  CreateCalendarEventDto,
  UpcomingEventOccurrence,
  SyncMutation,
  ServerDelta,
} from '@lich-viet/contracts';
import { getUpcomingEvents, getEventsForDate } from '@/utils/eventEngine';

export interface EventState {
  events: CalendarEventDto[];
  isLoading: boolean;
  
  // Actions
  addEvent: (dto: CreateCalendarEventDto, userId?: string) => CalendarEventDto;
  updateEvent: (id: string, updates: Partial<CreateCalendarEventDto>) => void;
  deleteEvent: (id: string) => void;
  importEvents: (events: CalendarEventDto[]) => void;
  clearAllEvents: () => void;
  
  // Computed helpers
  getUpcoming: (daysAhead?: number, fromDate?: Date) => UpcomingEventOccurrence[];
  getForDate: (date: Date) => UpcomingEventOccurrence[];

  // Sync helpers
  exportSyncMutations: () => SyncMutation[];
  applyServerDeltas: (deltas: ServerDelta[]) => void;
}

const DEFAULT_SEEDED_EVENTS: CalendarEventDto[] = [
  {
    id: 'seed-ram-mung-1',
    userId: 'local-user',
    title: 'Thắp hương Mùng 1 & Ngày Rằm',
    description: 'Bao sái ban thờ, chuẩn bị lễ chay / hoa quả tươi cúng Phật và gia tiên',
    calendarType: 'lunar',
    solarDate: '2026-01-01',
    recurrence: 'monthly_lunar',
    category: 'ritual',
    emoji: '🌸',
    color: '#8b5cf6',
    alarmOffsetsMinutes: [60],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-trung-thu',
    userId: 'local-user',
    title: 'Tết Trung Thu (Rằm tháng 8)',
    description: 'Lễ hội trăng rằm, cúng gia tiên và sum vầy gia đình',
    calendarType: 'lunar',
    solarDate: '2026-09-25',
    lunarDay: 15,
    lunarMonth: 8,
    recurrence: 'yearly_lunar',
    category: 'ritual',
    emoji: '🥮',
    color: '#d4a843',
    alarmOffsetsMinutes: [1440],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: DEFAULT_SEEDED_EVENTS,
      isLoading: false,

      addEvent: (dto, userId = 'local-user') => {
        const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();

        const newEvent: CalendarEventDto = {
          id,
          userId,
          title: dto.title.trim(),
          description: dto.description?.trim(),
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

        set((state) => ({
          events: [...state.events, newEvent],
        }));

        return newEvent;
      },

      updateEvent: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          events: state.events.map((ev) =>
            ev.id === id
              ? {
                  ...ev,
                  ...updates,
                  title: updates.title !== undefined ? updates.title.trim() : ev.title,
                  description: updates.description !== undefined ? updates.description?.trim() : ev.description,
                  updatedAt: now,
                }
              : ev,
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((ev) => ev.id !== id),
        }));
      },

      importEvents: (incomingEvents) => {
        set((state) => {
          const existingIds = new Set(state.events.map((e) => e.id));
          const toAdd = incomingEvents.filter((e) => !existingIds.has(e.id));
          return { events: [...state.events, ...toAdd] };
        });
      },

      clearAllEvents: () => {
        set({ events: [] });
      },

      getUpcoming: (daysAhead = 30, fromDate = new Date()) => {
        const { events } = get();
        return getUpcomingEvents(events, daysAhead, fromDate);
      },

      getForDate: (date = new Date()) => {
        const { events } = get();
        return getEventsForDate(events, date);
      },

      exportSyncMutations: () => {
        const { events } = get();
        return events
          .filter((e) => !e.id.startsWith('seed-'))
          .map((e) => ({
            mutationId: `mut-event-${e.id}`,
            entityType: 'calendar_event' as const,
            entityId: e.id,
            action: 'update' as const,
            payload: { ...e },
            clientUpdatedAt: e.updatedAt || new Date().toISOString(),
          }));
      },

      applyServerDeltas: (deltas) => {
        if (!deltas || deltas.length === 0) return;
        set((state) => {
          let updatedEvents = [...state.events];
          for (const d of deltas) {
            if (d.entityType !== 'calendar_event' && d.entityType !== 'dam_gio') continue;
            if (d.action === 'delete') {
              updatedEvents = updatedEvents.filter((e) => e.id !== d.entityId);
            } else if (d.payload) {
              const payload = d.payload as unknown as CalendarEventDto;
              const idx = updatedEvents.findIndex((e) => e.id === d.entityId);
              if (idx >= 0) {
                updatedEvents[idx] = { ...updatedEvents[idx], ...payload };
              } else {
                updatedEvents.push({
                  ...payload,
                  id: d.entityId || payload.id || `evt-${Date.now()}`,
                });
              }
            }
          }
          return { events: updatedEvents };
        });
      },
    }),
    {
      name: 'lichviet_user_calendar_events_v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
