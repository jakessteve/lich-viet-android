import React, { Suspense, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Globe, Heart } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingState, SubNavTabs, type SubNavTabItem } from '../shared';
import { MotionPageTransition } from '@/components/ui/motion-primitives';

const WesternAstrologyPage = React.lazy(() => import('./Western/WesternAstrologyPage'));
const VedicAstrologyPage = React.lazy(() => import('./Vedic/VedicAstrologyPage'));
const SynastryPage = React.lazy(() => import('./Synastry/SynastryPage'));

type AstrologySubTab = 'tay-phuong' | 'vedic' | 'hop-la';

const ASTROLOGY_TABS: readonly SubNavTabItem<AstrologySubTab>[] = [
  {
    id: 'tay-phuong',
    label: 'Tây Phương',
    icon: <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />,
  },
  {
    id: 'vedic',
    label: 'Vệ Đà (Jyotish)',
    icon: <Globe className="h-4 w-4 text-purple-500 dark:text-purple-400" />,
  },
  {
    id: 'hop-la',
    label: 'Hợp Lá Số',
    icon: <Heart className="h-4 w-4 text-rose-500 dark:text-rose-400" />,
  },
];

export default function ChiemTinhPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const handleTabChange = (tab: AstrologySubTab) => {
    if (location.pathname.startsWith('/chiem-tinh/')) {
      navigate(`/chiem-tinh/${tab}`);
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'tay-phuong') {
          next.delete('sub');
        } else {
          next.set('sub', tab);
        }
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Subtab Segmented Control */}
      <div className="flex items-center justify-center">
        <SubNavTabs
          tabs={ASTROLOGY_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

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
