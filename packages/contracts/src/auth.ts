export interface LoginInput {
  email: string;
  password?: string | undefined;
}

export interface RegisterInput {
  email: string;
  password?: string | undefined;
  name?: string | undefined;
}

export interface SocialTokenPayload {
  token: string;
  provider: 'google' | 'apple' | 'facebook' | 'zalo';
  codeVerifier?: string | undefined;
  redirectUri?: string | undefined;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | undefined;
  tier: 'free' | 'curious' | 'expert';
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string | undefined;
  user: UserProfile;
}

export interface TokenFamilyRecord {
  familyId: string;
  userId: string;
  currentJti: string;
  revoked: boolean;
  expiresAt: number;
}
