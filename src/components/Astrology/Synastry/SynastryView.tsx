import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAstrologyStore } from '../../../stores/astrologyStore';
import { useAuthStore } from '../../../stores/authStore';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { BirthDataInput, ActionButton } from '../../shared';
import { SynastryResultView } from './SynastryResultView';

export const SynastryView: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const prefilled = React.useRef(false);
  const { input, setInput, runCalc, isCalculating, error, result } = useAstrologyStore(
    useShallow((state) => ({
      input: state.synastryInput,
      setInput: state.setSynastryInput,
      runCalc: state.calculateSynastry,
      isCalculating: state.isCalculating,
      error: state.error,
      result: state.synastryResult,
    })),
  );

  React.useEffect(() => {
    if (prefilled.current || !user) return;
    const profile = getUserBirthProfile(user);
    if (profile?.birthYear && profile?.birthMonth && profile?.birthDay) {
      const birthDate = new Date(
        profile.birthYear,
        profile.birthMonth - 1,
        profile.birthDay,
        profile.birthHour ?? 12,
        profile.birthMinute ?? 0,
      );
      setInput({
        profileA: {
          name: user.displayName || 'Bản thân',
          birthDate,
          birthHour: profile.birthHour ?? 12,
          birthMinute: profile.birthMinute ?? 0,
          latitude: profile.birthLocation?.lat ?? 21.0285,
          longitude: profile.birthLocation?.lng ?? 105.8542,
          timezone: profile.birthLocation?.timezone ?? 7,
          locationName: profile.birthLocation?.locationName ?? 'Hà Nội',
        },
      });
      prefilled.current = true;
    }
  }, [user, setInput]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card">
          <div className="card-header bg-rose-50 dark:bg-rose-900/10">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-rose-500 text-base">person</span>
              Người Thứ Nhất (A)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <BirthDataInput
              value={input.profileA}
              onChange={(val) => setInput({ profileA: { ...val, name: val.name || '' } })}
              showName={true}
              showGender={true}
            />
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header bg-pink-50 dark:bg-pink-900/10">
            <h3 className="section-title text-sm flex items-center gap-2">
              <span className="material-icons-round text-pink-500 text-base">person_outline</span>
              Người Thứ Hai (B)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <BirthDataInput
              value={input.profileB}
              onChange={(val) => setInput({ profileB: { ...val, name: val.name || '' } })}
              showName={true}
              showGender={true}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <ActionButton
          onClick={() => {
            void runCalc();
          }}
          disabled={isCalculating}
          icon={isCalculating ? 'hourglass_empty' : 'favorite'}
          variant="primary"
          className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white"
        >
          Chấm Điểm Hợp Duyên
        </ActionButton>
      </div>

      {result && !isCalculating && <SynastryResultView />}
    </div>
  );
};
