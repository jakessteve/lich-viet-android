import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { safeStorage } from '@/stores/appStore';
import { Card } from '@/components/ui/card';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import { TuViLocationPicker } from '@/components/TuVi/TuViLocationPicker';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import { getDetailedDayData } from '@/utils/calendarEngine';
import type { TuViBirthLocation } from '@/types/tuvi';
import {
  Edit2,
  Lock,
  Camera,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode | string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-card rounded-2xl overflow-hidden border border-border-light/40 dark:border-border-dark/30">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border-light/20 dark:border-border-dark/15">
        <div className="text-gold dark:text-gold-dark">
          {renderDynamicIcon(icon, 'h-4 w-4 shrink-0')}
        </div>
        <span className="text-base font-semibold tracking-tight">{title}</span>
      </div>
      <div className="px-5 py-1">{children}</div>
    </Card>
  );
}

interface ProfileSectionProps {
  profileMode: 'view' | 'edit' | 'password';
  setProfileMode: (mode: 'view' | 'edit' | 'password') => void;
  editName: string;
  setEditName: (v: string) => void;
  editDay: string;
  setEditDay: (v: string) => void;
  editMonth: string;
  setEditMonth: (v: string) => void;
  editYear: string;
  setEditYear: (v: string) => void;
  editBirthHour: string;
  setEditBirthHour: (v: string) => void;
  editBirthMinute: string;
  setEditBirthMinute: (v: string) => void;
  editBirthLocation: TuViBirthLocation | undefined;
  setEditBirthLocation: (loc: TuViBirthLocation | undefined) => void;
  editAvatar: string;
  setEditAvatar: (v: string) => void;
  editGender: 'male' | 'female' | '';
  setEditGender: (g: 'male' | 'female' | '') => void;
  profileSaving: boolean;
  profileMsg: { type: 'ok' | 'err'; text: string } | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveProfile: () => void;
  onAvatarFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pwCurrent: string;
  setPwCurrent: (v: string) => void;
  pwNew: string;
  setPwNew: (v: string) => void;
  pwConfirm: string;
  setPwConfirm: (v: string) => void;
  pwSaving: boolean;
  pwMsg: { type: 'ok' | 'err'; text: string } | null;
  onChangePassword: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profileMode,
  setProfileMode,
  editName,
  setEditName,
  editDay,
  setEditDay,
  editMonth,
  setEditMonth,
  editYear,
  setEditYear,
  editBirthHour,
  setEditBirthHour,
  editBirthMinute,
  setEditBirthMinute,
  editBirthLocation,
  setEditBirthLocation,
  editAvatar,
  setEditAvatar,
  editGender,
  setEditGender,
  profileSaving,
  profileMsg,
  onStartEdit,
  onCancelEdit,
  onSaveProfile,
  onAvatarFile,
  pwCurrent,
  setPwCurrent,
  pwNew,
  setPwNew,
  pwConfirm,
  setPwConfirm,
  pwSaving,
  pwMsg,
  onChangePassword,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  return (
    <SectionCard icon="manage_accounts" title="Hồ Sơ Cá Nhân & Bản Mệnh">
      <div className="py-3 space-y-4">
        {profileMode === 'view' && (() => {
          const birthProfile = getUserBirthProfile(user);
          const displayName = user?.displayName || safeStorage.get('guest_display_name') || 'Chưa đặt tên';
          const hasBirthDate = Boolean(birthProfile?.birthDay && birthProfile?.birthMonth && birthProfile?.birthYear);

          let lunarInfo = null;
          let canChiInfo = null;
          if (hasBirthDate && birthProfile?.birthYear && birthProfile?.birthMonth && birthProfile?.birthDay) {
            try {
              const dayData = getDetailedDayData(
                new Date(birthProfile.birthYear, birthProfile.birthMonth - 1, birthProfile.birthDay),
              );
              lunarInfo = dayData.lunarDate;
              canChiInfo = {
                year: `${dayData.canChi.year.can} ${dayData.canChi.year.chi}`,
                month: `${dayData.canChi.month.can} ${dayData.canChi.month.chi}`,
                day: `${dayData.canChi.day.can} ${dayData.canChi.day.chi}`,
              };
            } catch {
              // ignore calculation error
            }
          }

          return (
            <div className="space-y-4 animate-fade-in">
              {/* Bento 1: Thông Tin Cơ Bản */}
              <div className="p-4 rounded-2xl bg-surface-subtle-light/80 dark:bg-white/5 border border-border-light/50 dark:border-border-dark/40 flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar */}
                  <div className="w-13 h-13 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-gold/20 via-purple-500/20 to-indigo-500/20 border border-gold/30 flex items-center justify-center shadow-xs">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-center leading-none select-none text-amber-950 dark:text-gold-dark">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                        {displayName}
                      </p>
                      {birthProfile?.gender && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-amber-950 dark:text-gold-dark border border-gold/20">
                          {birthProfile.gender === 'female' ? 'Nữ' : 'Nam'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                      {user?.email || 'Hồ sơ cục bộ trên thiết bị'}
                    </p>
                    <p className="text-xs text-text-secondary-light/80 dark:text-text-secondary-dark/80 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>🎂 {hasBirthDate ? `${birthProfile?.birthDay}/${birthProfile?.birthMonth}/${birthProfile?.birthYear}` : 'Chưa có ngày sinh'}</span>
                      {birthProfile?.birthHour !== undefined && (
                        <span>· ⏰ {String(birthProfile.birthHour).padStart(2, '0')}:{birthProfile.birthMinute !== undefined ? String(birthProfile.birthMinute).padStart(2, '0') : '00'}</span>
                      )}
                      {birthProfile?.birthLocation && (
                        <span>· 📍 {birthProfile.birthLocation.locationName}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={onStartEdit}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-gold/15 text-amber-950 dark:text-gold-dark hover:bg-gold/25 transition-colors flex items-center gap-1.5 spring-press cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>{hasBirthDate ? 'Chỉnh sửa' : 'Nhập thông tin'}</span>
                  </button>
                  {isAuthenticated && user?.provider === 'email' && (
                    <button
                      onClick={() => {
                        setProfileMode('password');
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/30 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" /> Đổi MK
                    </button>
                  )}
                </div>
              </div>

              {/* Bento 2: Mệnh Lý & Ngũ Hành Khởi Sinh */}
              {hasBirthDate && canChiInfo && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-surface-light via-amber-50/20 to-gold/5 dark:from-surface-dark dark:via-[#141426] dark:to-gold-dark/5 border border-gold/20 dark:border-gold-dark/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold dark:text-gold-dark" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark">
                      Bản Mệnh & Can Chi Khởi Sinh
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-surface-light dark:bg-white/5 border border-border-light/40 dark:border-border-dark/30 text-xs">
                      <span className="text-[10px] text-text-secondary-light/70 uppercase block font-medium">Năm Can Chi</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{canChiInfo.year}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-light dark:bg-white/5 border border-border-light/40 dark:border-border-dark/30 text-xs">
                      <span className="text-[10px] text-text-secondary-light/70 uppercase block font-medium">Tháng Can Chi</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{canChiInfo.month}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-light dark:bg-white/5 border border-border-light/40 dark:border-border-dark/30 text-xs">
                      <span className="text-[10px] text-text-secondary-light/70 uppercase block font-medium">Ngày Can Chi</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{canChiInfo.day}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-light dark:bg-white/5 border border-border-light/40 dark:border-border-dark/30 text-xs">
                      <span className="text-[10px] text-text-secondary-light/70 uppercase block font-medium">Âm Lịch</span>
                      <span className="font-bold text-gold dark:text-gold-dark">{lunarInfo?.day}/{lunarInfo?.month}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bento 3: Phím Tắt Mệnh Lý */}
              <div className="p-4 rounded-2xl bg-surface-subtle-light/60 dark:bg-white/5 border border-border-light/40 dark:border-border-dark/30 space-y-2.5">
                <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark block">
                  Phím tắt tra cứu nhanh với hồ sơ của bạn:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate('/app/tu-vi')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple/10 text-purple dark:text-purple-dark hover:bg-purple/20 border border-purple/20 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lá số Tử Vi</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigate('/app/chiem-tinh/tay-phuong')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Chiêm Tinh Tây Phương</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigate('/app/chiem-tinh/vedic')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Chiêm Tinh Vệ Đà</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {profileMode === 'edit' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Avatar upload */}
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-mystery-purple/20 to-mystery-blue/20 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => avatarInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && avatarInputRef.current?.click()}
                >
                  {editAvatar ? (
                    <img src={editAvatar} alt="avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-mystery-purple dark:text-mystery-purple-light">
                      {(editName || user?.displayName || 'K').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarFile}
                />
                <div>
                  <p className="text-xs font-medium">Tải ảnh đại diện</p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Nhấp vào khung ảnh để chọn (tối đa 500 KB)
                  </p>
                  {editAvatar && (
                    <button
                      onClick={() => setEditAvatar('')}
                      className="text-xs text-red-500 dark:text-red-400 mt-0.5 cursor-pointer"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Display name */}
            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Họ và tên / Tên hiển thị
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-3 py-2 rounded-lg text-sm bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/25 focus:ring-2 focus:ring-gold/25 dark:focus:ring-gold-dark/25 outline-none transition-all"
              />
            </div>

            {/* Birthday & Time */}
            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Ngày giờ sinh (Dương lịch)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editDay}
                  onChange={(e) => setEditDay(e.target.value)}
                  placeholder="Ngày (1-31)"
                  className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark text-sm text-center focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                  placeholder="Tháng (1-12)"
                  className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark text-sm text-center focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  placeholder="Năm (1900-2100)"
                  className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark text-sm text-center focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                />

                <select
                  value={editBirthHour}
                  onChange={(e) => setEditBirthHour(e.target.value)}
                  className="px-3 py-2.5 rounded-lg text-sm bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/25 focus:ring-2 focus:ring-gold/25 dark:focus:ring-gold-dark/25 outline-none transition-all"
                >
                  <option value="">Giờ</option>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')} giờ
                    </option>
                  ))}
                </select>

                <select
                  value={editBirthMinute}
                  onChange={(e) => setEditBirthMinute(e.target.value)}
                  className="px-3 py-2.5 rounded-lg text-sm bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/25 focus:ring-2 focus:ring-gold/25 dark:focus:ring-gold-dark/25 outline-none transition-all"
                >
                  <option value="">Phút</option>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')} phút
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Giới tính
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={editGender === 'male'}
                    onChange={(e) => setEditGender(e.target.value as 'male' | 'female')}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm">Nam</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={editGender === 'female'}
                    onChange={(e) => setEditGender(e.target.value as 'male' | 'female')}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm">Nữ</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Nơi sinh
              </label>
              <TuViLocationPicker value={editBirthLocation} onChange={setEditBirthLocation} />
            </div>

            {profileMsg && (
              <p
                className={`text-xs font-medium ${profileMsg.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
              >
                {profileMsg.text}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onSaveProfile}
                disabled={profileSaving}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-amber-950 dark:text-slate-900 bg-gold dark:bg-gold-dark hover:brightness-110 shadow-sm disabled:opacity-50 transition-all cursor-pointer spring-press"
              >
                {profileSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-white/6 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer spring-press"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {profileMode === 'password' && (
          <div className="space-y-3 animate-fade-in-up">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gold dark:text-gold-dark" />
              Đổi mật khẩu
            </p>
            {[
              { label: 'Mật khẩu hiện tại', val: pwCurrent, set: setPwCurrent, ph: '••••••••' },
              { label: 'Mật khẩu mới (tối thiểu 8 ký tự)', val: pwNew, set: setPwNew, ph: '••••••••' },
              { label: 'Xác nhận mật khẩu mới', val: pwConfirm, set: setPwConfirm, ph: '••••••••' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  {f.label}
                </label>
                <input
                  type="password"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/25 focus:ring-2 focus:ring-gold/25 dark:focus:ring-gold-dark/25 outline-none transition-all"
                />
              </div>
            ))}
            {pwMsg && (
              <p
                className={`text-xs font-medium ${pwMsg.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
              >
                {pwMsg.text}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={onChangePassword}
                disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-500 hover:brightness-110 shadow-sm shadow-gold/15 disabled:opacity-50 transition-all cursor-pointer"
              >
                {pwSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
              <button
                onClick={() => {
                  setProfileMode('view');
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-white/6 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default React.memo(ProfileSection);
