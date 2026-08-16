import React, { Suspense, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingState } from '../shared';
import { MotionPageTransition } from '@/components/ui/motion-primitives';

const WesternAstrologyPage = React.lazy(() => import('./Western/WesternAstrologyPage'));
const VedicAstrologyPage = React.lazy(() => import('./Vedic/VedicAstrologyPage'));
const SynastryPage = React.lazy(() => import('./Synastry/SynastryPage'));

type AstrologySubTab = 'tay-phuong' | 'vedic' | 'hop-la';

export default function ChiemTinhPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine active tab from URL path or query param
  const activeTab: AstrologySubTab = useMemo(() => {
    if (location.pathname.includes('/chiem-tinh/vedic')) return 'vedic';
    if (location.pathname.includes('/chiem-tinh/hop-la')) return 'hop-la';
    if (location.pathname.includes('/chiem-tinh/tay-phuong')) return 'tay-phuong';

    const sub = searchParams.get('sub');
    if (sub === 'vedic' || sub === 'hop-la') return sub;
    return 'tay-phuong';
  }, [location.pathname, searchParams]);

  usePageTitle(
    activeTab === 'vedic' ? 'Chiêm Tinh Ấn Độ' : activeTab === 'hop-la' ? 'Hợp Lá Số' : 'Chiêm Tinh Tây Phương',
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Subtab View without top bar menu */}
      <Suspense fallback={<LoadingState />}>
        <MotionPageTransition key={activeTab}>
          {activeTab === 'tay-phuong' && <WesternAstrologyPage />}
          {activeTab === 'vedic' && <VedicAstrologyPage />}
          {activeTab === 'hop-la' && <SynastryPage />}
        </MotionPageTransition>
      </Suspense>
    </div>
  );
}
