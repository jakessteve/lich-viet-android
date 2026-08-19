/**
 * UpcomingEventsCard — "Sự kiện sắp tới"
 *
 * Displays user calendar events, anniversaries, and reminders within next N days.
 * Styled in complete visual harmony with HolidaysCard.
 */

import React, { useState, useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import CollapsibleCard from '../CollapsibleCard';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Plus, Edit3, Trash2, CalendarPlus, Repeat } from 'lucide-react';
import { EventEditorModal } from './EventEditorModal';
import { CalendarEventDto, CreateCalendarEventDto, UpcomingEventOccurrence } from '@lich-viet/contracts';
import { getUpcomingEvents, CATEGORY_META, RECURRENCE_LABELS } from '@/utils/eventEngine';

interface UpcomingEventsCardProps {
  daysAhead?: number;
  className?: string;
  selectedDate?: Date;
}

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({
  daysAhead = 14,
  className = '',
  selectedDate,
}) => {
  const events = useEventStore((s) => s.events);
  const addEvent = useEventStore((s) => s.addEvent);
  const updateEvent = useEventStore((s) => s.updateEvent);
  const deleteEvent = useEventStore((s) => s.deleteEvent);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventDto | null>(null);

  // Compute upcoming occurrences for daysAhead with stable timestamp dependency
  const selectedTimestamp = selectedDate ? selectedDate.getTime() : null;
  const upcomingList: UpcomingEventOccurrence[] = useMemo(() => {
    const baseDate = selectedTimestamp ? new Date(selectedTimestamp) : new Date();
    return getUpcomingEvents(events, daysAhead, baseDate);
  }, [events, daysAhead, selectedTimestamp]);

  const handleOpenAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (occ: UpcomingEventOccurrence) => {
    const raw = events.find((e) => e.id === occ.eventId) || null;
    setEditingEvent(raw);
    setIsModalOpen(true);
  };

  const handleSave = (dto: CreateCalendarEventDto, id?: string) => {
    if (id) {
      updateEvent(id, dto);
    } else {
      addEvent(dto);
    }
  };

  const titleNode = (
    <div className="flex items-center gap-2 font-semibold text-sm">
      <CalendarDays className="h-4 w-4 text-purple dark:text-purple-dark" />
      <span>Sự kiện sắp tới ({daysAhead} ngày)</span>
    </div>
  );

  const headerRightNode = (
    <div className="flex items-center gap-2">
      {upcomingList.length > 0 && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple/10 text-purple dark:text-purple-dark">
          {upcomingList.length} sự kiện
        </span>
      )}
      <button
        type="button"
        onClick={handleOpenAdd}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple/15 text-purple dark:text-purple-dark hover:bg-purple/25 text-xs font-bold transition-colors spring-press cursor-pointer"
        title="Thêm sự kiện mới"
        aria-label="Thêm sự kiện"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Thêm</span>
      </button>
    </div>
  );

  return (
    <>
      <CollapsibleCard
        title={titleNode}
        defaultOpen={false}
        collapseOnMobile={true}
        headerRight={headerRightNode}
        className={`shadow-apple ${className}`}
      >
        <div className="p-4 space-y-3">
          {upcomingList.length === 0 ? (
            <div className="text-center py-6 px-4 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-purple/10 dark:bg-purple/20 flex items-center justify-center text-purple">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Chưa có sự kiện trong {daysAhead} ngày tới
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-xs mx-auto">
                  Thêm ngày giỗ, sinh nhật, hoặc công việc để nhận nhắc nhở kịp thời.
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAdd(e);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple text-white text-xs font-bold shadow-xs hover:bg-purple/90 transition-all spring-press cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm sự kiện đầu tiên</span>
              </button>
            </div>
          ) : (
            upcomingList.map((occ, idx) => {
              const isToday = occ.daysUntil === 0;
              const isTomorrow = occ.daysUntil === 1;
              const categoryMeta = CATEGORY_META[occ.category] || CATEGORY_META.personal;

              return (
                <div
                  key={`${occ.eventId}-${idx}`}
                  className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all border ${
                    isToday
                      ? 'bg-purple/10 dark:bg-purple/15 border-purple/30 dark:border-purple/30'
                      : isTomorrow
                        ? 'bg-surface-subtle-light dark:bg-surface-elevated-dark border-border-light/60 dark:border-border-dark/40'
                        : 'bg-transparent border-border-light/30 dark:border-border-dark/20 hover:bg-surface-subtle-light/60 dark:hover:bg-surface-elevated-dark/40'
                  }`}
                >
                  {/* Emoji Avatar */}
                  <span className="text-2xl leading-none mt-0.5 shrink-0 select-none">{occ.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark leading-snug truncate">
                        {occ.title}
                      </p>

                      {/* Countdown Badge */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                          isToday
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : isTomorrow
                              ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                              : 'bg-surface-container-low dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isToday ? 'Hôm nay' : isTomorrow ? 'Ngày mai' : `Còn ${occ.daysUntil} ngày`}
                      </span>
                    </div>

                    {/* Date Details & Badges */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark font-sans">
                        {occ.dayOfWeek}, {occ.dateStr}
                      </span>

                      {occ.calendarType === 'lunar' && occ.lunarDateStr && (
                        <span className="text-[11px] text-gold dark:text-gold-dark font-medium">
                          ({occ.lunarDateStr})
                        </span>
                      )}

                      <Badge
                        variant={categoryMeta.badgeVariant}
                        className="text-[10px] px-1.5 py-0.2 rounded-full"
                      >
                        {categoryMeta.label}
                      </Badge>

                      {occ.recurrence !== 'none' && (
                        <Badge variant="info" className="text-[10px] px-1.5 py-0.2 rounded-full flex items-center gap-1">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{RECURRENCE_LABELS[occ.recurrence]}</span>
                        </Badge>
                      )}
                    </div>

                    {/* Optional description preview */}
                    {occ.description && (
                      <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-1">
                        {occ.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Edit button visible on hover/tap */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(occ)}
                      className="p-1.5 rounded-lg text-text-secondary-light hover:text-text-primary-light hover:bg-surface-container-low dark:hover:bg-white/10 transition-colors spring-press cursor-pointer"
                      title="Chỉnh sửa sự kiện"
                      aria-label="Chỉnh sửa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa "${occ.title}"?`)) {
                          deleteEvent(occ.eventId);
                        }
                      }}
                      className="p-1.5 rounded-lg text-text-secondary-light hover:text-red-500 hover:bg-red-500/10 transition-colors spring-press cursor-pointer"
                      title="Xóa sự kiện"
                      aria-label="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CollapsibleCard>

      {/* Editor Modal */}
      <EventEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        onDelete={deleteEvent}
        initialEvent={editingEvent}
        defaultDate={selectedDate}
      />
    </>
  );
};

export default UpcomingEventsCard;
