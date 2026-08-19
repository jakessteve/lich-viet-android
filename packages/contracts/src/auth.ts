import { z } from 'zod';

export const LoginInputSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional(),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RegisterInputSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional(),
  name: z.string().min(1, 'Tên không được để trống').optional(),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const SocialTokenPayloadSchema = z.object({
  token: z.string().min(1),
  provider: z.enum(['google', 'apple', 'facebook', 'zalo']),
  codeVerifier: z.string().optional(),
  redirectUri: z.string().optional(),
});
export type SocialTokenPayload = z.infer<typeof SocialTokenPayloadSchema>;

export const BasicProfileSchema = z.object({
  birthYear: z.number().int().min(1900).max(2100).optional(),
  birthMonth: z.number().int().min(1).max(12).optional(),
  birthDay: z.number().int().min(1).max(31).optional(),
  birthHour: z.number().int().min(0).max(23).optional(),
  birthMinute: z.number().int().min(0).max(59).optional(),
  gender: z.enum(['male', 'female']).optional(),
});
export type BasicProfile = z.infer<typeof BasicProfileSchema>;

export const ExtendedProfileSchema = z.object({
  birthTime: z.string().optional(),
  birthLocation: z
    .object({
      lat: z.number(),
      lng: z.number(),
      city: z.string().optional(),
      locationName: z.string().optional(),
      countryCode: z.string().optional(),
      countryName: z.string().optional(),
    })
    .optional(),
  baziDayMaster: z.object({ stem: z.string(), element: z.string() }).optional(),
  truongSinhPhase: z.string().optional(),
  thanSat: z.array(z.string()).optional(),
  tuanKhong: z.array(z.string()).optional(),
  natalChartCached: z.record(z.string(), z.unknown()).optional(),
});
export type ExtendedProfile = z.infer<typeof ExtendedProfileSchema>;

export type UserTier = 'guest' | 'free' | 'curious' | 'premium' | 'expert' | 'admin';

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  tier: z.enum(['guest', 'free', 'curious', 'premium', 'expert', 'admin']).default('free'),
  role: z.enum(['user', 'admin']).optional(),
  birthday: z.string().optional(),
  profile: BasicProfileSchema.optional(),
  extendedProfile: ExtendedProfileSchema.optional(),
  provider: z.enum(['email', 'google', 'apple', 'facebook', 'zalo']).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type User = UserProfile;

export const AuthResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  user: UserProfileSchema,
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

export interface TokenFamilyRecord {
  familyId: string;
  userId: string;
  currentJti: string;
  revoked: boolean;
  expiresAt: number;
}
