import React, { useState, useMemo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { safeStorage } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { IconButton } from '@/components/shared';
import SuccessToast from '@/components/shared/SuccessToast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { TuViBirthLocation } from '@/types/tuvi';
import { getUserBirthProfile, UserBirthProfile } from '@/utils/userBirthProfile';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import {
  Palette,
  Clock,
  Calendar,
  Bell,
  Shield,
  UserCog,
  User,
  ChevronRight,
  Home,
} from 'lucide-react';
import {
  DisplaySection,
  DataSection,
  ProfileSection,
  AccountSection,
} from '@/components/Settings';

export default function SettingsPage() {
  usePageTitle('Cài đặt');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSection = searchParams.get('section');

  const { user, isAuthenticated, updateProfile, changePassword } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
      updateProfile: s.updateProfile,
      changePassword: s.changePassword,
    })),
  );
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Active section (sidebar navigation)
  const validSections = ['appearance', 'general', 'calendar', 'notifications', 'data', 'profile', 'account'];
  const [activeSection, setActiveSection] = useState(() => {
    if (urlSection && validSections.includes(urlSection)) return urlSection;
    return 'appearance';
  });

  useEffect(() => {
    if (urlSection && validSections.includes(urlSection)) {
      setActiveSection(urlSection);
    }
  }, [urlSection]);

  // Sections definition
  const SECTIONS = useMemo(
    () => [
      { id: 'appearance', icon: <Palette className="h-4 w-4" />, label: 'Giao diện' },
      { id: 'general', icon: <Clock className="h-4 w-4" />, label: 'Ngày tháng' },
      { id: 'calendar', icon: <Calendar className="h-4 w-4" />, label: 'Âm Lịch' },
      { id: 'notifications', icon: <Bell className="h-4 w-4" />, label: 'Thông báo' },
      { id: 'data', icon: <Shield className="h-4 w-4" />, label: 'Dữ liệu' },
      { id: 'profile', icon: <UserCog className="h-4 w-4" />, label: 'Hồ Sơ' },
      { id: 'account', icon: <User className="h-4 w-4" />, label: 'Tài khoản' },
    ],
    [],
  );

  // Profile editing state
  const [profileMode, setProfileMode] = useState<'view' | 'edit' | 'password'>('view');
  const [editName, setEditName] = useState('');
  const [editDay, setEditDay] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editBirthHour, setEditBirthHour] = useState('');
  const [editBirthMinute, setEditBirthMinute] = useState('');
  const [editBirthLocation, setEditBirthLocation] = useState<TuViBirthLocation | undefined>(undefined);
  const [editAvatar, setEditAvatar] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | ''>('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password change state
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const startEdit = () => {
    const currentProfile = getUserBirthProfile(user);
    setEditName(user?.displayName ?? (safeStorage.get('guest_display_name') || ''));

    setEditDay(currentProfile?.birthDay ? String(currentProfile.birthDay) : '');
    setEditMonth(currentProfile?.birthMonth ? String(currentProfile.birthMonth) : '');
    setEditYear(currentProfile?.birthYear ? String(currentProfile.birthYear) : '');

    setEditGender(currentProfile?.gender || '');
    setEditBirthHour(currentProfile?.birthHour !== undefined ? String(currentProfile.birthHour) : '');
    setEditBirthMinute(currentProfile?.birthMinute !== undefined ? String(currentProfile.birthMinute) : '');
    setEditBirthLocation(currentProfile?.birthLocation);

    setEditAvatar(user?.avatarUrl ?? '');
    setProfileMsg(null);
    setProfileMode('edit');
  };

  const cancelEdit = () => {
    setProfileMode('view');
    setProfileMsg(null);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);

    let birthdayStr = undefined;
    if (editYear && editMonth && editDay) {
      birthdayStr = `${editYear}-${String(editMonth).padStart(2, '0')}-${String(editDay).padStart(2, '0')}`;
    }

    const localProfileData: UserBirthProfile = {
      birthYear: editYear ? Number(editYear) : undefined,
      birthMonth: editMonth ? Number(editMonth) : undefined,
      birthDay: editDay ? Number(editDay) : undefined,
      birthHour: editBirthHour === '' ? undefined : Number(editBirthHour),
      birthMinute: editBirthMinute === '' ? undefined : Number(editBirthMinute),
      gender: editGender || undefined,
      birthLocation: editBirthLocation,
    };

    safeStorage.set('local_birth_profile', JSON.stringify(localProfileData));
    if (editName) {
      safeStorage.set('guest_display_name', editName);
    }

    if (isAuthenticated && user) {
      const result = await updateProfile({
        displayName: editName || undefined,
        birthday: birthdayStr,
        gender: editGender || undefined,
        avatarUrl: editAvatar || undefined,
        birthHour: editBirthHour === '' ? null : Number(editBirthHour),
        birthMinute: editBirthMinute === '' ? null : Number(editBirthMinute),
        birthLocation: editBirthLocation
          ? {
              city: editBirthLocation.locationName,
              lat: editBirthLocation.lat,
              lng: editBirthLocation.lng,
              countryCode: editBirthLocation.countryCode,
              countryName: editBirthLocation.countryName,
            }
          : undefined,
      });

      if (!result.success) {
        setProfileMsg({ type: 'err', text: result.error || 'Có lỗi xảy ra khi lưu hồ sơ.' });
        setProfileSaving(false);
        return;
      }
    }

    setProfileSaving(false);
    setProfileMode('view');
    setShowSaveToast(true);
    setProfileMsg({ type: 'ok', text: 'Đã lưu thông tin hồ sơ thành công!' });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setProfileMsg({ type: 'err', text: 'Ảnh quá lớn. Vui lòng chọn ảnh dưới 500 KB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setEditAvatar((ev.target?.result as string) ?? '');
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (pwNew !== pwConfirm) {
      setPwMsg({ type: 'err', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (pwNew.length < 8) {
      setPwMsg({ type: 'err', text: 'Mật khẩu mới phải ít nhất 8 ký tự.' });
      return;
    }
    setPwSaving(true);
    const result = await changePassword(pwCurrent, pwNew);
    setPwSaving(false);
    if (result.success) {
      setPwMsg({ type: 'ok', text: 'Đổi mật khẩu thành công.' });
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      setTimeout(() => setProfileMode('view'), 1500);
    } else {
      setPwMsg({ type: 'err', text: result.error ?? 'Lỗi không xác định.' });
    }
  };

  // Local settings state (persisted to localStorage)
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('dateFormat') || 'dd/mm/yyyy');
  const [defaultView, setDefaultView] = useState(() => localStorage.getItem('defaultView') || 'month');
  const [showLunarDetails, setShowLunarDetails] = useState(() => localStorage.getItem('showLunarDetails') !== 'false');
  const [holidayCountry, setHolidayCountry] = useState(() => localStorage.getItem('holidayCountry') || 'VN');
  const [dailyHoroscope, setDailyHoroscope] = useState(() => localStorage.getItem('dailyHoroscope') === 'true');
  const [auspiciousReminder, setAuspiciousReminder] = useState(
    () => localStorage.getItem('auspiciousReminder') === 'true',
  );
  const [lunarEvents, setLunarEvents] = useState(() => localStorage.getItem('lunarEvents') !== 'false');
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('autoSave') !== 'false');

  const save = (key: string, value: string) => localStorage.setItem(key, value);

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-5">
        <IconButton onClick={() => navigate(-1)} className="rounded-xl" icon="arrow_back" label="Quay lại" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cài đặt</h1>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Tùy chỉnh trải nghiệm</p>
        </div>
      </div>

      {/* Mobile: horizontal tab strip */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 pr-10 scrollbar-hide snap-x snap-mandatory">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex shrink-0 snap-start items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 spring-press ${
                  activeSection === s.id
                    ? 'bg-gradient-to-r from-gold/15 to-amber-500/10 dark:from-gold-dark/12 dark:to-amber-400/8 text-text-primary-light dark:text-gold-dark shadow-sm font-semibold'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {renderDynamicIcon(s.icon, 'h-4 w-4 shrink-0')}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end pr-1 pl-6 bg-gradient-to-l from-surface-light via-surface-light/90 to-transparent dark:from-surface-dark dark:via-surface-dark/90"
            aria-hidden="true"
          >
            <ChevronRight className="h-4 w-4 text-text-secondary-light/70 dark:text-text-secondary-dark/70" />
          </div>
        </div>
      </div>

      {/* Desktop: 2-column layout */}
      <div className="flex gap-5 items-start">
        {/* ── LEFT SIDEBAR ── */}
        <nav className="hidden md:flex flex-col gap-0.5 w-[190px] shrink-0 sticky top-4 glass-card p-2 rounded-2xl">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all duration-200 spring-press ${
                activeSection === s.id
                  ? 'bg-gradient-to-r from-gold/15 to-amber-500/10 dark:from-gold-dark/15 dark:to-amber-400/8 text-text-primary-light dark:text-gold-dark font-semibold'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100/80 dark:hover:bg-white/5'
              }`}
            >
              <div
                className={
                  activeSection === s.id
                    ? 'text-gold dark:text-gold-dark'
                    : 'text-text-secondary-light/60 dark:text-text-secondary-dark/60'
                }
              >
                {renderDynamicIcon(s.icon, 'h-4 w-4 shrink-0')}
              </div>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* ── RIGHT CONTENT (Wrapped in ErrorBoundary per section) ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {['appearance', 'general', 'calendar', 'notifications'].includes(activeSection) && (
            <ErrorBoundary viewName={`Cài đặt: ${activeSection}`}>
              <DisplaySection
                activeSubSection={activeSection as 'appearance' | 'general' | 'calendar' | 'notifications'}
                dateFormat={dateFormat}
                onDateFormatChange={(v) => {
                  setDateFormat(v);
                  save('dateFormat', v);
                }}
                holidayCountry={holidayCountry}
                onHolidayCountryChange={(v) => {
                  setHolidayCountry(v);
                  save('holidayCountry', v);
                }}
                defaultView={defaultView}
                onDefaultViewChange={(v) => {
                  setDefaultView(v);
                  save('defaultView', v);
                }}
                showLunarDetails={showLunarDetails}
                onShowLunarDetailsChange={(v) => {
                  setShowLunarDetails(v);
                  save('showLunarDetails', String(v));
                }}
                dailyHoroscope={dailyHoroscope}
                onDailyHoroscopeChange={(v) => {
                  setDailyHoroscope(v);
                  save('dailyHoroscope', String(v));
                }}
                auspiciousReminder={auspiciousReminder}
                onAuspiciousReminderChange={(v) => {
                  setAuspiciousReminder(v);
                  save('auspiciousReminder', String(v));
                }}
                lunarEvents={lunarEvents}
                onLunarEventsChange={(v) => {
                  setLunarEvents(v);
                  save('lunarEvents', String(v));
                }}
              />
            </ErrorBoundary>
          )}

          {activeSection === 'data' && (
            <ErrorBoundary viewName="Cài đặt: Dữ liệu & Quyền riêng tư">
              <DataSection
                autoSave={autoSave}
                onAutoSaveChange={(v) => {
                  setAutoSave(v);
                  save('autoSave', String(v));
                }}
                dateFormat={dateFormat}
                holidayCountry={holidayCountry}
                onShowToast={() => setShowSaveToast(true)}
              />
            </ErrorBoundary>
          )}

          {activeSection === 'profile' && (
            <ErrorBoundary viewName="Cài đặt: Hồ Sơ Cá Nhân">
              <ProfileSection
                profileMode={profileMode}
                setProfileMode={setProfileMode}
                editName={editName}
                setEditName={setEditName}
                editDay={editDay}
                setEditDay={setEditDay}
                editMonth={editMonth}
                setEditMonth={setEditMonth}
                editYear={editYear}
                setEditYear={setEditYear}
                editBirthHour={editBirthHour}
                setEditBirthHour={setEditBirthHour}
                editBirthMinute={editBirthMinute}
                setEditBirthMinute={setEditBirthMinute}
                editBirthLocation={editBirthLocation}
                setEditBirthLocation={setEditBirthLocation}
                editAvatar={editAvatar}
                setEditAvatar={setEditAvatar}
                editGender={editGender}
                setEditGender={setEditGender}
                profileSaving={profileSaving}
                profileMsg={profileMsg}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveProfile={handleSaveProfile}
                onAvatarFile={handleAvatarFile}
                pwCurrent={pwCurrent}
                setPwCurrent={setPwCurrent}
                pwNew={pwNew}
                setPwNew={setPwNew}
                pwConfirm={pwConfirm}
                setPwConfirm={setPwConfirm}
                pwSaving={pwSaving}
                pwMsg={pwMsg}
                onChangePassword={handleChangePassword}
              />
            </ErrorBoundary>
          )}

          {activeSection === 'account' && (
            <ErrorBoundary viewName="Cài đặt: Tài khoản">
              <AccountSection />
            </ErrorBoundary>
          )}

          {/* About footer */}
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60">
              Lịch Việt v1.0 · MIT
            </p>
            <button
              onClick={() => navigate('/app/am-lich')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              aria-label="Về trang Âm Lịch"
              title="Về trang Âm Lịch"
            >
              <Home className="h-4 w-4 text-text-secondary-light/60 dark:text-text-secondary-dark/60" />
            </button>
          </div>
        </div>
      </div>
      <div className="h-6" />
      <SuccessToast
        message="Thông tin cá nhân đã được cập nhật"
        visible={showSaveToast}
        onHide={() => setShowSaveToast(false)}
      />
    </div>
  );
}
