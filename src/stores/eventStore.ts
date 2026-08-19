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
  pendingMutations: SyncMutation[];
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
  clearAcknowledgedMutations: (mutationIds: string[]) => void;
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
      pendingMutations: [],
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

        const mutation: SyncMutation = {
          mutationId: `mut-event-${id}-${Date.now()}`,
          entityType: 'calendar_event',
          entityId: id,
          action: 'insert',
          payload: { ...newEvent },
          clientUpdatedAt: now,
        };

        set((state) => ({
          events: [...state.events, newEvent],
          pendingMutations: [...state.pendingMutations.filter((m) => m.entityId !== id), mutation],
        }));

        return newEvent;
      },

      updateEvent: (id, updates) => {
        const now = new Date().toISOString();
        let updatedEvent: CalendarEventDto | undefined;

        set((state) => {
          const events = state.events.map((ev) => {
            if (ev.id === id) {
              updatedEvent = {
                ...ev,
                ...updates,
                title: updates.title !== undefined ? updates.title.trim() : ev.title,
                description: updates.description !== undefined ? updates.description?.trim() : ev.description,
                updatedAt: now,
              };
              return updatedEvent;
            }
            return ev;
          });

          const mutation: SyncMutation = {
            mutationId: `mut-event-${id}-${Date.now()}`,
            entityType: 'calendar_event',
            entityId: id,
            action: 'update',
            payload: updatedEvent ? { ...updatedEvent } : (updates as Record<string, unknown>),
            clientUpdatedAt: now,
          };

          return {
            events,
            pendingMutations: [...state.pendingMutations.filter((m) => m.entityId !== id), mutation],
          };
        });
      },

      deleteEvent: (id) => {
        const now = new Date().toISOString();
        const mutation: SyncMutation = {
          mutationId: `mut-del-event-${id}-${Date.now()}`,
          entityType: 'calendar_event',
          entityId: id,
          action: 'delete',
          clientUpdatedAt: now,
        };

        set((state) => ({
          events: state.events.filter((ev) => ev.id !== id),
          pendingMutations: [...state.pendingMutations.filter((m) => m.entityId !== id), mutation],
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
        set({ events: [], pendingMutations: [] });
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
        const { pendingMutations, events } = get();
        if (pendingMutations.length > 0) {
          return pendingMutations;
        }

        // Fallback for initial export of non-seed events if queue is empty
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

      clearAcknowledgedMutations: (mutationIds: string[]) => {
        if (!mutationIds || mutationIds.length === 0) return;
        const ackedSet = new Set(mutationIds);
        set((state) => ({
          pendingMutations: state.pendingMutations.filter((m) => !ackedSet.has(m.mutationId)),
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
