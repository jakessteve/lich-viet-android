import { create } from 'zustand';
import type { User, AuthProvider, AuthState, LoginCredentials, RegisterData } from '../types/auth';
import { buildTuViInputFromUser } from '@/utils/userBirthProfile';
import { formatTuViChartAsMarkdown, generateChart } from '@/services/tuvi';
import { getRuntime } from '@/gateways/bootstrap';

// ══════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════

const AUTH_STORAGE_KEY = 'auth_user';
const AUTH_SESSION_MARKER_KEY = 'auth_user_session_initialized';
const USERS_STORAGE_KEY = 'auth_users_db';

import { safeStorage, safeWarn } from '@/utils/safeStorage';

// Clean up legacy insecure auth database if present
if (typeof window !== 'undefined') {
  safeStorage.removeItem(USERS_STORAGE_KEY);
}

// ══════════════════════════════════════════════════════════
// Storage Helpers
// ══════════════════════════════════════════════════════════

function saveAuthUser(user: User | null): void {
  try {
    if (user) {
      safeStorage.setItem(AUTH_STORAGE_KEY, user);
      safeStorage.setItem(AUTH_SESSION_MARKER_KEY, 'true');
    } else {
      safeStorage.removeItem(AUTH_STORAGE_KEY);
      safeStorage.removeItem(AUTH_SESSION_MARKER_KEY);
    }
  } catch (err) {
    safeWarn('save_auth_user_failed', { error: String(err) });
  }
}

