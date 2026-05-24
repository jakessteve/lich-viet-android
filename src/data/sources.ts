export type SourceConfidence = 'primary' | 'secondary' | 'derived';

export type SourceRecord = {
  sourceId: string;
  title: string;
  author: string;
  edition?: string;
  language: string;
  sourceType: string;
  notes?: string;
};

export type SourceRef = {
  sourceId: string;
  locator?: string;
  note?: string;
  confidence: SourceConfidence;
};

export const SOURCE_CATALOG: SourceRecord[] = [
  {
    sourceId: 'calendar-modern-vn',
    title: 'Modern Vietnamese lunar conversion rules',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Initial engine scope for modern Vietnam dates.',
  },
  {
    sourceId: 'calendar-can-chi',
    title: 'Can Chi helper tables',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Calendar labels and derived branches/stems.',
  },
  {
    sourceId: 'tuvi-core',
    title: 'Tử Vi core placement seeds',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Seed formulas for palace anchors and bureau mapping.',
  },
  {
    sourceId: 'tuvi-school-rules',
    title: 'Tử Vi multi-phái rule seeds',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Distinct Nam Phái, Bắc Phái, and Thiên Lương Phái offsets.',
  },
  {
    sourceId: 'tuvi-star-seed',
    title: 'Tử Vi star seed catalog',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Initial auxiliary and anchor star placements for the MVP chart.',
  },
  {
    sourceId: 'gieoque-core',
    title: 'Hoa Mai casting core rules',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Deterministic seed mapping for time-based and number-based casts.',
  },
  {
    sourceId: 'gieoque-trigrams',
    title: 'Hoa Mai trigram seed catalog',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Eight trigrams with lines, element labels, and display names.',
  },
  {
    sourceId: 'gieoque-hexagrams',
    title: 'Hoa Mai hexagram seed catalog',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Sixty-four generated hexagrams with upper and lower trigram mapping.',
  },
  {
    sourceId: 'gieoque-reading',
    title: 'Hoa Mai reading notes',
    author: 'Project SOT',
    edition: 'MVP',
    language: 'vi',
    sourceType: 'derived',
    notes: 'Neutral reading labels for thể, dụng, and line details.',
  },
];
