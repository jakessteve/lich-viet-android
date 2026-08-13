import React, { useEffect, useRef, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { SegmentedControl } from '../../shared';
import { WesternChartView } from './WesternChartView';
import { ForecastView } from './ForecastView';
import { WesternMarkdownExport } from '../WesternMarkdownExport';

const PAGE_TABS = [
  { id: 'la-so', label: 'Lá Số Gốc', icon: 'person', shortLabel: 'Lá Số' },
  { id: 'van-han', label: 'Vận Hạn', icon: 'wb_twilight', shortLabel: 'Vận Hạn' },
] as const;

type PageTab = (typeof PAGE_TABS)[number]['id'];

export const WesternAstrologyPage: React.FC = () => {
  usePageTitle('Chiêm Tinh Tây Phương');
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
        tone="purple"
      />

      {pageTab === 'la-so' && (
        <>
          <WesternChartView />
          <WesternMarkdownExport system="western" />
        </>
      )}
      {pageTab === 'van-han' && <ForecastView />}
    </div>
  );
};

export default WesternAstrologyPage;
