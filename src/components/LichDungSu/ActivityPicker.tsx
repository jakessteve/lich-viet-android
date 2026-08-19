/**
 * ActivityPicker — Colorful category icons with inline expand
 * Click a category to reveal activities below. Click an activity to highlight it as selected.
 * All categories remain visible. Single-click workflow — no additional navigation.
 * Includes a search bar (U2) for quick activity lookup.
 * Shows Nghi/Kỵ indicators per activity based on daily engine data.
 */

import React, { useState, useMemo } from 'react';
import { Search, X, CheckCircle2, XCircle } from 'lucide-react';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import {
  CATEGORIES,
  getActivitiesByCategory,
  searchActivities,
  getActivityById,
  type ActivityEntry,
  type ActivityCategory,
} from '@lich-viet/core/dungsu';
import type { FAQIntent } from './FAQIntentCards';

interface ActivityPickerProps {
  selectedActivity: string | null;
  onSelectActivity: (activityId: string) => void;
  suitableActivities?: Set<string>;
  unsuitableActivities?: Set<string>;
  filterByIntent?: FAQIntent | null;
}

const CAT_COLORS: Record<string, { icon: string; ring: string; bg: string; pillBg: string; pillText: string }> = {
  blue: {
    icon: 'text-info dark:text-info-dark',
    ring: 'ring-info/30 dark:ring-info-dark/30',
    bg: 'bg-info/10 dark:bg-info/15',
    pillBg: 'bg-info/15 dark:bg-info/25',
    pillText: 'text-info dark:text-info-dark',
  },
  pink: {
    icon: 'text-rose-500 dark:text-rose-400',
    ring: 'ring-rose-400/30 dark:ring-rose-500/30',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    pillBg: 'bg-rose-500/15 dark:bg-rose-500/25',
    pillText: 'text-rose-600 dark:text-rose-300',
  },
  amber: {
    icon: 'text-gold dark:text-gold-dark',
    ring: 'ring-gold/30 dark:ring-gold-dark/30',
    bg: 'bg-gold/10 dark:bg-gold-dark/15',
    pillBg: 'bg-gold/15 dark:bg-gold-dark/25',
    pillText: 'text-gold dark:text-gold-dark',
  },
  cyan: {
    icon: 'text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-400/30 dark:ring-cyan-500/30',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    pillBg: 'bg-cyan-500/15 dark:bg-cyan-500/25',
    pillText: 'text-cyan-700 dark:text-cyan-300',
  },
  purple: {
    icon: 'text-purple dark:text-purple-dark',
    ring: 'ring-purple/30 dark:ring-purple-dark/30',
    bg: 'bg-purple/10 dark:bg-purple-dark/15',
    pillBg: 'bg-purple/15 dark:bg-purple-dark/25',
    pillText: 'text-purple dark:text-purple-dark',
  },
  emerald: {
    icon: 'text-good dark:text-good-dark',
    ring: 'ring-good/30 dark:ring-good-dark/30',
    bg: 'bg-good/10 dark:bg-good-dark/15',
    pillBg: 'bg-good/15 dark:bg-good-dark/25',
    pillText: 'text-good dark:text-good-dark',
  },
  green: {
    icon: 'text-good dark:text-good-dark',
    ring: 'ring-good/30 dark:ring-good-dark/30',
    bg: 'bg-good/10 dark:bg-good-dark/15',
    pillBg: 'bg-good/15 dark:bg-good-dark/25',
    pillText: 'text-good dark:text-good-dark',
  },
  indigo: {
    icon: 'text-primary dark:text-primary-dark',
    ring: 'ring-primary/30 dark:ring-primary-dark/30',
    bg: 'bg-primary/10 dark:bg-primary-dark/15',
    pillBg: 'bg-primary/15 dark:bg-primary-dark/25',
    pillText: 'text-primary dark:text-primary-dark',
  },
  teal: {
    icon: 'text-teal-600 dark:text-teal-400',
    ring: 'ring-teal-400/30 dark:ring-teal-500/30',
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    pillBg: 'bg-teal-500/15 dark:bg-teal-500/25',
    pillText: 'text-teal-700 dark:text-teal-300',
  },
  gray: {
    icon: 'text-text-secondary-light dark:text-text-secondary-dark',
    ring: 'ring-border-light dark:ring-border-dark',
    bg: 'bg-surface-subtle-light dark:bg-surface-subtle-dark',
    pillBg: 'bg-surface-subtle-light dark:bg-surface-elevated-dark',
    pillText: 'text-text-secondary-light dark:text-text-secondary-dark',
  },
  rose: {
    icon: 'text-rose-500 dark:text-rose-400',
    ring: 'ring-rose-400/30 dark:ring-rose-500/30',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    pillBg: 'bg-rose-500/15 dark:bg-rose-500/25',
    pillText: 'text-rose-600 dark:text-rose-300',
  },
};

