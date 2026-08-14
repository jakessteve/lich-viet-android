export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';
export type ZodiacModality = 'cardinal' | 'fixed' | 'mutable';

export interface ElementBalanceItem {
  key: ZodiacElement;
  nameVi: string;
  nameEn: string;
  color: string;
  points: number;
  percentage: number;
  planets: Array<{ id: string; nameVi: string; symbol: string }>;
  traitsVi: string;
}

export interface ModalityBalanceItem {
  key: ZodiacModality;
  nameVi: string;
  nameEn: string;
  color: string;
  points: number;
  percentage: number;
  planets: Array<{ id: string; nameVi: string; symbol: string }>;
  traitsVi: string;
}

export interface ElementModalityBalanceResult {
  elements: Record<ZodiacElement, ElementBalanceItem>;
  modalities: Record<ZodiacModality, ModalityBalanceItem>;
  dominantElement: ZodiacElement;
  dominantModality: ZodiacModality;
  dominantElementLabelVi: string;
  dominantModalityLabelVi: string;
  summaryVi: string;
}

const ELEMENT_INFO: Record<ZodiacElement, { nameVi: string; nameEn: string; color: string; traitsVi: string }> = {
  fire: { nameVi: 'Lửa', nameEn: 'Fire', color: '#E74C3C', traitsVi: 'Nhiệt huyết, tự tin, năng động và tiên phong' },
  earth: { nameVi: 'Đất', nameEn: 'Earth', color: '#27AE60', traitsVi: 'Thực tế, kiên định, trách nhiệm và vững vàng' },
  air: { nameVi: 'Khí', nameEn: 'Air', color: '#3498DB', traitsVi: 'Trí tuệ, giao tiếp, khách quan và kết nối' },
  water: { nameVi: 'Nước', nameEn: 'Water', color: '#8E44AD', traitsVi: 'Cảm xúc, trực giác, đồng cảm và thấu hiểu' },
};

const MODALITY_INFO: Record<ZodiacModality, { nameVi: string; nameEn: string; color: string; traitsVi: string }> = {
  cardinal: { nameVi: 'Thống Lĩnh', nameEn: 'Cardinal', color: '#D35400', traitsVi: 'Khởi xướng, định hướng và dẫn dắt' },
  fixed: { nameVi: 'Kiên Định', nameEn: 'Fixed', color: '#2980B9', traitsVi: 'Bền bỉ, tập trung và duy trì ổn định' },
  mutable: { nameVi: 'Biến Đổi', nameEn: 'Mutable', color: '#16A085', traitsVi: 'Linh hoạt, thích nghi và khéo léo biến hóa' },
};

// 0: Aries (Fire/Cardinal), 1: Taurus (Earth/Fixed), 2: Gemini (Air/Mutable), 3: Cancer (Water/Cardinal)
// 4: Leo (Fire/Fixed), 5: Virgo (Earth/Mutable), 6: Libra (Air/Cardinal), 7: Scorpio (Water/Fixed)
// 8: Sagittarius (Fire/Mutable), 9: Capricorn (Earth/Cardinal), 10: Aquarius (Air/Fixed), 11: Pisces (Water/Mutable)
const SIGN_ELEMENTS: readonly ZodiacElement[] = [
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water'
];

const SIGN_MODALITIES: readonly ZodiacModality[] = [
  'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable'
];

export interface BalanceCalculationPoint {
  id: string;
  nameVi: string;
  symbol: string;
  longitude: number;
  category?: string;
}

function getPointWeight(id: string): number {
  if (id.includes('sun') || id.includes('moon')) return 3;
  if (id.includes('ascendant') || id.includes('midheaven')) return 2;
  if (id.includes('mercury') || id.includes('venus') || id.includes('mars')) return 2;
  if (id.includes('jupiter') || id.includes('saturn')) return 1.5;
  if (id.includes('uranus') || id.includes('neptune') || id.includes('pluto')) return 1;
  return 1;
}

