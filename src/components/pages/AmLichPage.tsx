/**
 * AmLichPage — Main Âm Lịch daily details view.
 */

import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAppStore } from '@/stores/appStore';
import DetailedDayView from '../DetailedDayView';

export default function AmLichPage() {
  usePageTitle('Âm Lịch');
  const selectedDate = useAppStore((s) => s.selectedDate);
  const data = useAppStore((s) => s.dayData);

  return (
    <div className="space-y-4">
      <DetailedDayView date={selectedDate} data={data} />
    </div>
  );
}
