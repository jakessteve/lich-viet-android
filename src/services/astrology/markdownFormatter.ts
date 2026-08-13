import type { WesternChartResult, DignityResult, AspectResult } from './westernCalculator';

const SIGNS = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư',
];

const SIGN_EMOJI: Record<string, string> = {
  'Bạch Dương': '♈', 'Kim Ngưu': '♉', 'Song Tử': '♊', 'Cự Giải': '♋',
  'Sư Tử': '♌', 'Xử Nữ': '♍', 'Thiên Bình': '♎', 'Bọ Cạp': '♏',
  'Nhân Mã': '♐', 'Ma Kết': '♑', 'Bảo Bình': '♒', 'Song Ngư': '♓',
};

const PLANET_LABELS: Record<string, string> = {
  sun: 'Mặt Trời ☉', moon: 'Mặt Trăng ☽', mercury: 'Sao Thủy ☿',
  venus: 'Sao Kim ♀', mars: 'Sao Hỏa ♂', jupiter: 'Sao Mộc ♃', saturn: 'Sao Thổ ♄',
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'Hợp (0°)', opposition: 'Xung (180°)', trine: 'Tam Hợp (120°)',
  square: 'Vuông (90°)', sextile: 'Lục Hợp (60°)', quincunx: '150°',
  semisextile: 'Bán Lục Hợp (30°)', semisquare: 'Bán Vuông (45°)',
  sesquisquare: 'Sesqui-Vuông (135°)', quintile: 'Ngũ Phân (72°)',
  biquintile: 'Song Ngũ Phân (144°)',
};

const _DIGNITY_LABELS: Record<string, string> = {
  domicile: 'Cư (Domicile)', exaltation: 'Vượng (Exaltation)',
  detriment: 'Hãm (Detriment)', fall: 'Suy (Fall)',
};

const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

function formatDegMin(longitude: number): string {
  const deg = Math.floor(((longitude % 360) + 360) % 360 % 30);
  const min = Math.floor((((longitude % 360) + 360) % 360 % 30 - deg) * 60);
  return `${deg}°${min.toString().padStart(2, '0')}'`;
}

function formatDignities(dignities: DignityResult[]): string {
  const lines: string[] = ['## Cường Vị Hành Tinh (Dignities)', ''];
  lines.push('| Hành Tinh | Cư | Vượng | Hãm | Suy | Điểm |');
  lines.push('|-----------|-----|-------|------|-----|------|');

  for (const p of PLANET_ORDER) {
    const d = dignities.find((x) => x.body === p);
    if (!d) continue;
    const name = PLANET_LABELS[p] || p;
    const dom = d.domicile ? '✓' : '';
    const exa = d.exaltation ? '✓' : '';
    const det = d.detriment ? '✓' : '';
    const fal = d.fall ? '✓' : '';
    lines.push(`| ${name} | ${dom} | ${exa} | ${det} | ${fal} | ${d.dignityScore} |`);
  }
  return lines.join('\n');
}

function formatAspects(aspects: AspectResult[]): string {
  if (!aspects || aspects.length === 0) return '## Góc Chiếu\n\nKhông có góc chiếu đáng kể.';

  const major = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
  const lines: string[] = ['## Góc Chiếu Chính (Aspects)', ''];
  lines.push('| Hành Tinh A | Hành Tinh B | Góc Chiếu | Orb |');
  lines.push('|-------------|-------------|-----------|-----|');

  const majorAspects = aspects.filter((a) => major.includes(a.type));
  for (const a of majorAspects) {
    const labelA = PLANET_LABELS[a.planetA] || a.planetA;
    const labelB = PLANET_LABELS[a.planetB] || a.planetB;
    const label = ASPECT_LABELS[a.type] || a.type;
    lines.push(`| ${labelA} | ${labelB} | ${label} | ${Math.abs(a.orb).toFixed(1)}° |`);
  }

  const minorAspects = aspects.filter((a) => !major.includes(a.type));
  if (minorAspects.length > 0) {
    lines.push('');
    lines.push('### Góc Chiếu Phụ');
    lines.push('| Hành Tinh A | Hành Tinh B | Góc Chiếu | Orb |');
    lines.push('|-------------|-------------|-----------|-----|');
    for (const a of minorAspects) {
      const labelA = PLANET_LABELS[a.planetA] || a.planetA;
      const labelB = PLANET_LABELS[a.planetB] || a.planetB;
      const label = ASPECT_LABELS[a.type] || a.type;
      lines.push(`| ${labelA} | ${labelB} | ${label} | ${Math.abs(a.orb).toFixed(1)}° |`);
    }
  }
  return lines.join('\n');
}