function readAuthUserFromStorage(): User | null {
  try {
    const marker = safeStorage.getItem(AUTH_SESSION_MARKER_KEY);
    if (marker !== true && marker !== 'true') {
      return null;
    }
    return safeStorage.getItem<User>(AUTH_STORAGE_KEY);
  } catch (err) {
    safeWarn('read_auth_user_failed', { error: String(err) });
    safeStorage.removeItem(AUTH_STORAGE_KEY);
    safeStorage.removeItem(AUTH_SESSION_MARKER_KEY);
    return null;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ══════════════════════════════════════════════════════════
// Store Interface
// ══════════════════════════════════════════════════════════

interface AuthActions {
  /** Email + password login */
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  /** Register with email + password */
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  /** Social login (simulated) */
  socialLogin: (provider: AuthProvider) => Promise<{ success: boolean; error?: string }>;
  /** Logout */
  logout: () => void;
  /** Rehydrate auth state from persisted storage */
  rehydrate: () => void;
  /** Update user profile fields */
  updateProfile: (updates: {
    displayName?: string;
    avatarUrl?: string;
    birthday?: string;
    gender?: 'male' | 'female';
    birthHour?: number | null;
    birthMinute?: number | null;
    birthLocation?: { lat: number; lng: number; city: string; countryCode?: string; countryName?: string } | null;
  }) => Promise<{ success: boolean; error?: string }>;
  /** Change password */
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

type AuthStore = AuthState & AuthActions;

// ══════════════════════════════════════════════════════════
// Initialize from localStorage
// ══════════════════════════════════════════════════════════

function getInitialAuthState(): Pick<AuthState, 'user' | 'isAuthenticated'> {
  if (typeof window === 'undefined') return { user: null, isAuthenticated: false };
  const user = readAuthUserFromStorage();
  return user ? { user, isAuthenticated: true } : { user: null, isAuthenticated: false };
}

const initialAuth = getInitialAuthState();

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // State
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  isLoading: false,

  // ── Login ───────────────────────────────────────────────
  login: async (credentials) => {
    set({ isLoading: true });

    try {
      const runtime = getRuntime();
      if (runtime.kind === 'remote') {
        const authResult = await runtime.auth.login({
          email: credentials.email,
          password: credentials.password,
        });
        const user: User = {
          id: authResult.user.id,
          email: authResult.user.email,
          displayName: authResult.user.name,
          accessTier: authResult.user.tier === 'expert' ? 'premium' : 'free',
          avatarUrl: authResult.user.avatarUrl,
          provider: 'email',
          createdAt: authResult.user.createdAt,
        };
        saveAuthUser(user);
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (err: unknown) {
      set({ isLoading: false });
      return { success: false, error: err instanceof Error ? err.message : 'Đăng nhập không thành công.' };
    }

    // Local / Demo runtime fallback
    await new Promise((r) => setTimeout(r, 400));

    const identifier = (credentials.email || '').toLowerCase().trim();
    if (!identifier) {
      set({ isLoading: false });
      return { success: false, error: 'Vui lòng nhập email hợp lệ.' };
    }

    const demoUser: User = {
      id: `usr-${identifier.replace(/[^a-z0-9]/g, '_')}`,
      email: identifier,
      displayName: identifier.split('@')[0] || 'Người Dùng Demo',
      accessTier: identifier.includes('admin') ? 'admin' : 'free',
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    saveAuthUser(demoUser);
    set({ user: demoUser, isAuthenticated: true, isLoading: false });
    return { success: true };
  },

  // ── Register ────────────────────────────────────────────
  register: async (data) => {
    set({ isLoading: true });

    try {
      const runtime = getRuntime();
      if (runtime.kind === 'remote') {
        const authResult = await runtime.auth.register({
          email: data.email,
          password: data.password,
          name: data.displayName,
        });
        const user: User = {
          id: authResult.user.id,
          email: authResult.user.email,
          displayName: authResult.user.name,
          accessTier: authResult.user.tier === 'expert' ? 'premium' : 'free',
          provider: 'email',
          createdAt: authResult.user.createdAt,
        };
        saveAuthUser(user);
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (err: unknown) {
      set({ isLoading: false });
      return { success: false, error: err instanceof Error ? err.message : 'Đăng ký không thành công.' };
    }

    // Local / Demo runtime fallback
    await new Promise((r) => setTimeout(r, 400));

    const newUser: User = {
      id: generateId(),
      email: data.email,
      displayName: data.displayName || data.email.split('@')[0] || 'Người Dùng Mới',
      accessTier: 'free',
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    saveAuthUser(newUser);
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    return { success: true };
  },

  // ── Social Login ──────────────────────────────────────────
  socialLogin: async (provider) => {
    set({ isLoading: true });

    const providerNames: Record<AuthProvider, string> = {
      google: 'Google',
      facebook: 'Facebook',
      apple: 'Apple',
      zalo: 'Zalo',
      email: 'Email',
    };

    try {
      const runtime = getRuntime();
      const gatewayProvider: 'google' | 'facebook' = provider === 'facebook' ? 'facebook' : 'google';
      const authResult = await runtime.auth.loginWithSocial(gatewayProvider, {
        token: `token-${provider}-${Date.now()}`,
        provider: gatewayProvider,
      });

      const uniqueSuffix = generateId().slice(0, 8);
      const user: User = {
        id: authResult.user.id || generateId(),
        email: authResult.user.email || `user_${uniqueSuffix}@${provider}.auth`,
        displayName: authResult.user.name || `Người dùng ${providerNames[provider]}`,
        accessTier: authResult.user.tier === 'expert' ? 'premium' : 'free',
        avatarUrl: authResult.user.avatarUrl,
        provider,
        createdAt: authResult.user.createdAt || new Date().toISOString(),
      };

      saveAuthUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch {
      set({ isLoading: false });
      return { success: false, error: 'Đăng nhập không thành công. Vui lòng thử lại.' };
    }
  },

  // ── Logout ──────────────────────────────────────────────
  logout: () => {
    try {
      getRuntime().auth.logout();
    } catch {
      // ignore
    }
    saveAuthUser(null);
    set({ user: null, isAuthenticated: false });
  },

  rehydrate: () => {
    const user = readAuthUserFromStorage();
    set({ user, isAuthenticated: Boolean(user) });
  },

  // ── Update Profile ────────────────────────────────────────────
  updateProfile: async ({ displayName, avatarUrl, birthday, gender, birthHour, birthMinute, birthLocation }) => {
    const { user } = get();
    if (!user) return { success: false, error: 'Chưa đăng nhập.' };

    if (displayName !== undefined && displayName.trim().length < 2) {
      return { success: false, error: 'Tên hiển thị phải có ít nhất 2 ký tự.' };
    }

    const updated: User = {
      ...user,
      ...(displayName !== undefined && { displayName: displayName.trim() }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(birthday !== undefined && { birthday }),
    };

    if (gender !== undefined || birthHour !== undefined || birthMinute !== undefined || birthday !== undefined) {
      updated.profile = {
        ...(updated.profile || {}),
        ...(gender !== undefined && { gender }),
        ...(birthHour !== undefined && { birthHour: birthHour === null ? undefined : birthHour }),
        ...(birthMinute !== undefined && { birthMinute: birthMinute === null ? undefined : birthMinute }),
      };

      // Auto-extract year/month/day if birthday string was updated and valid calendar date
      if (birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        const [y, m, d] = birthday.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        if (Number.isInteger(y) && dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) {
          updated.profile.birthYear = y;
          updated.profile.birthMonth = m;
          updated.profile.birthDay = d;
        }
      }
    }

    if (birthLocation !== undefined) {
      updated.extendedProfile = {
        ...(updated.extendedProfile || {}),
      };
      if (birthLocation === null) {
        delete updated.extendedProfile.birthLocation;
      } else {
        updated.extendedProfile.birthLocation = birthLocation;
      }
    }

    const tz =
      updated.extendedProfile?.birthLocation?.countryCode === 'VN'
        ? 7
        : updated.extendedProfile?.birthLocation
          ? Math.max(-12, Math.min(14, Math.round(updated.extendedProfile.birthLocation.lng / 15)))
          : 7;

    const tuViInput = buildTuViInputFromUser(updated, {
      gender: updated.profile?.gender === 'female' ? 'nữ' : updated.profile?.gender === 'male' ? 'nam' : undefined,
      birthHour: updated.profile?.birthHour,
      birthMinute: updated.profile?.birthMinute,
      birthLocation: updated.extendedProfile?.birthLocation
        ? {
            locationName:
              updated.extendedProfile.birthLocation.locationName ||
              updated.extendedProfile.birthLocation.city ||
              'Việt Nam',
            lat: updated.extendedProfile.birthLocation.lat,
            lng: updated.extendedProfile.birthLocation.lng,
            timezone: tz,
            countryCode: updated.extendedProfile.birthLocation.countryCode,
            countryName: updated.extendedProfile.birthLocation.countryName,
          }
        : undefined,
      timezone: 'Asia/Ho_Chi_Minh',
      school: 'thien-luong',
      name: updated.displayName,
    });

    if (tuViInput) {
      try {
        const chart = generateChart(tuViInput);
        const markdown = formatTuViChartAsMarkdown(chart);
        updated.extendedProfile = {
          ...(updated.extendedProfile || {}),
          natalChartCached: {
            generatedAt: new Date().toISOString(),
            markdown,
            input: tuViInput,
          },
        };
      } catch {
        // Chart generation should never block profile persistence.
      }
    }

    saveAuthUser(updated);
    set({ user: updated });

    try {
      const runtime = getRuntime();
      if (runtime.kind === 'remote') {
        await runtime.auth.updateProfile({
          name: updated.displayName,
          avatarUrl: updated.avatarUrl,
        });
      }
    } catch {
      // Background remote sync failure should not block local UI
    }

    return { success: true };
  },

  // ── Change Password ───────────────────────────────────────────
  changePassword: async (_currentPassword, newPassword) => {
    const { user } = get();
    if (!user) return { success: false, error: 'Chưa đăng nhập.' };
    if (user.provider !== 'email') return { success: false, error: 'Tài khoản xã hội không hỗ trợ đổi mật khẩu.' };
    if (newPassword.length < 8) return { success: false, error: 'Mật khẩu mới phải ít nhất 8 ký tự.' };

    return { success: true };
  },
}));