/** Get Nghi/Kỵ CSS classes and icon for an activity */
function getDungSuIndicator(activityId: string, suitable?: Set<string>, unsuitable?: Set<string>) {
  const isSuitable = suitable?.has(activityId);
  const isUnsuitable = unsuitable?.has(activityId);

  if (isSuitable)
    return {
      dotClass: 'bg-emerald-500',
      pillExtra: 'ring-1 ring-emerald-300/40 dark:ring-emerald-600/30',
      icon: 'check_circle',
      iconClass: 'text-emerald-500 dark:text-emerald-400',
      label: 'Nghi',
    };
  if (isUnsuitable)
    return {
      dotClass: 'bg-red-500',
      pillExtra: 'ring-1 ring-red-300/40 dark:ring-red-600/30',
      icon: 'cancel',
      iconClass: 'text-red-500 dark:text-red-400',
      label: 'Kỵ',
    };
  return null;
}

/** Map FAQ intent → relevant activity categories */
const INTENT_CATEGORY_MAP: Partial<Record<FAQIntent, ActivityCategory[]>> = {
  'chon-ngay-cuoi': ['hon-nhan'],
  'tang-le': ['tam-linh', 'le-nghi'],
  'nha-cua': ['nha-cua'],
  'tai-chinh': ['tai-chinh'],
  'cong-viec': ['cong-viec'],
  // 'xem-ngay' → null (show all)
};

