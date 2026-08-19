import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Calendar,
  Zap,
  FolderHeart,
  Sparkles,
  Check,
  X,
  Crown,
  ShieldCheck,
  Star,
  FileText,
  Layers,
  ArrowRight,
  HelpCircle,
  QrCode,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MotionFadeIn } from '@/components/ui/motion-primitives';

type BillingInterval = 'monthly' | 'yearly';

interface PricingTier {
  id: 'free' | 'pro' | 'expert';
  name: string;
  badge?: string;
  badgeClass?: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Cơ Bản',
    description: 'Đầy đủ công cụ tra cứu âm dương, tiết khí và an sao thiên văn cổ học thiết yếu.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    features: [
      'Tra cứu Lịch Âm - Dương & Tiết Khí 24 kỳ',
      'Giờ Hoàng Đạo / Hắc Đạo 12 khung giờ',
      'An sao Tử Vi & Chiêm Tinh cá nhân (1 hồ sơ)',
      'Gieo quẻ Mai Hoa Dịch Số cơ bản',
      'Thuật toán chạy Offline 0ms trên thiết bị',
      'Bảo mật thông tin cục bộ 100%',
    ],
    ctaLabel: 'Gói Hiện Tại',
  },
  {
    id: 'pro',
    name: 'Hội Viên Pro',
    badge: 'Khuyên Dùng',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-gold text-white shadow-xs',
    description: 'Tối ưu hóa vận hội, chọn ngày giờ đắc tài lộc và xem độ tương hợp cho cả gia đình.',
    monthlyPrice: 69000,
    yearlyPrice: 590000, // ~49k/tháng
    popular: true,
    features: [
      'Toàn bộ quyền lợi gói Cơ Bản',
      'Cá nhân hóa theo năm sinh không giới hạn hồ sơ',
      'Tra cứu Dụng Sự hàng loạt (Bulk Scan 3–6 tháng)',
      'Radar Tương Hợp (Synastry) & Bát Tự Hôn Phối',
      'Cảnh báo xung khắc trực tiếp theo can chi ngày',
      'Xuất ảnh Story HD chia sẻ ngày đẹp mạng xã hội',
      'Đồng bộ đám mây đa thiết bị an toàn',
    ],
    ctaLabel: 'Nâng Cấp Pro Ngay',
  },
  {
    id: 'expert',
    name: 'Chuyên Gia / Đại Sư',
    badge: 'Chuyên Sâu',
    badgeClass: 'bg-purple/15 text-purple dark:text-purple-dark border border-purple/30',
    description: 'Không gian làm việc toàn diện cho nhà nghiên cứu, phong thủy sư & chuyên gia tư vấn.',
    monthlyPrice: 199000,
    yearlyPrice: 1690000, // ~140k/tháng
    popular: false,
    features: [
      'Toàn bộ quyền lợi gói Hội Viên Pro',
      'Không gian so sánh song song (Dual-Pane Tử Vi & Western Natal)',
      'Xuất Báo Cáo Luận Giải PDF Pro đóng dấu thương hiệu cá nhân',
      'Mở khóa toàn diện Tam Thức & Kỳ Môn Độn Giáp',
      'Quản lý danh sách hồ sơ khách hàng chuyên nghiệp',
      'Hỗ trợ học thuật ưu tiên 1-1 cùng ban cố vấn',
    ],
    ctaLabel: 'Trở Thành Chuyên Gia',
  },
];

interface ComparisonFeature {
  name: string;
  category: string;
  free: boolean | string;
  pro: boolean | string;
  expert: boolean | string;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  // Lịch & Dụng Sự
  { name: 'Lịch Âm Dương & Tiết Khí 24 kỳ', category: 'Lịch & Dụng Sự', free: true, pro: true, expert: true },
  { name: 'Khung giờ Hoàng Đạo / Hắc Đạo', category: 'Lịch & Dụng Sự', free: true, pro: true, expert: true },
  { name: 'Tra cứu việc Nghi / Kỵ ngày bất kỳ', category: 'Lịch & Dụng Sự', free: true, pro: true, expert: true },
  { name: 'Tìm ngày tốt theo mục đích (Cưới hỏi, Động thổ...)', category: 'Lịch & Dụng Sự', free: '7 ngày tới', pro: '180 ngày', expert: '365 ngày' },
  { name: 'Bộ lọc ngũ hành nâng cao & Tiết khí chi tiết', category: 'Lịch & Dụng Sự', free: false, pro: true, expert: true },

