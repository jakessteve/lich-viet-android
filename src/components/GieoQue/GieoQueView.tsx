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
import { LoadingState } from '../shared';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MotionFadeIn } from '@/components/ui/motion-primitives';
import { Flower2, Moon } from 'lucide-react';

// Lazy-load the sub-views
const MaiHoaView = React.lazy(() => import('../MaiHoa/MaiHoaView'));
const TamThucView = React.lazy(() => import('../TamThuc/TamThucView'));

type DivinationMethod = 'mai-hoa' | 'tam-thuc';

export default function GieoQueView() {
  usePageTitle('Gieo Quẻ');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = useAppStore((s) => s.selectedDate);

  // URL is the single source of truth — no local state, no sync loops
  const activeMethod: DivinationMethod = searchParams.get('method') === 'tam-thuc' ? 'tam-thuc' : 'mai-hoa';

  const handleMethodChange = (method: string) => {
    if (method === 'tam-thuc') {
      setSearchParams({ method: 'tam-thuc' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <MotionFadeIn className="space-y-5">
      <Tabs value={activeMethod} onValueChange={handleMethodChange} className="w-full">
        <TabsList className="w-full justify-start p-1.5 gap-1.5">
          <TabsTrigger value="mai-hoa" tone="purple" className="flex-1 gap-2">
            <Flower2 className="h-4 w-4" />
            <span className="hidden sm:inline">Mai Hoa Dịch Số</span>
            <span className="sm:hidden text-xs">Mai Hoa</span>
          </TabsTrigger>
          <TabsTrigger value="tam-thuc" tone="purple" className="flex-1 gap-2">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Tam Thức</span>
            <span className="sm:hidden text-xs">Tam Thức</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Active Method View */}
      <Suspense fallback={<LoadingState />}>
        {activeMethod === 'mai-hoa' ? (
          <MaiHoaView selectedDate={selectedDate} />
        ) : (
          <TamThucView selectedDate={selectedDate} />
        )}
      </Suspense>
    </MotionFadeIn>
  );
}