export function calculateElementModalityBalance(
  points: BalanceCalculationPoint[]
): ElementModalityBalanceResult {
  const elemPoints: Record<ZodiacElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modPoints: Record<ZodiacModality, number> = { cardinal: 0, fixed: 0, mutable: 0 };

  const elemPlanets: Record<ZodiacElement, Array<{ id: string; nameVi: string; symbol: string }>> = {
    fire: [], earth: [], air: [], water: [],
  };
  const modPlanets: Record<ZodiacModality, Array<{ id: string; nameVi: string; symbol: string }>> = {
    cardinal: [], fixed: [], mutable: [],
  };

  let totalElemWeight = 0;
  let totalModWeight = 0;

  points.forEach((pt) => {
    const signIdx = Math.floor((((pt.longitude % 360) + 360) % 360) / 30);
    const elem = SIGN_ELEMENTS[signIdx];
    const mod = SIGN_MODALITIES[signIdx];
    const w = getPointWeight(pt.id);

    elemPoints[elem] += w;
    modPoints[mod] += w;
    totalElemWeight += w;
    totalModWeight += w;

    elemPlanets[elem].push({ id: pt.id, nameVi: pt.nameVi, symbol: pt.symbol });
    modPlanets[mod].push({ id: pt.id, nameVi: pt.nameVi, symbol: pt.symbol });
  });

  const safeTotalElem = totalElemWeight > 0 ? totalElemWeight : 1;
  const safeTotalMod = totalModWeight > 0 ? totalModWeight : 1;

  const elements = {} as Record<ZodiacElement, ElementBalanceItem>;
  (Object.keys(ELEMENT_INFO) as ZodiacElement[]).forEach((el) => {
    elements[el] = {
      key: el,
      nameVi: ELEMENT_INFO[el].nameVi,
      nameEn: ELEMENT_INFO[el].nameEn,
      color: ELEMENT_INFO[el].color,
      points: Math.round(elemPoints[el] * 10) / 10,
      percentage: Math.round((elemPoints[el] / safeTotalElem) * 100),
      planets: elemPlanets[el],
      traitsVi: ELEMENT_INFO[el].traitsVi,
    };
  });

  const modalities = {} as Record<ZodiacModality, ModalityBalanceItem>;
  (Object.keys(MODALITY_INFO) as ZodiacModality[]).forEach((mo) => {
    modalities[mo] = {
      key: mo,
      nameVi: MODALITY_INFO[mo].nameVi,
      nameEn: MODALITY_INFO[mo].nameEn,
      color: MODALITY_INFO[mo].color,
      points: Math.round(modPoints[mo] * 10) / 10,
      percentage: Math.round((modPoints[mo] / safeTotalMod) * 100),
      planets: modPlanets[mo],
      traitsVi: MODALITY_INFO[mo].traitsVi,
    };
  });

  // Find dominants
  let dominantElement: ZodiacElement = 'fire';
  let maxElemVal = -1;
  (Object.keys(elements) as ZodiacElement[]).forEach((k) => {
    if (elements[k].points > maxElemVal) {
      maxElemVal = elements[k].points;
      dominantElement = k;
    }
  });

  let dominantModality: ZodiacModality = 'cardinal';
  let maxModVal = -1;
  (Object.keys(modalities) as ZodiacModality[]).forEach((k) => {
    if (modalities[k].points > maxModVal) {
      maxModVal = modalities[k].points;
      dominantModality = k;
    }
  });

  const dominantElementLabelVi = `${ELEMENT_INFO[dominantElement].nameVi} (${elements[dominantElement].percentage}%)`;
  const dominantModalityLabelVi = `${MODALITY_INFO[dominantModality].nameVi} (${modalities[dominantModality].percentage}%)`;

  const summaryVi = `Tính cách thiên hướng nổi trội về năng lượng ${ELEMENT_INFO[dominantElement].nameVi} kết hợp phong thái ${MODALITY_INFO[dominantModality].nameVi}. ${ELEMENT_INFO[dominantElement].traitsVi}, đồng thời ${MODALITY_INFO[dominantModality].traitsVi.toLowerCase()}.`;

  return {
    elements,
    modalities,
    dominantElement,
    dominantModality,
    dominantElementLabelVi,
    dominantModalityLabelVi,
    summaryVi,
  };
}