  // Cá nhân hóa & Bản mệnh
  { name: 'Cá nhân hóa điểm ngày theo năm sinh', category: 'Cá Nhân Hóa', free: '1 hồ sơ', pro: 'Không giới hạn', expert: 'Không giới hạn' },
  { name: 'Điều chỉnh giờ cát hung theo tuổi', category: 'Cá Nhân Hóa', free: true, pro: true, expert: true },
  { name: 'Radar Tương Hợp (Synastry) 2 người', category: 'Cá Nhân Hóa', free: false, pro: true, expert: true },
  { name: 'Đối sánh Bát Tự Hôn Phối & Đối tác', category: 'Cá Nhân Hóa', free: false, pro: true, expert: true },

  // Chiêm Tinh & An Sao
  { name: 'Lá số Tử Vi Nam Phái & Bắc Phái', category: 'Thuật Toán Cổ Học', free: true, pro: true, expert: true },
  { name: 'Vòng Hoàng Đạo Western Natal Wheel (Swiss Ephemeris)', category: 'Thuật Toán Cổ Học', free: true, pro: true, expert: true },
  { name: 'Không gian so sánh song song Đông - Tây', category: 'Thuật Toán Cổ Học', free: false, pro: false, expert: true },
  { name: 'Tam Thức & Kỳ Môn Độn Giáp chuyên sâu', category: 'Thuật Toán Cổ Học', free: 'Cơ bản', pro: 'Đầy đủ', expert: 'Chuyên gia' },

  // Xuất bản & Chuyên nghiệp
  { name: 'Xuất ảnh Story HD chia sẻ lá số', category: 'Xuất Bản & Tiện Ích', free: false, pro: true, expert: true },
  { name: 'Xuất Báo Cáo PDF Luận Giải Đầy Đủ', category: 'Xuất Bản & Tiện Ích', free: false, pro: false, expert: true },
  { name: 'Đóng dấu thương hiệu / Tên chuyên gia trên PDF', category: 'Xuất Bản & Tiện Ích', free: false, pro: false, expert: true },
  { name: 'Đồng bộ Cloud đa thiết bị', category: 'Xuất Bản & Tiện Ích', free: false, pro: true, expert: true },
];

const FAQS = [
  {
    q: 'Các tính năng cốt lõi của Lịch Việt có luôn miễn phí không?',
    a: 'Có. Toàn bộ công cụ tính toán thiên văn, tra cứu âm dương, giờ hoàng đạo và an sao cơ bản hoàn toàn miễn phí và chạy 0ms offline trên thiết bị của bạn.',
  },
  {
    q: 'Làm thế nào để kích hoạt gói Hội Viên Pro sau khi thanh toán?',
    a: 'Hệ thống tự động kích hoạt tài khoản của bạn ngay lập tức sau khi giao dịch chuyển khoản / QR Code được xác nhận trong vòng 30 giây.',
  },
  {
    q: 'Tôi có thể sử dụng tài khoản Pro trên nhiều thiết bị không?',
    a: 'Có. Tài khoản Pro hỗ trợ đồng bộ dữ liệu đám mây liền mạch giữa điện thoại, máy tính bảng và máy tính để bàn.',
  },
  {
    q: 'Thuật toán an sao và trạch nhật có chuẩn xác học thuật không?',
    a: 'Lịch Việt ứng dụng mô hình số hóa chuẩn mực từ các cổ thư chính thống (Hiệp Kỷ Biện Phương Thư, Ngọc Hạp Thông Thư, Tử Vi Đẩu Số Toàn Thư) kết hợp thư viện thiên văn quốc tế Swiss Ephemeris.',
  },
];

