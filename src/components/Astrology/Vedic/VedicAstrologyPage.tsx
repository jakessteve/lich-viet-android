import React, { useEffect, useRef } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { VedicChartView } from './VedicChartView';

export const VedicAstrologyPage: React.FC = () => {
  usePageTitle('Chiêm Tinh Ấn Độ');
  const prefilled = useRef(false);

  const user = useAuthStore((s) => s.user);
  const setVedicInput = useAstrologyStore((s) => s.setVedicInput);

  useEffect(() => {
    if (prefilled.current || !user) return;
    const profile = getUserBirthProfile(user);
    if (profile?.birthYear && profile?.birthMonth && profile?.birthDay) {
      const birthDate = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay,
        profile.birthHour ?? 12, profile.birthMinute ?? 0);
      setVedicInput({
        birthDate,
        birthHour: profile.birthHour ?? 12,
        birthMinute: profile.birthMinute ?? 0,
        latitude: profile.birthLocation?.lat ?? 21.0285,
        longitude: profile.birthLocation?.lng ?? 105.8542,
        timezone: profile.birthLocation?.timezone ?? 7,
        ayanamsa: 'lahiri',
        locationName: profile.birthLocation?.locationName ?? undefined,
        countryCode: profile.birthLocation?.countryCode ?? undefined,
        countryName: profile.birthLocation?.countryName ?? undefined,
      });
      prefilled.current = true;
    }
  }, [user, setVedicInput]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center justify-center gap-2">
          <span className="material-icons-round text-xl text-purple-500 dark:text-purple-400">bubble_chart</span>
          Chiêm Tinh Ấn Độ (Vedic)
        </h2>
      </div>

      <VedicChartView />
    </div>
  );
};

export default VedicAstrologyPage;
