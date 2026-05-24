/**
 * FAQIntentCards — Horizontal-scroll FAQ intent cards
 * Each card launches a specific Dụng Sự flow (synastry, date selection, funeral, etc.)
 */

import React from 'react';

export type FAQIntent = 'chon-ngay-cuoi' | 'tang-le' | 'nha-cua' | 'tai-chinh' | 'cong-viec' | 'xem-ngay';

interface FAQCard {
  id: FAQIntent;
  icon: string;
  title: string;
  desc: string;
  needsSecondPerson: boolean;
}

const FAQ_CARDS: FAQCard[] = [
  { id: 'chon-ngay-cuoi', icon: '🏠', title: 'Chọn ngày cưới', desc: 'Ngày tốt cho đám cưới', needsSecondPerson: true },
  { id: 'tang-le', icon: '🕯️', title: 'Tang lễ', desc: 'Kiểm tra nhập mộ an toàn', needsSecondPerson: false },
  { id: 'nha-cua', icon: '🏘️', title: 'Nhà cửa', desc: 'Động thổ, nhập trạch, sửa chữa', needsSecondPerson: false },
  { id: 'tai-chinh', icon: '💰', title: 'Tài chính', desc: 'Ký hợp đồng, giao dịch', needsSecondPerson: false },
  { id: 'cong-viec', icon: '💼', title: 'Công việc', desc: 'Khai trương, nhậm chức', needsSecondPerson: false },
  {
    id: 'xem-ngay',
    icon: '📅',
    title: 'Xem ngày tổng hợp',
    desc: 'Chọn ngày cho mọi hoạt động',
    needsSecondPerson: false,
  },
];

interface FAQIntentCardsProps {
  selectedIntent: FAQIntent | null;
  onSelectIntent: (intent: FAQIntent) => void;
}

const FAQIntentCards: React.FC<FAQIntentCardsProps> = ({ selectedIntent, onSelectIntent }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {FAQ_CARDS.map((card) => {
          const isActive = selectedIntent === card.id;
          return (
            <button
              key={card.id}
              onClick={() => onSelectIntent(card.id)}
              className={`flex flex-col items-center justify-center text-center p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-sm ${
                isActive
                  ? 'bg-gold/10 dark:bg-gold-dark/10 border-gold/40 dark:border-gold-dark/40 ring-1 ring-gold/20 dark:ring-gold-dark/20 shadow-sm'
                  : 'bg-white dark:bg-white/[0.03] border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-1.5 transition-transform duration-200 group-hover:scale-110">
                {card.icon}
              </span>
              <span
                className={`text-xs font-semibold leading-tight ${
                  isActive ? 'text-gold dark:text-gold-dark' : 'text-text-primary-light dark:text-text-primary-dark'
                }`}
              >
                {card.title}
              </span>
              <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-tight">
                {card.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { FAQ_CARDS };
export default FAQIntentCards;