function formatDispositorTree(tree: Record<string, { ruler: string; sign: string; dispositorSign?: string }> | null): string {
  if (!tree) return '';
  const lines: string[] = ['## Chuỗi Dispositor', ''];
  for (const [planet, data] of Object.entries(tree)) {
    const name = PLANET_LABELS[planet] || planet;
    lines.push(`- **${name}** → ${data.ruler} (${data.sign})${data.dispositorSign ? ` → dispositor tại ${data.dispositorSign}` : ''}`);
  }
  return lines.join('\n');
}

export function formatWesternChartAsMarkdown(result: WesternChartResult, system: 'western' | 'vedic' = 'western'): string {
  const parts: string[] = [];

  const title = system === 'vedic' ? '# Lá Số Chiêm Tinh Ấn Độ (Vedic Jyotish)' : '# Lá Số Chiêm Tinh Tây Phương';
  parts.push(title);

  // Basic info
  const ascSignIdx = Math.floor(((result.ascendant % 360) + 360) % 360 / 30);
  const ascSign = SIGNS[ascSignIdx];
  const mcSignIdx = Math.floor(((result.midheaven % 360) + 360) % 360 / 30);
  const mcSign = SIGNS[mcSignIdx];

  parts.push('');
  parts.push('## Thông Tin Cơ Bản');
  parts.push(`- **Ascendant (Cung Mọc):** ${formatDegMin(result.ascendant)} ${ascSign} ${SIGN_EMOJI[ascSign] || ''}`);
  parts.push(`- **Midheaven (Thiên Đỉnh):** ${formatDegMin(result.midheaven)} ${mcSign} ${SIGN_EMOJI[mcSign] || ''}`);
  parts.push(`- **Part of Fortune (Cung Mọc):** ${formatDegMin(result.partOfFortune.longitude)} ${result.partOfFortune.sign}`);
  if (result.chartShape) {
    parts.push(`- **Hình Dáng Lá Số:** ${result.chartShape.shape} (${result.chartShape.reason})`);
  }

  // Planets table
  parts.push('');
  if (system === 'vedic') {
    parts.push('## Vị Trí Hành Tinh (Sidereal Lahiri)');
  } else {
    parts.push('## Vị Trí Hành Tinh (Tropical)');
  }
  parts.push('');
  parts.push('| Hành Tinh | Cung | Độ | Nhà |');
  parts.push('|-----------|------|----|-----|');

  const sortedPlanets = [...result.planets].sort(
    (a, b) => PLANET_ORDER.indexOf(a.body) - PLANET_ORDER.indexOf(b.body)
  );

  for (const planet of sortedPlanets) {
    const name = PLANET_LABELS[planet.body] || planet.body;
    const emoji = SIGN_EMOJI[planet.sign] || '';
    const lon = system === 'vedic' ? planet.siderealLongitude : planet.tropicalLongitude;
    const signIdx = Math.floor(((lon % 360) + 360) % 360 / 30);
    const signName = SIGNS[signIdx];
    parts.push(`| ${name} | ${signName} ${emoji} | ${formatDegMin(lon)} | Nhà ${planet.house} |`);

    if (system === 'vedic' && planet.nakshatra) {
      parts.push(`|   ↳ Nakshatra: ${planet.nakshatra} (Pada ${(planet.pada || 0) + 1}) | | | |`);
    }
  }

  // Dignities
  parts.push('');
  parts.push(formatDignities(result.dignities));

  // Houses
  parts.push('');
  parts.push('## 12 Cung Địa Bàn (Porphyry)');
  parts.push('');
  parts.push('| Nhà | Kinh Độ | Cung |');
  parts.push('|-----|---------|------|');
  for (const house of result.houses) {
    const emoji = SIGN_EMOJI[house.sign] || '';
    parts.push(`| Nhà ${house.index} | ${formatDegMin(house.longitude)} | ${house.sign} ${emoji} |`);
  }

  // Aspects
  parts.push('');
  parts.push(formatAspects(result.aspects));

  // Dispositor tree
  const dispositorSection = formatDispositorTree(result.dispositorTree);
  if (dispositorSection) {
    parts.push('');
    parts.push(dispositorSection);
  }

  // Footer
  parts.push('');
  parts.push('---');
  parts.push(`*Lá số được tính toán bởi Lịch Việt — sử dụng Swiss Ephemeris + OMCE Core Logic.*`);

  return parts.join('\n');
}
