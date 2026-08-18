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
const ADMIN_SEED_EMAIL = 'admin@lichviet.app';
const ADMIN_SEED_PASSWORD_HASH = 'ef00af5081263d0c0e72e3f8b98119303d53edc687c02f8b54e220a6b46973d5';
const ADMIN_SEED_SALT = 'lichviet-admin-seed';
const ADMIN_SEED_USER_ID = 'seed-admin-lich-viet';
const ADMIN_SEED_CREATED_AT = '2026-05-16T00:00:00.000Z';

// ══════════════════════════════════════════════════════════
// Helper — SHA-256 password hashing
// ══════════════════════════════════════════════════════════

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, salt: string = ''): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ══════════════════════════════════════════════════════════
// "Database" — localStorage user registry
// ⚠️ SECURITY: Client-side only — all data is accessible
// via browser DevTools. Migrate to server-side auth for
// production use. See SECURITY.md for details.
// ══════════════════════════════════════════════════════════

interface StoredUser {
  user: User;
  passwordHash: string;
  salt?: string; // Added for rainbow table protection
}

function getSeededAdminUser(): StoredUser {
  return {
    user: {
      id: ADMIN_SEED_USER_ID,
      email: ADMIN_SEED_EMAIL,
      displayName: 'Admin',
      accessTier: 'admin',
      provider: 'email',
      createdAt: ADMIN_SEED_CREATED_AT,
    },
    passwordHash: ADMIN_SEED_PASSWORD_HASH,
    salt: ADMIN_SEED_SALT,
  };
}

function ensureSeededAdmin(users: StoredUser[]): StoredUser[] {
  // Only inject seed admin in development mode or test environments
  if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.DEV && !import.meta.env.VITEST) {
    return users;
  }
  const hasAdmin = users.some((entry) => entry.user?.email?.toLowerCase() === ADMIN_SEED_EMAIL);
  if (hasAdmin) return users;

  const next = [...users, getSeededAdminUser()];
  saveStoredUsers(next);
  return next;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    return ensureSeededAdmin(Array.isArray(users) ? users : []);
  } catch {
    const users = [getSeededAdminUser()];
    saveStoredUsers(users);
    return users;
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage failures in private mode / quota edge cases.
  }
}

function saveAuthUser(user: User | null): void {
  try {
    if (user) {
      const serialized = JSON.stringify(user);
      localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      localStorage.setItem(AUTH_SESSION_MARKER_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_SESSION_MARKER_KEY);
    }
  } catch {
    // Ignore storage failures in private mode / quota edge cases.
  }
}

function readAuthUserFromStorage(): User | null {
  try {
    if (localStorage.getItem(AUTH_SESSION_MARKER_KEY) !== 'true') {
      return null;
    }
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_SESSION_MARKER_KEY);
    } catch {
      // ignore
    }
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
  /** Update user profile fields (displayName, avatarUrl, birthday, birthHour, birthMinute, birthLocation) */
  updateProfile: (updates: {
    displayName?: string;
    avatarUrl?: string;
    birthday?: string;
    gender?: 'male' | 'female';
    birthHour?: number | null;
    birthMinute?: number | null;
    birthLocation?: { lat: number; lng: number; city: string; countryCode?: string; countryName?: string } | null;
  }) => Promise<{ success: boolean; error?: string }>;
  /** Change password (requires current password verification) */
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

// ══════════════════════════════════════════════════════════
// Zustand Store
// ══════════════════════════════════════════════════════════

const initialAuth = getInitialAuthState();

if (typeof window !== 'undefined') {
  getStoredUsers();
}

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
    await new Promise((r) => setTimeout(r, 600));

    const users = getStoredUsers();
    const identifier = (credentials.email || '').toLowerCase();
    // Find user first, then hash with their salt
    const candidates = users.filter(
      (u) => u.user?.email?.toLowerCase() === identifier || u.user?.displayName?.toLowerCase() === identifier,
    );
    let found: StoredUser | undefined;
    for (const c of candidates) {
      const hash = await hashPassword(credentials.password, c.salt || '');
      if (c.passwordHash === hash) {
        found = c;
        break;
      }
    }

    if (!found) {
      set({ isLoading: false });
      return { success: false, error: 'Email hoặc mật khẩu không đúng.' };
    }

    // Full login
    saveAuthUser(found.user);
    set({ user: found.user, isAuthenticated: true, isLoading: false });
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
    await new Promise((r) => setTimeout(r, 800));

    const users = getStoredUsers();

    // Check duplicate email
    if (users.some((u) => u.user?.email?.toLowerCase() === (data.email || '').toLowerCase())) {
      set({ isLoading: false });
      return { success: false, error: 'Email này đã được sử dụng.' };
    }

    const salt = generateSalt();
    const hash = await hashPassword(data.password, salt);
    const newUser: User = {
      id: generateId(),
      email: data.email,
      displayName: data.displayName,
      accessTier: 'free',
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    users.push({ user: newUser, passwordHash: hash, salt });
    saveStoredUsers(users);
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

      const users = getStoredUsers();
      users.push({ user, passwordHash: '' });
      saveStoredUsers(users);
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

    const tuViInput = buildTuViInputFromUser(updated, {
      gender: updated.profile?.gender === 'female' ? 'nữ' : updated.profile?.gender === 'male' ? 'nam' : undefined,
      birthHour: updated.profile?.birthHour,
      birthMinute: updated.profile?.birthMinute,
      birthLocation: updated.extendedProfile?.birthLocation
        ? {
            locationName: updated.extendedProfile.birthLocation.city,
            lat: updated.extendedProfile.birthLocation.lat,
            lng: updated.extendedProfile.birthLocation.lng,
            timezone: Math.max(-12, Math.min(14, Math.round(updated.extendedProfile.birthLocation.lng / 15))),
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

    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.user.id === user.id);
    if (idx !== -1) {
      users[idx].user = updated;
      saveStoredUsers(users);
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
  changePassword: async (currentPassword, newPassword) => {
    const { user } = get();
    if (!user) return { success: false, error: 'Chưa đăng nhập.' };
    if (user.provider !== 'email') return { success: false, error: 'Tài khoản xã hội không hỗ trợ đổi mật khẩu.' };
    if (newPassword.length < 8) return { success: false, error: 'Mật khẩu mới phải ít nhất 8 ký tự.' };

    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.user.id === user.id);
    const currentHash = idx === -1 ? '' : await hashPassword(currentPassword, users[idx].salt || '');

    if (idx === -1 || users[idx].passwordHash !== currentHash) {
      return { success: false, error: 'Mật khẩu hiện tại không đúng.' };
    }

    const nextSalt = generateSalt();
    users[idx].salt = nextSalt;
    users[idx].passwordHash = await hashPassword(newPassword, nextSalt);
    saveStoredUsers(users);
    saveAuthUser(user);
    return { success: true };
  },
}));
