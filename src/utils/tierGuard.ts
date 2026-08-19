import type { UserTier } from '../types/auth';

export type FeatureKey =
  | 'bulk_date_scan_long'
  | 'tuvi_pdf_export'
  | 'synastry_deep_dive'
  | 'tarot_unlimited'
  | 'ai_interpretation'
  | 'vedic_gochar_deep'
  | 'ad_free';

export type CommercialTier = 'free' | 'pro' | 'expert';

/**
 * Normalizes any internal/contract UserTier into commercial tier level
 */
export function normalizeUserTier(tier?: UserTier | string): CommercialTier {
  if (!tier || tier === 'guest' || tier === 'free' || tier === 'curious') return 'free';
  if (tier === 'premium' || tier === 'pro') return 'pro';
  if (tier === 'expert' || tier === 'admin') return 'expert';
  return 'free';
}

export interface FeatureAccessResult {
  allowed: boolean;
  minTierRequired: 'pro' | 'expert';
  title: string;
  reason: string;
}

const FEATURE_DEFINITIONS: Record<
  FeatureKey,
  {
    minTier: 'pro' | 'expert';
    title: string;
    description: string;
  }
> = {
  bulk_date_scan_long: {
    minTier: 'pro',
    title: 'Quét Ngày Tốt Dài Hạn (>7 ngày)',
    description: 'Nâng cấp Pro để quét lịch hoàng đạo liên tục đến 90 ngày và mở khóa báo cáo chi tiết.',
  },
  tuvi_pdf_export: {
    minTier: 'pro',
    title: 'Xuất Bản Lá Số & Luận Giải PDF',
    description: 'Nâng cấp Pro/Expert để xuất toàn bộ lá số bát tự và tài liệu chiêm tinh chuẩn in ấn sắc nét.',
  },
  synastry_deep_dive: {
    minTier: 'pro',
    title: 'So Sánh & Hợp Tuổi Nâng Cao (Synastry)',
    description: 'Phân tích đa chiều điểm tương hợp tình duyên, đối tác kinh doanh với thuật toán chiêm tinh kết hợp.',
  },
  tarot_unlimited: {
    minTier: 'pro',
    title: 'Trải Bài Tarot & Kinh Dịch Không Giới Hạn',
    description: 'Rút quẻ không giới hạn mỗi ngày cùng giải nghĩa tương tác chuyên sâu.',
  },
  ai_interpretation: {
    minTier: 'expert',
    title: 'AI Chiêm Tinh Gia Luận Giải Độc Quyền',
    description: 'Trợ lý AI tổng hợp đại hạn, tiểu hạn và tư vấn vận trình cá nhân hóa theo từng giờ sinh.',
  },
  vedic_gochar_deep: {
    minTier: 'pro',
    title: 'Phân Tích Gochar & Vận Hạn Vedic Toàn Diện',
    description: 'Mở khóa chu kỳ hành tinh dịch chuyển Vedic (Gochar) và dự báo vận trình đa chu kỳ.',
  },
  ad_free: {
    minTier: 'pro',
    title: 'Trải Nghiệm Không Quảng Cáo',
    description: 'Loại bỏ toàn bộ banner và nội dung tài trợ để tập trung tối đa vào học thuật.',
  },
};

const TIER_WEIGHTS: Record<CommercialTier, number> = {
  free: 0,
  pro: 1,
  expert: 2,
};

/**
 * Checks whether a user with a given tier has access to a feature
 */
export function checkFeatureAccess(feature: FeatureKey, userTier?: UserTier | string): FeatureAccessResult {
  const norm = normalizeUserTier(userTier);
  const def = FEATURE_DEFINITIONS[feature];
  const userWeight = TIER_WEIGHTS[norm];
  const requiredWeight = TIER_WEIGHTS[def.minTier];

  return {
    allowed: userWeight >= requiredWeight,
    minTierRequired: def.minTier,
    title: def.title,
    reason: def.description,
  };
}
