/**
 * Event Editor Modal — Accessible Dialog for Creating & Editing Calendar Events
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEventDto, CreateCalendarEventDto, EventCategory, EventRecurrenceType } from '@lich-viet/contracts';
import { getLunarDate, getCanChiDay } from '@/utils/calendarEngine';
import { CATEGORY_META, findSolarDateForLunar, formatSolarDateStr } from '@/utils/eventEngine';
import { X, Sparkles, Clock, Trash2, Tag, Repeat } from 'lucide-react';
import { ActionButton } from '../shared';

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateCalendarEventDto, id?: string) => void;
  onDelete?: (id: string) => void;
  initialEvent?: CalendarEventDto | null;
  defaultDate?: Date;
}

const COMMON_EMOJIS = ['📅', '🎂', '🕯️', '🌸', '🥮', '🏡', '💼', '⭐', '💍', '✈️', '💊', '🎓'];

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  defaultDate,
}) => {
  const initDate = initialEvent ? new Date(initialEvent.solarDate) : defaultDate || new Date();

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(initialEvent?.calendarType || 'solar');
  const [solarDateStr, setSolarDateStr] = useState(
    initialEvent?.solarDate || initDate.toISOString().split('T')[0],
  );
  
  const [lunarDay, setLunarDay] = useState(
    initialEvent?.lunarDay ?? getLunarDate(initDate).day,
  );
  const [lunarMonth, setLunarMonth] = useState(
    initialEvent?.lunarMonth ?? getLunarDate(initDate).month,
  );
  const [isLeapMonth, setIsLeapMonth] = useState(initialEvent?.isLeapMonth || false);
  
  const [recurrence, setRecurrence] = useState<EventRecurrenceType>(
    initialEvent?.recurrence || (initialEvent?.category === 'dam_gio' ? 'yearly_lunar' : 'none'),
  );
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category || 'personal');
  const [emoji, setEmoji] = useState(initialEvent?.emoji || CATEGORY_META.personal.defaultEmoji);
  const [alarmOffset, setAlarmOffset] = useState<number>(
    initialEvent?.alarmOffsetsMinutes?.[0] ?? 60,
  );

  // Sync state whenever modal opens or initialEvent changes
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      setCalendarType(initialEvent.calendarType);
      setSolarDateStr(initialEvent.solarDate);
      const d = new Date(initialEvent.solarDate);
      const l = getLunarDate(d);
      setLunarDay(initialEvent.lunarDay ?? l.day);
      setLunarMonth(initialEvent.lunarMonth ?? l.month);
      setIsLeapMonth(initialEvent.isLeapMonth || false);
      setRecurrence(initialEvent.recurrence);
      setCategory(initialEvent.category);
      setEmoji(initialEvent.emoji || CATEGORY_META[initialEvent.category]?.defaultEmoji || '📅');
      setAlarmOffset(initialEvent.alarmOffsetsMinutes?.[0] ?? 60);
    } else {
      const base = defaultDate || new Date();
      setTitle('');
      setDescription('');
      setCalendarType('solar');
      setSolarDateStr(base.toISOString().split('T')[0]);
      const l = getLunarDate(base);
      setLunarDay(l.day);
      setLunarMonth(l.month);
      setIsLeapMonth(false);
      setRecurrence('none');
      setCategory('personal');
      setEmoji('📅');
      setAlarmOffset(60);
    }
  }, [initialEvent, defaultDate, isOpen]);

  // Derived Preview Information
  const computedPreview = useMemo(() => {
    if (calendarType === 'solar') {
      const parts = solarDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          const l = getLunarDate(d);
          const canChi = getCanChiDay(d);
          return {
            solarStr: formatSolarDateStr(d),
            lunarStr: `Ngày ${l.day}/${l.month}${l.isLeap ? ' nhuận' : ''} Âm lịch (${canChi})`,
            dateObj: d,
          };
        }
      }
    } else {
      const targetYear = new Date().getFullYear();
      const match = findSolarDateForLunar(lunarDay, lunarMonth, targetYear, isLeapMonth);
      if (match) {
        const canChi = getCanChiDay(match);
        return {
          solarStr: formatSolarDateStr(match),
          lunarStr: `Ngày ${lunarDay}/${lunarMonth}${isLeapMonth ? ' nhuận' : ''} Âm lịch (${canChi})`,
          dateObj: match,
        };
      }
    }
    return null;
  }, [calendarType, solarDateStr, lunarDay, lunarMonth, isLeapMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let targetSolarDate = solarDateStr;
    if (calendarType === 'lunar' && computedPreview?.dateObj) {
      targetSolarDate = computedPreview.dateObj.toISOString().split('T')[0];
    }

    const payload: CreateCalendarEventDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      calendarType,
      solarDate: targetSolarDate,
      lunarDay: calendarType === 'lunar' ? lunarDay : undefined,
      lunarMonth: calendarType === 'lunar' ? lunarMonth : undefined,
      isLeapMonth: calendarType === 'lunar' ? isLeapMonth : undefined,
      recurrence,
      category,
      emoji,
      alarmOffsetsMinutes: alarmOffset > 0 ? [alarmOffset] : [],
    };

    onSave(payload, initialEvent?.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="w-full max-w-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light/40 dark:border-border-dark/40 bg-surface-subtle-light dark:bg-surface-subtle-dark">
          <div className="flex items-center gap-2.5">
            <span className="text-xl select-none">{emoji}</span>
            <h2 id="event-modal-title" className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
              {initialEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện / Ngày giỗ mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark transition-colors spring-press cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
              Tên sự kiện / Ngày lễ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giỗ Cụ Cố, Sinh nhật Mẹ, Động thổ xây nhà..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 font-medium"
            />
          </div>

          {/* Calendar Type Toggle: Dương lịch vs Âm lịch */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
              Hệ thống lịch
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark/60">
              <button
                type="button"
                onClick={() => {
                  setCalendarType('solar');
                  if (recurrence === 'yearly_lunar' || recurrence === 'monthly_lunar') {
                    setRecurrence('yearly_solar');
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all spring-press cursor-pointer ${
                  calendarType === 'solar'
                    ? 'bg-purple text-white shadow-xs'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light'
                }`}
              >
                ☀️ Dương lịch
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalendarType('lunar');
                  if (recurrence === 'none' || recurrence === 'yearly_solar') {
                    setRecurrence('yearly_lunar');
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all spring-press cursor-pointer ${
                  calendarType === 'lunar'
                    ? 'bg-gold text-stone-950 font-bold shadow-xs'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light'
                }`}
              >
                🌙 Âm lịch (Giỗ chạp, Lễ tết)
              </button>
            </div>
          </div>

          {/* Date Selector */}
          {calendarType === 'solar' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
                Ngày Dương lịch
              </label>
              <input
                type="date"
                required
                value={solarDateStr}
                onChange={(e) => setSolarDateStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 font-sans"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Ngày & Tháng Âm lịch
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark mb-1 block">Ngày âm (1-30)</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={lunarDay}
                    onChange={(e) => setLunarDay(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-sm text-center font-bold"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark mb-1 block">Tháng âm (1-12)</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={lunarMonth}
                    onChange={(e) => setLunarMonth(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-sm text-center font-bold"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLeapMonth}
                      onChange={(e) => setIsLeapMonth(e.target.checked)}
                      className="rounded border-border-light text-purple focus:ring-purple"
                    />
                    <span>Tháng nhuận</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Computed Preview Pill */}
          {computedPreview && (
            <div className="p-3 rounded-2xl bg-gold/10 dark:bg-gold-dark/10 border border-gold/25 dark:border-gold-dark/25 text-xs space-y-1">
              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold dark:text-gold-dark shrink-0" />
                <span>Quy đổi: <strong>{computedPreview.solarStr}</strong></span>
              </p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark pl-5">
                {computedPreview.lunarStr}
              </p>
            </div>
          )}

          {/* Recurrence Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-purple" />
              <span>Quy luật lặp lại</span>
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as EventRecurrenceType)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 font-medium"
            >
              <option value="none">Không lặp lại (Chỉ một lần)</option>
              <option value="yearly_solar">Hàng năm theo Dương lịch (Sinh nhật, Kỷ niệm)</option>
              <option value="yearly_lunar">Hàng năm theo Âm lịch (Đám Giỗ, Ngày mất, Lễ họ)</option>
              <option value="monthly_lunar">Rằm & Mùng 1 hàng tháng (Thắp hương Âm lịch)</option>
              <option value="monthly_solar">Hàng tháng theo ngày Dương lịch</option>
              <option value="weekly">Hàng tuần</option>
              <option value="daily">Hàng ngày</option>
            </select>
          </div>

          {/* Category & Emoji Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold" />
                <span>Danh mục</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as EventCategory;
                  setCategory(cat);
                  if (!initialEvent) {
                    setEmoji(CATEGORY_META[cat]?.defaultEmoji || '📅');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 font-medium"
              >
                <option value="personal">👤 Cá nhân</option>
                <option value="dam_gio">🕯️ Đám giỗ</option>
                <option value="memorial">🎂 Kỷ niệm / Sinh nhật</option>
                <option value="family">🏡 Gia đình</option>
                <option value="ritual">🌸 Cúng lễ / Tâm linh</option>
                <option value="work">💼 Công việc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
                Biểu tượng (Emoji)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COMMON_EMOJIS.slice(0, 7).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-transform spring-press cursor-pointer ${
                      emoji === em
                        ? 'bg-purple/20 ring-2 ring-purple scale-110'
                        : 'bg-surface-subtle-light dark:bg-surface-elevated-dark hover:bg-surface-container-low'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reminder / Notification */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Nhắc nhở trước</span>
            </label>
            <select
              value={alarmOffset}
              onChange={(e) => setAlarmOffset(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 font-medium"
            >
              <option value={0}>Đúng ngày diễn ra</option>
              <option value={60}>Trước 1 tiếng</option>
              <option value={1440}>Trước 1 ngày (Khuyên dùng cho Giỗ chạp)</option>
              <option value={4320}>Trước 3 ngày</option>
              <option value={10080}>Trước 1 tuần</option>
            </select>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chuẩn bị lễ vật, danh sách khách mời, việc cần làm..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 resize-none font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border-light/40 dark:border-border-dark/40 flex items-center justify-between gap-3">
            {initialEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
                    onDelete(initialEvent.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors spring-press cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa sự kiện</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light text-xs font-semibold transition-colors spring-press cursor-pointer"
              >
                Hủy bỏ
              </button>
              <ActionButton type="submit" className="px-5 py-2.5 text-xs font-bold">
                {initialEvent ? 'Lưu thay đổi' : 'Tạo sự kiện'}
              </ActionButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
