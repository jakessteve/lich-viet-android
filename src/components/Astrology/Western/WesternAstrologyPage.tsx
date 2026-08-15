import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { SegmentedControl } from '../../shared';
import { WesternChartView } from './WesternChartView';
import { ForecastView } from './ForecastView';

const PAGE_TABS = [
  { id: 'la-so', label: 'Lá Số Gốc', icon: 'person', shortLabel: 'Lá Số' },
  { id: 'van-han', label: 'Vận Hạn', icon: 'wb_twilight', shortLabel: 'Vận Hạn' },
] as const;

type PageTab = (typeof PAGE_TABS)[number]['id'];

export const WesternAstrologyPage: React.FC = () => {
  usePageTitle('Chiêm Tinh Tây Phương');
  const navigate = useNavigate();
  const prefilled = useRef(false);
  const [pageTab, setPageTab] = useState<PageTab>('la-so');

  const user = useAuthStore((s) => s.user);
  const setWesternInput = useAstrologyStore((s) => s.setWesternInput);

  useEffect(() => {
    if (prefilled.current || !user) return;
    const profile = getUserBirthProfile(user);
    if (profile?.birthYear && profile?.birthMonth && profile?.birthDay) {
      const birthDate = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay,
        profile.birthHour ?? 12, profile.birthMinute ?? 0);
      setWesternInput({
        birthDate,
        birthHour: profile.birthHour ?? 12,
        birthMinute: profile.birthMinute ?? 0,
        latitude: profile.birthLocation?.lat ?? 21.0285,
        longitude: profile.birthLocation?.lng ?? 105.8542,
        timezone: profile.birthLocation?.timezone ?? 7,
        locationName: profile.birthLocation?.locationName ?? undefined,
        countryCode: profile.birthLocation?.countryCode ?? undefined,
        countryName: profile.birthLocation?.countryName ?? undefined,
      });
      prefilled.current = true;
    }
  }, [user, setWesternInput]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <span className="material-icons-round text-xl text-indigo-500 dark:text-indigo-400">auto_graph</span>
          Chiêm Tinh Tây Phương
        </h2>
      </div>

      <SegmentedControl
        options={PAGE_TABS}
        value={pageTab}
        onChange={setPageTab}
        ariaLabel="Chế độ chiêm tinh tây phương"
        tone="indigo"
      />

      {pageTab === 'la-so' && <WesternChartView />}
      {pageTab === 'van-han' && <ForecastView />}

      <div className="surface-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm">
        <span className="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1 font-medium">
          <span className="material-icons-round text-base text-amber-500">sync_alt</span>
          Xem cùng thời điểm sinh ở hệ thống khác:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/app/tu-vi')}
            className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
          >
            <span className="material-icons-round text-sm">auto_awesome</span>
            Lá Số Tử Vi
          </button>
          <button
            onClick={() => navigate('/app/chiem-tinh/vedic')}
            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
          >
            <span className="material-icons-round text-sm">bubble_chart</span>
            Chiêm Tinh Ấn Độ
          </button>
          <button
            onClick={() => navigate('/app/chiem-tinh/hop-la')}
            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
          >
            <span className="material-icons-round text-sm">favorite</span>
            Hợp Lá Số
          </button>
        </div>
      </div>
    </div>
  );
};

export default WesternAstrologyPage;
