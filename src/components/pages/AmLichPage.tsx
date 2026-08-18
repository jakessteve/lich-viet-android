/**
 * AmLichPage — Tabbed container for Âm Lịch and Dụng Sự.
 *
 * Consolidates three previously separate nav items into one page
 * with sub-tab pill navigation.
 */

import React, { useState, Suspense } from 'react';
import { Calendar, CalendarCheck } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAppStore } from '@/stores/appStore';
import DetailedDayView from '../DetailedDayView';
import { LoadingState, SegmentedControl, type SegmentedOption } from '../shared';
import { MotionPageTransition } from '@/components/ui/motion-primitives';

// Lazy-load heavier modules
const DungSuView = React.lazy(() => import('../LichDungSu/DungSuView'));

type SubTab = 'am-lich' | 'dung-su';

const SUB_TABS: readonly SegmentedOption<SubTab>[] = [
  {
    id: 'am-lich',
    label: 'Lịch Ngày',
    icon: (<Calendar className="h-4 w-4" />) as unknown as string,
    shortLabel: 'Lịch Ngày',
  },
  {
    id: 'dung-su',
    label: 'Dụng Sự Ngày',
    icon: (<CalendarCheck className="h-4 w-4" />) as unknown as string,
    shortLabel: 'Dụng Sự',
  },
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
      <MotionPageTransition key={activeTab}>
        {activeTab === 'am-lich' && <DetailedDayView date={selectedDate} data={data} />}
        {activeTab === 'dung-su' && (
          <Suspense fallback={<LoadingState />}>
            <DungSuView selectedDate={selectedDate} data={data} onSelectDate={setSelectedDate} />
          </Suspense>
        )}
      </MotionPageTransition>
    </div>
  );
}
