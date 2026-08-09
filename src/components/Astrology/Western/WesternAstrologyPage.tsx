import React, { useEffect, useRef } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { WesternChartView } from './WesternChartView';
import { WesternMarkdownExport } from '../WesternMarkdownExport';

export const WesternAstrologyPage: React.FC = () => {
  usePageTitle('Chiêm Tinh Tây Phương');
  const prefilled = useRef(false);

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

      <div className="flex justify-center gap-2">
        <span className="px-4 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-sm font-semibold">Tây Phương</span>
      </div>

      <WesternChartView />
      <WesternMarkdownExport system="western" />
    </div>
  );
};

export default WesternAstrologyPage;
