import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAppStore, parseIsoDate } from '@/stores/appStore';
import DetailedDayView from '../DetailedDayView';
import { OnboardingTour } from '@/components/shared';

export default function AmLichPage() {
  usePageTitle('Âm Lịch');
  const [searchParams] = useSearchParams();
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const data = useAppStore((s) => s.dayData);

  useEffect(() => {
    const rawDate = searchParams.get('date') || searchParams.get('d');
    if (!rawDate) return;
    const parsed = parseIsoDate(rawDate);
    if (
      parsed &&
      (parsed.getFullYear() !== selectedDate.getFullYear() ||
        parsed.getMonth() !== selectedDate.getMonth() ||
        parsed.getDate() !== selectedDate.getDate())
    ) {
      setSelectedDate(parsed);
    }
  }, [searchParams, selectedDate, setSelectedDate]);

  return (
    <div className="space-y-4">
      <DetailedDayView date={selectedDate} data={data} />
      <OnboardingTour />
    </div>
  );
}

