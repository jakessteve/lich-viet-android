import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologyStore } from '@/stores/astrologyStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { VedicChartView } from './VedicChartView';

export const VedicAstrologyPage: React.FC = () => {
  usePageTitle('Chiêm Tinh Ấn Độ');
  const navigate = useNavigate();
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

      <div className="flex justify-center gap-2">
        <span className="px-4 py-1.5 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-sm font-semibold">Ấn Độ (Vedic)</span>
      </div>

      <VedicChartView />

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
            onClick={() => navigate('/app/chiem-tinh/tay-phuong')}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
          >
            <span className="material-icons-round text-sm">auto_graph</span>
            Chiêm Tinh Tây Phương
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

export default VedicAstrologyPage;
