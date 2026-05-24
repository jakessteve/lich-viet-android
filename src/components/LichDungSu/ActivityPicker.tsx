/**
 * ActivityPicker — Colorful category icons with inline expand
 * Click a category to reveal activities below. Click an activity to highlight it as selected.
 * All categories remain visible. Single-click workflow — no additional navigation.
 * Includes a search bar (U2) for quick activity lookup.
 * Shows Nghi/Kỵ indicators per activity based on daily engine data.
 */

import React, { useState, useMemo } from 'react';
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
    icon: 'text-blue-500',
    ring: 'ring-blue-400/30',
    bg: 'bg-blue-50 dark:bg-blue-900/15',
    pillBg: 'bg-blue-100 dark:bg-blue-900/25',
    pillText: 'text-blue-700 dark:text-blue-300',
  },
  pink: {
    icon: 'text-pink-500',
    ring: 'ring-pink-400/30',
    bg: 'bg-pink-50 dark:bg-pink-900/15',
    pillBg: 'bg-pink-100 dark:bg-pink-900/25',
    pillText: 'text-pink-700 dark:text-pink-300',
  },
  amber: {
    icon: 'text-amber-500',
    ring: 'ring-amber-400/30',
    bg: 'bg-amber-50 dark:bg-amber-900/15',
    pillBg: 'bg-amber-100 dark:bg-amber-900/25',
    pillText: 'text-amber-700 dark:text-amber-300',
  },
  cyan: {
    icon: 'text-cyan-500',
    ring: 'ring-cyan-400/30',
    bg: 'bg-cyan-50 dark:bg-cyan-900/15',
    pillBg: 'bg-cyan-100 dark:bg-cyan-900/25',
    pillText: 'text-cyan-700 dark:text-cyan-300',
  },
  purple: {
    icon: 'text-purple-500',
    ring: 'ring-purple-400/30',
    bg: 'bg-purple-50 dark:bg-purple-900/15',
    pillBg: 'bg-purple-100 dark:bg-purple-900/25',
    pillText: 'text-purple-700 dark:text-purple-300',
  },
  emerald: {
    icon: 'text-emerald-500',
    ring: 'ring-emerald-400/30',
    bg: 'bg-emerald-50 dark:bg-emerald-900/15',
    pillBg: 'bg-emerald-100 dark:bg-emerald-900/25',
    pillText: 'text-emerald-700 dark:text-emerald-300',
  },
  green: {
    icon: 'text-green-500',
    ring: 'ring-green-400/30',
    bg: 'bg-green-50 dark:bg-green-900/15',
    pillBg: 'bg-green-100 dark:bg-green-900/25',
    pillText: 'text-green-700 dark:text-green-300',
  },
  indigo: {
    icon: 'text-indigo-500',
    ring: 'ring-indigo-400/30',
    bg: 'bg-indigo-50 dark:bg-indigo-900/15',
    pillBg: 'bg-indigo-100 dark:bg-indigo-900/25',
    pillText: 'text-indigo-700 dark:text-indigo-300',
  },
  teal: {
    icon: 'text-teal-500',
    ring: 'ring-teal-400/30',
    bg: 'bg-teal-50 dark:bg-teal-900/15',
    pillBg: 'bg-teal-100 dark:bg-teal-900/25',
    pillText: 'text-teal-700 dark:text-teal-300',
  },
  gray: {
    icon: 'text-gray-500',
    ring: 'ring-gray-400/30',
    bg: 'bg-gray-50 dark:bg-gray-800/20',
    pillBg: 'bg-gray-200 dark:bg-gray-700/40',
    pillText: 'text-gray-700 dark:text-gray-300',
  },
  rose: {
    icon: 'text-rose-500',
    ring: 'ring-rose-400/30',
    bg: 'bg-rose-50 dark:bg-rose-900/15',
    pillBg: 'bg-rose-100 dark:bg-rose-900/25',
    pillText: 'text-rose-700 dark:text-rose-300',
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
              ? `bg-white/70 dark:bg-white/8 text-text-primary-light dark:text-text-primary-dark hover:bg-white dark:hover:bg-white/12 border border-black/5 dark:border-white/10 ${indicator.pillExtra}`
              : 'bg-white/70 dark:bg-white/8 text-text-primary-light dark:text-text-primary-dark hover:bg-white dark:hover:bg-white/12 border border-black/5 dark:border-white/10'
        }`}
      >
        {indicator && (
          <span className={`material-icons-round text-sm ${indicator.iconClass}`} style={{ fontSize: '14px' }}>
            {indicator.icon}
          </span>
        )}
        {activity.nameVi}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm việc cần làm..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/8 border border-black/5 dark:border-white/10 text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60 focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-gold-dark/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
          >
            close
          </button>
        )}
      </div>

      {/* Search results */}
      {searchQuery.trim() && (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/20 border border-black/5 dark:border-white/10 animate-fade-scale">
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
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Category badge — Nghi/Kỵ counts */}
                  {counts && (counts.nghi > 0 || counts.ky > 0) && (
                    <span className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-black/5 dark:border-white/10">
                      {counts.nghi > 0 && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{counts.nghi}✓</span>
                      )}
                      {counts.nghi > 0 && counts.ky > 0 && (
                        <span className="text-[10px] text-gray-300 dark:text-gray-600">|</span>
                      )}
                      {counts.ky > 0 && (
                        <span className="text-xs font-bold text-red-500 dark:text-red-400">{counts.ky}✗</span>
                      )}
                    </span>
                  )}
                  <span className={`material-icons-round text-2xl transition-colors duration-200 ${colors.icon}`}>
                    {cat.icon}
                  </span>
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
