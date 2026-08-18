import { computeAshtakoot } from '@lich-viet/core-logic';

export interface AshtakootItem {
  key: string;
  nameVi: string;
  nameSanskrit: string;
  maxScore: number;
  obtainedScore: number;
  areaVi: string;
  verdictVi: string;
}

export interface AshtakootDetailedResult {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  items: AshtakootItem[];
  overallVerdictVi: string;
}

const KOOTA_METAS: Record<string, { nameVi: string; nameSanskrit: string; maxScore: number; areaVi: string }> = {
  varna: {
    nameVi: 'Tâm Hồn & Bản Ngã',
    nameSanskrit: 'Varna',
    maxScore: 1,
    areaVi: 'Sự tương thích về vị thế tâm hồn và cái tôi cá nhân',
  },
  vashya: {
    nameVi: 'Sức Hút & Gắn Kết',
    nameSanskrit: 'Vashya',
    maxScore: 2,
    areaVi: 'Sự thu hút tự nhiên và mức độ kiểm soát, gắn bó',
  },
  tara: {
    nameVi: 'Vận May & Định Mệnh',
    nameSanskrit: 'Tara',
    maxScore: 3,
    areaVi: 'Sự may mắn và hỗ trợ lẫn nhau trong cuộc sống',
  },
  yoni: {
    nameVi: 'Hòa Hợp Thể Xác',
    nameSanskrit: 'Yoni',
    maxScore: 4,
    areaVi: 'Sự tương hợp về cảm xúc sinh lý và tình cảm gắn bó sâu sắc',
  },
  grahaMaitri: {
    nameVi: 'Tình Bạn & Thấu Hiểu',
    nameSanskrit: 'Graha Maitri',
    maxScore: 5,
    areaVi: 'Mức độ hòa hợp về tư duy, phong cách sống và tình bạn',
  },
  gana: {
    nameVi: 'Khí Chất & Tính Cách',
    nameSanskrit: 'Gana',
    maxScore: 6,
    areaVi: 'Sự hòa hợp giữa 3 nhóm khí chất: Thần (Deva), Người (Manushya), Quỷ (Rakshasa)',
  },
  bhakoot: {
    nameVi: 'Gia Đạo & Thịnh Vượng',
    nameSanskrit: 'Bhakoot',
    maxScore: 7,
    areaVi: 'Hạnh phúc hôn nhân, sự thịnh vượng kinh tế và gia đình hòa thuận',
  },
  nadi: {
    nameVi: 'Sức Khỏe & Con Cái',
    nameSanskrit: 'Nadi',
    maxScore: 8,
    areaVi: 'Gen di truyền, sức khỏe thể chất và sự tương hợp thế hệ sau',
  },
};

export function getDetailedAshtakoot(moonA: number, moonB: number): AshtakootDetailedResult {
  const raw = computeAshtakoot(moonA, moonB) as { score?: number; breakdown?: Record<string, number> } | null;
  const breakdown: Record<string, number> = raw && raw.breakdown ? raw.breakdown : {};

  const items: AshtakootItem[] = Object.keys(KOOTA_METAS).map((key) => {
    const meta = KOOTA_METAS[key];
    const score = typeof breakdown[key] === 'number' ? breakdown[key] : 0;
    const ratio = meta.maxScore > 0 ? score / meta.maxScore : 0;

    let verdictVi = 'Hoàn hảo';
    if (ratio === 0) verdictVi = 'Cần nỗ lực bù đắp';
    else if (ratio < 0.6) verdictVi = 'Trung bình';
    else if (ratio < 1) verdictVi = 'Tốt';

    return {
      key,
      nameVi: meta.nameVi,
      nameSanskrit: meta.nameSanskrit,
      maxScore: meta.maxScore,
      obtainedScore: score,
      areaVi: meta.areaVi,
      verdictVi,
    };
  });

  const total = typeof raw?.score === 'number' ? raw.score : items.reduce((acc, it) => acc + it.obtainedScore, 0);
  const percentage = Math.round((total / 36) * 100);

  let overallVerdictVi = 'Hôn nhân rất thuận hòa, nền tảng gắn kết bền chặt tuyệt vời.';
  if (total < 18) {
    overallVerdictVi = 'Điểm tương hợp dưới 18/36 — Nhiều khác biệt cần kiên nhẫn đối thoại và nỗ lực thấu hiểu.';
  } else if (total < 25) {
    overallVerdictVi = 'Điểm tương hợp khá (18-24/36) — Tương thích tốt ở nhiều mặt, cần lưu ý hòa hợp tính cách.';
  } else if (total < 32) {
    overallVerdictVi = 'Điểm tương hợp cao (25-31/36) — Rất tốt cho hôn nhân và sự nghiệp chung lâu dài.';
  }

  return {
    totalScore: total,
    maxScore: 36,
    percentage,
    items,
    overallVerdictVi,
  };
}
