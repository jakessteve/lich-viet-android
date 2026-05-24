/**
 * TestimonialSection — Social proof with rotating testimonials.
 * Features glassmorphic cards with real-feeling user quotes.
 */

import React, { useState, useEffect } from 'react';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string; // emoji as avatar
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Minh Tú',
    role: 'Nghiên cứu phong thủy',
    quote:
      'Gieo Quẻ Mai Hoa trên Lịch Việt giải quẻ rất chi tiết — Thể Dụng, Hỗ Quái đầy đủ. Tiện lợi hơn nhiều so với tra sách.',
    avatar: '🧑‍🎓',
  },
  {
    name: 'Hải Yến',
    role: 'Người dùng thường xuyên',
    quote: 'Mỗi sáng tôi đều mở Lịch Việt để xem giờ hoàng đạo và ngày âm. Giao diện đẹp, không quảng cáo — rất thích!',
    avatar: '👩‍💼',
  },
  {
    name: 'Quang Huy',
    role: 'Thầy phong thủy · 15 năm kinh nghiệm',
    quote:
      'Âm Lịch tính toán rất chuẩn xác. Tôi đã đối chiếu với lịch vạn niên — kết quả hoàn toàn khớp, kể cả tiết khí.',
    avatar: '🧙‍♂️',
  },
];

import MysticBackgroundPattern from './MysticBackgroundPattern';

const TestimonialSection: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-20 px-5 relative z-10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 dark:opacity-60 pointer-events-none z-0">
        <MysticBackgroundPattern variant="luoshu" />
      </div>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold dark:text-gold-dark mb-2">
            Cộng đồng
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Người dùng nói gì</h3>
        </div>

        {/* Testimonial Card */}
        <div className="relative min-h-[160px]">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`glass-card-strong p-6 sm:p-8 text-center transition-all duration-500 absolute inset-0 ${
                i === active
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <span className="text-4xl mb-4 block">{t.avatar}</span>
              <p className="text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark leading-relaxed mb-4 italic">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? 'bg-gold dark:bg-gold-dark w-6'
                  : 'bg-gray-300 dark:bg-white/15 hover:bg-gray-400 dark:hover:bg-white/25'
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(TestimonialSection);