export default function UpgradePage() {
  usePageTitle('Bảng Giá & Quyền Lợi Hội Viên');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly');
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<PricingTier | null>(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState<'qr' | 'momo' | 'card'>('qr');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const currentTier = user?.accessTier || 'free';
  const isPremium = currentTier === 'premium' || currentTier === 'admin';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSelectTier = (tier: PricingTier) => {
    if (tier.id === 'free') {
      navigate('/app/am-lich');
      return;
    }
    if (!isAuthenticated) {
      navigate('/app/dang-nhap?redirect=/app/nang-cap');
      return;
    }
    setSelectedTierForCheckout(tier);
  };

  const handleConfirmMockPayment = () => {
    setIsSuccessModalOpen(true);
  };

  return (
    <MotionFadeIn className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-12">
      {/* ── 1. Hero Banner ────────────────────────────────────────── */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 dark:bg-gold-dark/15 border border-gold/30 dark:border-gold-dark/30 text-gold dark:text-gold-dark text-xs font-bold uppercase tracking-wider animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Nâng Tầm Trải Nghiệm Lịch Việt</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Lựa Chọn Gói Hội Viên Phù Hợp
        </h1>

        <p className="text-base sm:text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
          Mở khóa toàn bộ thuật toán cá nhân hóa bản mệnh, trạch nhật đa chiều và bộ công cụ xuất bản chuyên nghiệp.
        </p>

        {/* Current status pill */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <span>Tài khoản hiện tại:</span>
            <span className="font-bold text-text-primary-light dark:text-text-primary-dark px-2 py-0.5 rounded-md bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark/60">
              {isPremium ? '🌟 Hội Viên Cao Cấp' : '🌱 Gói Cơ Bản (Miễn Phí)'}
            </span>
          </span>
        </div>

        {/* ── Billing Toggle ──────────────────────────────────────── */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-surface-subtle-light dark:bg-surface-elevated-dark p-1 rounded-2xl border border-border-light dark:border-border-dark/60 inline-flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                billingInterval === 'monthly'
                  ? 'bg-surface-light dark:bg-surface-container-high text-text-primary-light dark:text-text-primary-dark shadow-xs'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              Thanh toán hàng tháng
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('yearly')}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                billingInterval === 'yearly'
                  ? 'bg-surface-light dark:bg-surface-container-high text-text-primary-light dark:text-text-primary-dark shadow-xs'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              <span>Thanh toán hàng năm</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Pricing Tier Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {PRICING_TIERS.map((tier) => {
          const price = billingInterval === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
          const isTierActive = (tier.id === 'free' && !isPremium) || (tier.id === 'pro' && isPremium);

          return (
            <Card
              key={tier.id}
              variant={tier.popular ? 'default' : 'glass'}
              className={`p-6 sm:p-7 flex flex-col justify-between relative rounded-3xl transition-all duration-250 ${
                tier.popular
                  ? 'border-2 border-gold/60 dark:border-gold-dark/60 shadow-xl shadow-gold/5 dark:shadow-gold-dark/5 ring-1 ring-gold/20'
                  : 'border border-border-light/70 dark:border-border-dark/70 hover:border-border-light dark:hover:border-border-dark'
              }`}
            >
              {/* Popular Badge */}
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tier.badgeClass}`}>
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 min-h-[32px] leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-border-light/40 dark:border-border-dark/30">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
                      {price === 0 ? '0 đ' : formatCurrency(price).replace('₫', 'đ')}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        /{billingInterval === 'yearly' ? 'năm' : 'tháng'}
                      </span>
                    )}
                  </div>
                  {billingInterval === 'yearly' && price > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Tương đương {formatCurrency(Math.round(price / 12)).replace('₫', 'đ')} / tháng
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-3 pt-3 border-t border-border-light/40 dark:border-border-dark/30">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Quyền lợi bao gồm:
                  </span>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                        <Check className="h-4 w-4 text-good dark:text-good-dark shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-border-light/40 dark:border-border-dark/30">
                <Button
                  onClick={() => handleSelectTier(tier)}
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={isTierActive}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all spring-press cursor-pointer ${
                    tier.popular
                      ? 'bg-gradient-to-r from-gold to-amber-600 text-white shadow-md hover:opacity-95'
                      : ''
                  }`}
                >
                  {isTierActive ? 'Đang Sử Dụng' : tier.ctaLabel}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── 3. Detailed Feature Comparison Table ──────────────────── */}
      <div className="space-y-6 pt-8 border-t border-border-light/60 dark:border-border-dark/60">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Bảng So Sánh Chi Tiết Tính Năng
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Đánh giá toàn diện các quyền lợi theo từng cấp bậc người dùng
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border-light/70 dark:border-border-dark/70 bg-surface-light dark:bg-surface-elevated-dark shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-surface-subtle-light/80 dark:bg-surface-container-high border-b border-border-light/70 dark:border-border-dark/70">
                <th className="p-4 sm:p-5 font-bold text-text-primary-light dark:text-text-primary-dark w-2/5">
                  Tính năng / Quyền lợi
                </th>
                <th className="p-4 sm:p-5 font-bold text-center text-text-primary-light dark:text-text-primary-dark w-1/5">
                  Cơ Bản
                </th>
                <th className="p-4 sm:p-5 font-bold text-center text-gold dark:text-gold-dark w-1/5 bg-gold/5 dark:bg-gold-dark/5">
                  Hội Viên Pro
                </th>
                <th className="p-4 sm:p-5 font-bold text-center text-purple dark:text-purple-dark w-1/5">
                  Chuyên Gia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
              {COMPARISON_FEATURES.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-surface-subtle-light/40 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 sm:p-4.5 text-text-primary-light dark:text-text-primary-dark font-medium">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                      {item.category}
                    </div>
                  </td>
                  <td className="p-4 sm:p-4.5 text-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? (
                        <Check className="h-4 w-4 text-good dark:text-good-dark mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-text-secondary-light/40 dark:text-text-secondary-dark/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                        {item.free}
                      </span>
                    )}
                  </td>
                  <td className="p-4 sm:p-4.5 text-center bg-gold/5 dark:bg-gold-dark/5 font-semibold">
                    {typeof item.pro === 'boolean' ? (
                      item.pro ? (
                        <Check className="h-4 w-4 text-good dark:text-good-dark mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-text-secondary-light/40 dark:text-text-secondary-dark/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-bold text-gold dark:text-gold-dark">{item.pro}</span>
                    )}
                  </td>
                  <td className="p-4 sm:p-4.5 text-center font-semibold">
                    {typeof item.expert === 'boolean' ? (
                      item.expert ? (
                        <Check className="h-4 w-4 text-good dark:text-good-dark mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-text-secondary-light/40 dark:text-text-secondary-dark/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-bold text-purple dark:text-purple-dark">{item.expert}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. FAQs Accordion ─────────────────────────────────────── */}
      <div className="space-y-6 pt-8 border-t border-border-light/60 dark:border-border-dark/60">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Giải đáp các thắc mắc về quyền lợi và chính sách sử dụng Lịch Việt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, idx) => (
            <Card
              key={idx}
              variant="default"
              className="p-5 border border-border-light/60 dark:border-border-dark/60 space-y-2 rounded-2xl"
            >
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-gold dark:text-gold-dark shrink-0 mt-0.5" />
                <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                  {faq.q}
                </h4>
              </div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed pl-6">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 5. Trust & Support Banner ─────────────────────────────── */}
      <Card variant="glass" className="p-8 text-center space-y-4 rounded-3xl border border-gold/30 dark:border-gold-dark/30">
        <div className="flex justify-center items-center gap-6 flex-wrap text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bảo mật dữ liệu sinh trắc 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Kích hoạt tự động tức thì</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-gold dark:text-gold-dark" />
            <span>Cam kết hoàn tiền trong 7 ngày</span>
          </div>
        </div>
      </Card>

      {/* ── 6. Checkout Modal (Simulated / QR Payment) ─────────────── */}
      {selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card
            variant="default"
            className="w-full max-w-md p-6 sm:p-7 rounded-3xl border border-border-light dark:border-border-dark shadow-2xl space-y-6 relative"
          >
            <button
              type="button"
              onClick={() => setSelectedTierForCheckout(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-dark">
                Xác Nhận Nâng Cấp
              </span>
              <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {selectedTierForCheckout.name}
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {billingInterval === 'yearly' ? 'Gói hàng năm (Tiết kiệm 20%)' : 'Gói hàng tháng'}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-surface-subtle-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Tổng thanh toán:
              </span>
              <span className="text-lg font-bold text-good dark:text-good-dark">
                {formatCurrency(
                  billingInterval === 'yearly'
                    ? selectedTierForCheckout.yearlyPrice
                    : selectedTierForCheckout.monthlyPrice,
                ).replace('₫', 'đ')}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Phương thức thanh toán:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('qr')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activePaymentMethod === 'qr'
                      ? 'border-gold bg-gold/10 text-gold dark:text-gold-dark'
                      : 'border-border-light dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span>VietQR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('momo')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activePaymentMethod === 'momo'
                      ? 'border-purple bg-purple/10 text-purple dark:text-purple-dark'
                      : 'border-border-light dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
                  }`}
                >
                  <Wallet className="h-5 w-5" />
                  <span>Ví MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activePaymentMethod === 'card'
                      ? 'border-info bg-info/10 text-info dark:text-info-dark'
                      : 'border-border-light dark:border-border-dark/60 text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle-light'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Thẻ Visa</span>
                </button>
              </div>
            </div>

            {/* Simulated Action */}
            <div className="space-y-2">
              <Button
                onClick={handleConfirmMockPayment}
                className="w-full py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md transition-all cursor-pointer"
              >
                Xác Nhận Thanh Toán & Kích Hoạt
              </Button>
              <p className="text-[11px] text-center text-text-secondary-light dark:text-text-secondary-dark">
                🔒 Giao dịch bảo mật chuẩn mã hóa SSL 256-bit
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── 7. Success Modal ─────────────────────────────────────── */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card
            variant="default"
            className="w-full max-w-sm p-6 text-center rounded-3xl border border-emerald-500/30 shadow-2xl space-y-4"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Đăng Ký Thành Công!
            </h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              Cảm ơn bạn đã đồng hành cùng Lịch Việt. Tài khoản của bạn đã được nâng cấp quyền lợi.
            </p>
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setSelectedTierForCheckout(null);
                navigate('/app/am-lich');
              }}
              className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
            >
              Trải Nghiệm Ngay
            </Button>
          </Card>
        </div>
      )}
    </MotionFadeIn>
  );
}
