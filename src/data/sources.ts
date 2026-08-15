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
    sourceId: 'meeus-astronomical-algorithms',
    title: 'Astronomical Algorithms',
    author: 'Jean Meeus',
    edition: '2nd Edition (1998)',
    language: 'en',
    sourceType: 'primary',
    notes: 'Chapters 47 & 49: New Moon orbital perturbation series, Earth orbital calculations, solar longitude.',
  },
  {
    sourceId: 'espenak-meeus-deltat',
    title: 'Five Millennium Canon of Solar Eclipses: -1999 to +3000',
    author: 'Fred Espenak & Jean Meeus',
    edition: 'NASA/TP-2006-214141',
    language: 'en',
    sourceType: 'primary',
    notes: 'Piecewise polynomial approximation model for Delta T (TT - UT) across historical epochs.',
  },
  {
    sourceId: 'ho-ngoc-duc-lunar',
    title: 'Âm lịch Việt Nam và thuật toán tính lịch',
    author: 'TS. Hồ Ngọc Đức',
    edition: 'Hanoi, Vietnam',
    language: 'vi',
    sourceType: 'primary',
    notes: 'Vietnamese adaptation of astronomical lunisolar conversion based on UTC+7 (Hanoi meridian 105°E).',
  },
  {
    sourceId: 'reingold-dershowitz-calendrical',
    title: 'Calendrical Calculations',
    author: 'Edward M. Reingold & Nachum Dershowitz',
    edition: '3rd Edition (2008)',
    language: 'en',
    sourceType: 'primary',
    notes: 'Comprehensive mathematical foundation for solar, lunar, and Chinese/Vietnamese lunisolar calendars.',
  },
  {
    sourceId: 'hiep-ky-bien-phuong-thu',
    title: 'Khâm Định Hiệp Kỷ Biện Phương Thư (協紀辨方書)',
    author: 'Doãn Kế Thiện, Doãn Thái, Mai Cốc Thành (phụng chỉ Càn Long)',
    edition: 'Tứ Khố Toàn Thư Bản (1741)',
    language: 'lzh/vi',
    sourceType: 'primary',
    notes: 'Classic standard for Trạch Nhật (date selection): Thập Nhị Trực, Thần Sát (Cát/Hung), Hoàng Đạo/Hắc Đạo, Nhị Thập Bát Tú.',
  },
  {
    sourceId: 'ngoc-hap-thong-thu',
    title: 'Ngọc Hạp Thông Thư / Ngọc Hạp Ký (玉匣記)',
    author: 'Hứa Chân Quân (tương truyền)',
    edition: 'Truyền bản cổ văn khắc in',
    language: 'lzh/vi',
    sourceType: 'primary',
    notes: 'Trạch cát dụng sự dân gian, sao Cát Thần, Hung Thần bổ sung.',
  },
  {
    sourceId: 'tam-menh-thong-hoi',
    title: 'Tam Mệnh Thông Hội (三命通會)',
    author: 'Vạn Dân Anh (萬民英)',
    edition: 'Minh triều Gia Tĩnh bản',
    language: 'lzh/vi',
    sourceType: 'primary',
    notes: 'Lục Thập Hoa Giáp Nạp Âm ngũ hành và các trường hợp ngoại lệ sinh khắc (Kiếm Phong, Sa Trung, Đại Hải...).',
  },
  {
    sourceId: 'swiss-ephemeris',
    title: 'Swiss Ephemeris Professional Astronomical Engine',
    author: 'Dieter Koch, Alois Treindl (Astrodienst Zurich)',
    edition: 'Version 2.10 (Moshier & JPL DE431 based)',
    language: 'en',
    sourceType: 'primary',
    notes: 'High-precision sub-arcsecond planetary and lunar ephemeris computation.',
  },
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
