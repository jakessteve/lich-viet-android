import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, safeStorage } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useProfileVaultStore } from '@/stores/profileVaultStore';
import { SettingRow, Toggle } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { renderDynamicIcon } from '@/components/ui/icon-renderer';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import {
  FileText,
  RefreshCw,
  LogIn,
  AlertTriangle,
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

interface DataSectionProps {
  autoSave: boolean;
  onAutoSaveChange: (v: boolean) => void;
  dateFormat: string;
  holidayCountry: string;
  onShowToast: () => void;
}

export const DataSection: React.FC<DataSectionProps> = ({
  autoSave,
  onAutoSaveChange,
  dateFormat,
  holidayCountry,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isDark = useAppStore((s) => s.isDark);
  const fontSize = useAppStore((s) => s.fontSize);
  const { syncWithCloud, isSyncing, lastSyncedAt } = useProfileVaultStore();
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
    <SectionCard icon="security" title="Dữ liệu & Quyền riêng tư">
      <SettingRow icon="save" label="Tự động lưu" description="Lưu cài đặt và lịch sử tra cứu">
        <Toggle
          id="toggle-auto-save"
          checked={autoSave}
          onChange={onAutoSaveChange}
        />
      </SettingRow>

      <SettingRow icon="download" label="Xuất & Sao lưu dữ liệu" description="Xuất cấu hình sang JSON hoặc Báo cáo cá nhân Markdown">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const EXPORTABLE_KEYS = [
                'fontSize',
                'dateFormat',
                'defaultView',
                'theme',
                'showLunarDetails',
                'holidayCountry',
                'dailyHoroscope',
                'auspiciousReminder',
                'lunarEvents',
                'autoSave',
                'local_birth_profile',
                'guest_display_name',
              ];
              const data = Object.fromEntries(
                EXPORTABLE_KEYS.map((k) => [k, localStorage.getItem(k)]).filter(([, v]) => v != null),
              );
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'lich-viet-backup.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gold/10 dark:bg-gold-dark/10 text-text-primary-light dark:text-gold-dark hover:bg-gold/20 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Xuất JSON (Sao lưu)</span>
          </button>

          <button
            onClick={() => {
              const profile = getUserBirthProfile(user);
              const nowStr = new Date().toLocaleDateString('vi-VN');
              let md = `# Báo Cáo Cấu Hình & Hồ Sơ — Lịch Việt\n*Ngày tạo: ${nowStr}*\n\n`;
              md += `## 1. Hồ Sơ Cá Nhân\n`;
              md += `- **Tên**: ${user?.displayName || safeStorage.get('guest_display_name') || 'Khách'}\n`;
              if (profile?.birthDay && profile?.birthMonth && profile?.birthYear) {
                md += `- **Ngày sinh**: ${profile.birthDay}/${profile.birthMonth}/${profile.birthYear}\n`;
              }
              if (typeof profile?.birthHour === 'number') {
                md += `- **Giờ sinh**: ${String(profile.birthHour).padStart(2, '0')}:${String(profile?.birthMinute ?? 0).padStart(2, '0')}\n`;
              }
              if (profile?.gender) {
                md += `- **Giới tính**: ${profile.gender === 'female' ? 'Nữ' : 'Nam'}\n`;
              }
              if (profile?.birthLocation?.locationName) {
                md += `- **Nơi sinh**: ${profile.birthLocation.locationName} (${profile.birthLocation.lat}°, ${profile.birthLocation.lng}°)\n`;
              }
              md += `\n## 2. Cài Đặt & Tuỳ Chọn\n`;
              md += `- **Cỡ chữ**: ${fontSize}\n`;
              md += `- **Định dạng ngày**: ${dateFormat}\n`;
              md += `- **Giao diện**: ${isDark ? 'Tối (Dark)' : 'Sáng (Light)'}\n`;
              md += `- **Quốc gia ngày lễ**: ${holidayCountry}\n`;
              md += `- **Tự động lưu**: ${autoSave ? 'Bật' : 'Tắt'}\n`;

              const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'lich-viet-bao-cao.md';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/40 dark:border-border-dark/30 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất Markdown</span>
          </button>

          {/* Import */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const IMPORTABLE_KEYS = [
                    'fontSize',
                    'dateFormat',
                    'defaultView',
                    'showLunarDetails',
                    'holidayCountry',
                    'dailyHoroscope',
                    'auspiciousReminder',
                    'lunarEvents',
                    'autoSave',
                    'local_birth_profile',
                    'guest_display_name',
                  ];
                  const parsed = JSON.parse(ev.target?.result as string);
                  let count = 0;
                  IMPORTABLE_KEYS.forEach((k) => {
                    if (typeof parsed[k] === 'string') {
                      localStorage.setItem(k, parsed[k]);
                      count++;
                    }
                  });
                  setImportMsg({ type: 'ok', text: `Đã nhập ${count} mục cài đặt. Tải lại trang để áp dụng.` });
                  setTimeout(() => setImportMsg(null), 4000);
                } catch {
                  setImportMsg({ type: 'err', text: 'File JSON không hợp lệ.' });
                  setTimeout(() => setImportMsg(null), 3000);
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/25 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
          >
            Nhập JSON
          </button>
        </div>
      </SettingRow>

      {importMsg && (
        <div
          className={`mx-0 mb-1 px-3 py-2 rounded-lg text-xs font-medium ${importMsg.type === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400'}`}
        >
          {importMsg.text}
        </div>
      )}

      <SettingRow
        icon="cloud_sync"
        label="Đồng bộ đám mây"
        description={
          isAuthenticated
            ? lastSyncedAt
              ? `Đã đồng bộ lần cuối lúc ${new Date(lastSyncedAt).toLocaleTimeString('vi-VN')} (${new Date(lastSyncedAt).toLocaleDateString('vi-VN')})`
              : 'Đồng bộ hồ sơ và dữ liệu cá nhân lên máy chủ an toàn'
            : 'Đăng nhập để tự động lưu & đồng bộ hồ sơ qua đám mây'
        }
      >
        {isAuthenticated ? (
          <button
            disabled={isSyncing}
            onClick={async () => {
              const res = await syncWithCloud();
              if (res.success) {
                onShowToast();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/app/dang-nhap')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gold/15 text-amber-950 dark:text-gold-dark hover:bg-gold/25 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập đồng bộ</span>
          </button>
        )}
      </SettingRow>

      <SettingRow icon="delete_sweep" label="Xóa bộ nhớ đệm" description="Xóa sạch cache định vị, thời tiết và tính toán tạm thời mà không mất cài đặt">
        <button
          onClick={() => {
            if (confirm('Xác nhận xóa bộ nhớ đệm tạm thời?')) {
              safeStorage.remove('holidays_geo_cache');
              try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (
                    key &&
                    (key.startsWith('query_cache_') ||
                      key.startsWith('weather_cache_') ||
                      key.startsWith('geo_cache_'))
                  ) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach((k) => localStorage.removeItem(k));
              } catch {
                // ignore
              }
              setImportMsg({ type: 'ok', text: 'Đã xóa bộ nhớ đệm tạm thời thành công.' });
              setTimeout(() => setImportMsg(null), 3000);
            }
          }}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-subtle-light dark:bg-white/6 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          Xóa bộ nhớ đệm
        </button>
      </SettingRow>

      {/* Danger Zone */}
      <div className="mt-4 pt-3 border-t border-red-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Đặt lại toàn bộ ứng dụng
            </span>
            <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
              Xóa toàn bộ cài đặt, hồ sơ cục bộ và đưa ứng dụng về trạng thái ban đầu.
            </p>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  'CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu ứng dụng và khôi phục cài đặt gốc?',
                )
              ) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors shrink-0 cursor-pointer"
          >
            Đặt lại tất cả
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default React.memo(DataSection);
