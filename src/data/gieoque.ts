import type { SourceRef } from './sources';

export type TrigramElement = 'Mộc' | 'Hỏa' | 'Thổ' | 'Kim' | 'Thủy';

export type GieoQueLineValue = 0 | 1;

export type GieoQueTrigram = {
  trigramId: string;
  code: string;
  name: string;
  hanVietName: string;
  element: TrigramElement;
  lines: [GieoQueLineValue, GieoQueLineValue, GieoQueLineValue];
  description: string;
  sourceRefs: SourceRef[];
};

export type GieoQueHexagram = {
  hexagramId: string;
  hexagramNumber: number;
  code: string;
  upperTrigramId: string;
  lowerTrigramId: string;
  vietnameseName: string;
  hanVietName: string;
  element: TrigramElement;
  sourceRefs: SourceRef[];
};

export const GIEOQUE_SOURCE_REFS: Record<'core' | 'trigrams' | 'hexagrams' | 'reading', SourceRef> = {
  core: {
    sourceId: 'gieoque-core',
    note: 'Deterministic seed mapping for time-based and number-based casts',
    confidence: 'derived',
  },
  trigrams: {
    sourceId: 'gieoque-trigrams',
    note: 'Eight trigrams with lines, element labels, and display names',
    confidence: 'derived',
  },
  hexagrams: {
    sourceId: 'gieoque-hexagrams',
    note: 'Sixty-four generated hexagrams with upper and lower trigram mapping',
    confidence: 'derived',
  },
  reading: {
    sourceId: 'gieoque-reading',
    note: 'Neutral reading labels for thể, dụng, and line details',
    confidence: 'derived',
  },
};

export const TRIGRAMS: GieoQueTrigram[] = [
  {
    trigramId: 'qian',
    code: '111',
    name: 'Càn',
    hanVietName: 'Càn',
    element: 'Kim',
    lines: [1, 1, 1],
    description: 'Trời, sáng, cương kiện.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'dui',
    code: '110',
    name: 'Đoài',
    hanVietName: 'Đoài',
    element: 'Kim',
    lines: [0, 1, 1],
    description: 'Đầm, vui, linh hoạt.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'li',
    code: '101',
    name: 'Ly',
    hanVietName: 'Ly',
    element: 'Hỏa',
    lines: [1, 0, 1],
    description: 'Lửa, sáng rõ, bám vào.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'zhen',
    code: '100',
    name: 'Chấn',
    hanVietName: 'Chấn',
    element: 'Mộc',
    lines: [0, 0, 1],
    description: 'Sấm, khởi động, chấn động.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'xun',
    code: '011',
    name: 'Tốn',
    hanVietName: 'Tốn',
    element: 'Mộc',
    lines: [1, 1, 0],
    description: 'Gió, thấm, len lỏi.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'kan',
    code: '010',
    name: 'Khảm',
    hanVietName: 'Khảm',
    element: 'Thủy',
    lines: [0, 1, 0],
    description: 'Nước, sâu, thích ứng.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'gen',
    code: '001',
    name: 'Cấn',
    hanVietName: 'Cấn',
    element: 'Thổ',
    lines: [1, 0, 0],
    description: 'Núi, dừng lại, định tâm.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
  {
    trigramId: 'kun',
    code: '000',
    name: 'Khôn',
    hanVietName: 'Khôn',
    element: 'Thổ',
    lines: [0, 0, 0],
    description: 'Đất, tiếp nhận, nuôi dưỡng.',
    sourceRefs: [GIEOQUE_SOURCE_REFS.trigrams],
  },
];

function findTrigramOrThrow(lines: [GieoQueLineValue, GieoQueLineValue, GieoQueLineValue]) {
  const code = lines.join('');
  const trigram = TRIGRAMS.find((entry) => entry.code === code);
  if (!trigram) {
    throw new Error(`Unknown trigram code: ${code}`);
  }

  return trigram;
}

const hexagrams: GieoQueHexagram[] = [];

for (let upperIndex = 0; upperIndex < TRIGRAMS.length; upperIndex += 1) {
  for (let lowerIndex = 0; lowerIndex < TRIGRAMS.length; lowerIndex += 1) {
    const upper = TRIGRAMS[upperIndex];
    const lower = TRIGRAMS[lowerIndex];
    const code = `${upper.code}${lower.code}`;
    hexagrams.push({
      hexagramId: `${upper.trigramId}-${lower.trigramId}`,
      hexagramNumber: hexagrams.length + 1,
      code,
      upperTrigramId: upper.trigramId,
      lowerTrigramId: lower.trigramId,
      vietnameseName: `${upper.name} trên ${lower.name}`,
      hanVietName: `${upper.hanVietName} Thượng ${lower.hanVietName} Hạ`,
      element: upper.element,
      sourceRefs: [GIEOQUE_SOURCE_REFS.hexagrams, GIEOQUE_SOURCE_REFS.trigrams],
    });
  }
}

export const HEXAGRAMS = hexagrams;

export const HEXAGRAM_LOOKUP = new Map<string, GieoQueHexagram>(
  HEXAGRAMS.map((hexagram) => [`${hexagram.upperTrigramId}:${hexagram.lowerTrigramId}`, hexagram]),
);

export function getTrigramByLines(lines: [GieoQueLineValue, GieoQueLineValue, GieoQueLineValue]) {
  return findTrigramOrThrow(lines);
}

export function getHexagram(upper: GieoQueTrigram, lower: GieoQueTrigram) {
  const hexagram = HEXAGRAM_LOOKUP.get(`${upper.trigramId}:${lower.trigramId}`);
  if (!hexagram) {
    throw new Error(`Unknown hexagram: ${upper.trigramId}/${lower.trigramId}`);
  }

  return hexagram;
}
