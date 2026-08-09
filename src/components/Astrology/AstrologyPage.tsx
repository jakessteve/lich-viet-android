import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore, type AstrologyTab } from '../../stores/astrologyStore';
import { SegmentedControl, type SegmentedOption } from '../shared';

// Subviews
import { WesternChartView } from './Western/WesternChartView';
import { VedicChartView } from './Vedic/VedicChartView';
import { SynastryView } from './Synastry/SynastryView';

const TAB_OPTIONS: readonly SegmentedOption<AstrologyTab>[] = [
  { id: 'tay-phuong', label: 'Tây Phương', icon: 'auto_graph' },
  { id: 'vedic', label: 'Ấn Độ (Vedic)', icon: 'bubble_chart' },
  { id: 'hop-la', label: 'Hợp Lá Số', icon: 'favorite' },
];

export const AstrologyPage: React.FC = () => {
  usePageTitle('Chiêm Tinh');
  const navigate = useNavigate();
  const location = useLocation();

  const { activeSubTab, setSubTab } = useAstrologyStore(
    useShallow((state) => ({
      activeSubTab: state.activeSubTab,
      setSubTab: state.setSubTab,
    })),
  );

  // Sync URL ?tab= params with the store
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as AstrologyTab;
    if (tabParam && ['tay-phuong', 'vedic', 'hop-la'].includes(tabParam) && tabParam !== activeSubTab) {
      setSubTab(tabParam);
    }
  }, [location.search, activeSubTab, setSubTab]);

  const handleTabChange = (tab: AstrologyTab) => {
    setSubTab(tab);
    navigate(`/app/chiem-tinh?tab=${tab}`, { replace: true });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <span className="material-icons-round text-xl text-indigo-500 dark:text-indigo-400">public</span>
          Chiêm Tinh Đa Hệ
        </h2>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex justify-center">
        <SegmentedControl
          options={TAB_OPTIONS}
          value={activeSubTab}
          onChange={handleTabChange}
          ariaLabel="Hệ Chiêm Tinh"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Content Area */}
      <div className="mt-4 animate-fade-scale">
        {activeSubTab === 'tay-phuong' && <WesternChartView />}
        {activeSubTab === 'vedic' && <VedicChartView />}
        {activeSubTab === 'hop-la' && <SynastryView />}
      </div>
    </div>
  );
};

export default AstrologyPage;
