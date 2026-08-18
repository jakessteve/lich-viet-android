import { calculateHuberAgePoint, detectHuberAspectFigures } from '@lich-viet/core-logic';
import type { SwissNatalChartResult } from './swissNatalChart';

export interface HuberAnalysisResult {
  agePoint: {
    ageYears: number;
    cycle: number;
    houseNumber: number;
    progressPercent: number;
    apLongitude: number;
    zone: string;
    zoneDescription: string;
    activeAspects: Array<{
      planet: string;
      aspect: string;
      orb: number;
      energy: string;
      insight: string;
    }>;
  };
  figures: Array<{
    id: string;
    name: string;
    category: string;
    colorType: string;
    planets: string[];
    description: string;
  }>;
  colorBalance: {
    redCount: number;
    blueCount: number;
    greenCount: number;
    dominantEnergy: string;
    interpretation: string;
  };
}

export function analyzeHuberChart(natalResult: SwissNatalChartResult, currentAgeYears: number): HuberAnalysisResult {
  const cusps = natalResult.houses.map((h) => h.longitude);
  const planets = natalResult.objects.map((o) => ({ body: o.nameVi, tropicalLongitude: o.longitude }));

  // 1. Age Point Progression
  const agePoint = calculateHuberAgePoint(currentAgeYears, cusps, planets) as HuberAnalysisResult['agePoint'];

  // 2. Aspect Figures
  const figures = detectHuberAspectFigures(
    planets,
    natalResult.aspects.map((a) => ({
      id: a.id,
      planetA: a.objectAName,
      planetB: a.objectBName,
      type: a.id,
    })),
  ) as HuberAnalysisResult['figures'];

  // 3. Color Polarity Balance
  let redCount = 0;
  let blueCount = 0;
  let greenCount = 0;

  natalResult.aspects.forEach((asp) => {
    if (['conjunction', 'square', 'opposition', 'semi-square', 'sesquiquadrate'].includes(asp.id)) {
      redCount++;
    } else if (['trine', 'sextile'].includes(asp.id)) {
      blueCount++;
    } else if (['quincunx', 'semi-sextile'].includes(asp.id)) {
      greenCount++;
    }
  });

  let dominantEnergy = 'Cân bằng Đa Sắc (Balanced)';
  let interpretation =
    'Lá số sở hữu sự phối hợp hài hòa giữa động lực hành động, tài năng sẵn có và tâm thức tìm kiếm ý nghĩa.';

  if (redCount > blueCount && redCount > greenCount) {
    dominantEnergy = 'Đỏ - Động Lực & Vượt Khó (Dynamic Action)';
    interpretation =
      'Chủ đạo là năng lượng đỏ: bạn là người kiên cường, ưa thử thách, không ngại xung đột và luôn muốn kiến tạo thực tại bằng ý chí.';
  } else if (blueCount > redCount && blueCount > greenCount) {
    dominantEnergy = 'Xanh Dương - Tài Năng & Hài Hòa (Talent & Harmony)';
    interpretation =
      'Chủ đạo là năng lượng xanh dương: bạn sở hữu khiếu thẩm mỹ, sự uyển chuyển, dễ thu hút quý nhân và phát huy tài năng tự nhiên.';
  } else if (greenCount > redCount && greenCount > blueCount) {
    dominantEnergy = 'Xanh Lá - Tâm Thức & Khai Phóng (Consciousness & Search)';
    interpretation =
      'Chủ đạo là năng lượng xanh lá: bạn là người giàu trực giác, luôn trăn trở tìm tòi chiều sâu triết lý, tâm linh và thấu cảm con người.';
  }

  return {
    agePoint,
    figures,
    colorBalance: {
      redCount,
      blueCount,
      greenCount,
      dominantEnergy,
      interpretation,
    },
  };
}
