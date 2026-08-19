import type {
  UserProfile,
  UserTier as ContractUserTier,
  BasicProfile as ContractBasicProfile,
  ExtendedProfile as ContractExtendedProfile,
  LoginInput,
  RegisterInput,
  SocialTokenPayload,
  AuthResult,
} from '@lich-viet/contracts';

export type { BasicProfile, ExtendedProfile, SocialTokenPayload, AuthResult } from '@lich-viet/contracts';
export type UserTier = ContractUserTier;
export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple' | 'zalo';

/**
 * User model aligned with @lich-viet/contracts UserProfile
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  name?: string;
  accessTier?: Exclude<UserTier, 'guest'>;
  tier?: UserTier;
  avatarUrl?: string;
  birthday?: string;
  profile?: ContractBasicProfile;
  extendedProfile?: ContractExtendedProfile;
  provider: AuthProvider;
  role?: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  displayName?: string;
  name?: string;
  email: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
