// ══════════════════════════════════════════════════════════
// Auth Type Definitions
// ══════════════════════════════════════════════════════════

/** Supported authentication providers */
export type AuthProvider = 'email' | 'google' | 'facebook';

/**
 * User access tiers.
 * - guest: Not logged in. No personalization.
 * - free:  Logged in, basic access.
 * - premium: Logged in, premium access.
 * - admin: Logged in, admin access.
 */
export type UserTier = 'guest' | 'free' | 'premium' | 'admin';

/** Astrological basic profile for personalization */
export interface BasicProfile {
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  birthMinute?: number;
  gender?: 'male' | 'female';
}

/** Extended profile for advanced astrology requiring birth time/location */
export interface ExtendedProfile {
  birthTime?: string; // HH:MM
  birthLocation?: {
    lat: number;
    lng: number;
    city: string;
    countryCode?: string;
    countryName?: string;
  };
  baziDayMaster?: { stem: string; element: string };
  truongSinhPhase?: string;
  thanSat?: string[];
  tuanKhong?: string[]; // Void branches
  natalChartCached?: Record<string, unknown>;
}

/** User profile */
export interface User {
  id: string;
  email: string;
  displayName: string;
  /** Account access tier for UI labels and feature gating */
  accessTier?: Exclude<UserTier, 'guest'>;
  avatarUrl?: string;
  /** ISO date string YYYY-MM-DD */
  birthday?: string;
  /** Personalization profile containing astrological details */
  profile?: BasicProfile;
  extendedProfile?: ExtendedProfile;
  provider: AuthProvider;
  createdAt: string;
}

/** Login credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Registration data */
export interface RegisterData {
  displayName: string;
  email: string;
  password: string;
}

/** Auth state for the store */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