const ActivityPicker: React.FC<ActivityPickerProps> = ({
  selectedActivity,
  onSelectActivity,
  suitableActivities,
  unsuitableActivities,
  filterByIntent,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<ActivityCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedActivityData = useMemo(() => {
    if (!selectedActivity) return null;
    return getActivityById(selectedActivity);
  }, [selectedActivity]);

  const searchResults = useMemo(() => {
    return searchActivities(searchQuery);
  }, [searchQuery]);

  // Per-category Nghi/Kỵ counts for badges
  const categoryCounts = useMemo(() => {
    const counts = new Map<ActivityCategory, { nghi: number; ky: number }>();
    for (const cat of CATEGORIES) {
      const activities = getActivitiesByCategory(cat.id);
      let nghi = 0,
        ky = 0;
      for (const a of activities) {
        if (suitableActivities?.has(a.id)) nghi++;
        if (unsuitableActivities?.has(a.id)) ky++;
      }
      counts.set(cat.id, { nghi, ky });
    }
    return counts;
  }, [suitableActivities, unsuitableActivities]);

  // Categories are always fully visible now; no filtering.
  const filteredCategories = CATEGORIES;

  // Auto-expand first relevant category based on intent
  React.useEffect(() => {
    if (filterByIntent) {
      const allowedCats = INTENT_CATEGORY_MAP[filterByIntent];
      if (allowedCats && allowedCats.length > 0) {
        setExpandedCategory(allowedCats[0]);
      }
    }
  }, [filterByIntent]);

  const handleCategoryClick = (catId: ActivityCategory) => {
    setExpandedCategory((prev) => (prev === catId ? null : catId));
    setSearchQuery(''); // Clear search when browsing categories
  };

  const handleActivityClick = (activity: ActivityEntry) => {
    if (selectedActivity === activity.id) {
      onSelectActivity('');
    } else {
      onSelectActivity(activity.id);
    }
    setSearchQuery('');
  };

  const renderActivityPill = (activity: ActivityEntry, colors: (typeof CAT_COLORS)[string]) => {
    const isSelected = selectedActivity === activity.id;
    const indicator = getDungSuIndicator(activity.id, suitableActivities, unsuitableActivities);

    return (
      <button
        key={activity.id}
        onClick={() => handleActivityClick(activity)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          isSelected
            ? `${colors.pillBg} ${colors.pillText} ring-2 ${colors.ring} shadow-sm`
            : indicator
              ? `bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark border border-border-light/60 dark:border-border-dark/60 ${indicator.pillExtra}`
              : 'bg-surface-subtle-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark border border-border-light/60 dark:border-border-dark/60'
        }`}
      >
        {indicator && (
          indicator.icon === 'check_circle' ? (
            <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${indicator.iconClass}`} />
          ) : (
            <XCircle className={`h-3.5 w-3.5 shrink-0 ${indicator.iconClass}`} />
          )
        )}
        {activity.nameVi}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary-light/60 dark:text-text-secondary-dark/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm việc cần làm..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60 focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-gold-dark/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchQuery.trim() && (
        <div className="p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/60 dark:border-border-dark/60 animate-fade-scale">
          {searchResults.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchResults.map((activity) => {
                const catInfo = CATEGORIES.find((c) => c.id === activity.category);
                const colors = CAT_COLORS[catInfo?.color || 'gray'];
                return renderActivityPill(activity, colors);
              })}
            </div>
          ) : (
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark text-center py-2">
              Không tìm thấy "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {/* Category icon grid — always visible */}
      {!searchQuery.trim() && (
        <>
          <div className="grid grid-cols-4 gap-2.5">
            {filteredCategories.map((cat) => {
              const isExpanded = expandedCategory === cat.id;
              const colors = CAT_COLORS[cat.color];
              const hasSelectedChild = selectedActivityData?.category === cat.id;
              const counts = categoryCounts.get(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 ${
                    isExpanded
                      ? `${colors.bg} ring-1 ${colors.ring} scale-[0.97]`
                      : hasSelectedChild
                        ? `${colors.bg} ring-1 ${colors.ring}`
                        : 'hover:bg-surface-subtle-light/60 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Category badge — Nghi/Kỵ counts */}
                  {counts && (counts.nghi > 0 || counts.ky > 0) && (
                    <span className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-surface-light dark:bg-surface-elevated-dark shadow-sm border border-border-light/60 dark:border-border-dark/60">
                      {counts.nghi > 0 && (
                        <span className="text-xs font-bold text-good dark:text-good-dark">{counts.nghi}✓</span>
                      )}
                      {counts.nghi > 0 && counts.ky > 0 && (
                        <span className="text-[10px] text-border-light dark:text-border-dark">|</span>
                      )}
                      {counts.ky > 0 && (
                        <span className="text-xs font-bold text-bad dark:text-bad-dark">{counts.ky}✗</span>
                      )}
                    </span>
                  )}
                  <div className={`transition-colors duration-200 ${colors.icon}`}>
                    {renderDynamicIcon(cat.icon, 'h-6 w-6')}
                  </div>
                  <span
                    className={`text-sm font-medium leading-tight text-center transition-colors duration-200 ${
                      isExpanded || hasSelectedChild
                        ? 'text-text-primary-light dark:text-text-primary-dark'
                        : 'text-text-secondary-light dark:text-text-secondary-dark'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded sub-activities — smooth reveal */}
          {expandedCategory &&
            (() => {
              const cat = CATEGORIES.find((c) => c.id === expandedCategory);
              const colors = CAT_COLORS[cat?.color || 'gray'];
              const activities = getActivitiesByCategory(expandedCategory);

              return (
                <div
                  key={expandedCategory}
                  className={`p-3 rounded-xl border ${colors.bg} border-opacity-50 border-transparent animate-fade-scale`}
                  style={{ borderColor: 'var(--border-light, rgba(0,0,0,0.06))' }}
                >
                  <div className="flex flex-wrap gap-2">
                    {activities.map((activity) => renderActivityPill(activity, colors))}
                  </div>
                </div>
              );
            })()}
        </>
      )}
    </div>
  );
};

export default ActivityPicker;
