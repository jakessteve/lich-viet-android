/**
 * AmLichPage — Tabbed container for Âm Lịch and Dụng Sự.
 *
 * Consolidates three previously separate nav items into one page
 * with sub-tab pill navigation.
 */

import React, { useState, Suspense } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAppStore } from '@/stores/appStore';
import DetailedDayView from '../DetailedDayView';
import { LoadingState, SegmentedControl, type SegmentedOption } from '../shared';

// Lazy-load heavier modules
const DungSuView = React.lazy(() => import('../LichDungSu/DungSuView'));

type SubTab = 'am-lich' | 'dung-su';

const SUB_TABS: readonly SegmentedOption<SubTab>[] = [
  { id: 'am-lich', label: 'Âm Lịch', icon: 'calendar_month', shortLabel: 'Âm Lịch' },
  { id: 'dung-su', label: 'Dụng Sự', icon: 'event_available', shortLabel: 'Dụng Sự' },
];

export default function AmLichPage() {
  usePageTitle('Âm Lịch');
  const [activeTab, setActiveTab] = useState<SubTab>('am-lich');
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const data = useAppStore((s) => s.dayData);

  return (
    <div className="space-y-4">
      <SegmentedControl options={SUB_TABS} value={activeTab} onChange={setActiveTab} ariaLabel="Chức năng Âm Lịch" />

      {/* Tab content */}
      <div className="animate-fade-scale">
        {activeTab === 'am-lich' && <DetailedDayView date={selectedDate} data={data} />}
        {activeTab === 'dung-su' && (
          <Suspense fallback={<LoadingState />}>
            <DungSuView selectedDate={selectedDate} data={data} onSelectDate={setSelectedDate} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
