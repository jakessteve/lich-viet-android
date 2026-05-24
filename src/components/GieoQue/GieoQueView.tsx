/**
 * GieoQueView — Method Selector for Gieo Quẻ Tab
 *
 * Wraps Mai Hoa and Tam Thức views with a segmented control
 * for switching between divination methods.
 *
 * Reads ?method=tam-thuc URL param for deep-linking.
 */

import React, { Suspense } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { LoadingState, SegmentedControl, type SegmentedOption } from '../shared';

// Lazy-load the sub-views
const MaiHoaView = React.lazy(() => import('../MaiHoa/MaiHoaView'));
const TamThucView = React.lazy(() => import('../TamThuc/TamThucView'));

type DivinationMethod = 'mai-hoa' | 'tam-thuc';

const METHODS: readonly SegmentedOption<DivinationMethod>[] = [
  { id: 'mai-hoa', label: 'Mai Hoa Dịch Số', icon: 'local_florist', shortLabel: 'Mai Hoa' },
  { id: 'tam-thuc', label: 'Tam Thức', icon: 'brightness_3', shortLabel: 'Tam Thức' },
];

export default function GieoQueView() {
  usePageTitle('Gieo Quẻ');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = useAppStore((s) => s.selectedDate);

  // URL is the single source of truth — no local state, no sync loops
  const activeMethod: DivinationMethod = searchParams.get('method') === 'tam-thuc' ? 'tam-thuc' : 'mai-hoa';

  const handleMethodChange = (method: DivinationMethod) => {
    if (method === 'tam-thuc') {
      setSearchParams({ method: 'tam-thuc' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="space-y-5">
      <SegmentedControl
        options={METHODS}
        value={activeMethod}
        onChange={handleMethodChange}
        ariaLabel="Phương pháp gieo quẻ"
        tone="purple"
      />

      {/* Active Method View */}
      <Suspense fallback={<LoadingState />}>
        {activeMethod === 'mai-hoa' ? (
          <MaiHoaView selectedDate={selectedDate} />
        ) : (
          <TamThucView selectedDate={selectedDate} />
        )}
      </Suspense>
    </div>
  );
}
