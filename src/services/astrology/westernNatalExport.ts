import type { SwissNatalAspect, SwissNatalChartResult, SwissNatalObject } from './swissNatalChart';

export type WesternNatalTheme = 'light' | 'dark';
export interface WesternNatalRenderOptions {
  theme?: WesternNatalTheme;
  size?: number;
}

interface WesternNatalPalette {
  background: string;
  ink: string;
  muted: string;
  outer: string;
  zodiacA: string;
  zodiacB: string;
  houseA: string;
  houseB: string;
  houseLine: string;
  gold: string;
  leader: string;
  metadata: string;
}

export const WESTERN_NATAL_PALETTES: Record<WesternNatalTheme, WesternNatalPalette> = {
  light: {
    background: '#FBFAF7',
    ink: '#292A33',
    muted: '#666976',
    outer: '#315F8B',
    zodiacA: '#75658D',
    zodiacB: '#89779D',
    houseA: '#F7F2E8',
    houseB: '#EEE8DD',
    houseLine: '#B7AD9F',
    gold: '#A77831',
    leader: '#768291',
    metadata: '#EEE9DF',
  },
  dark: {
    background: '#151722',
    ink: '#F4F0E8',
    muted: '#B9BBC6',
    outer: '#76A5CF',
    zodiacA: '#514663',
    zodiacB: '#625471',
    houseA: '#202330',
    houseB: '#292B39',
    houseLine: '#686A78',
    gold: '#D7B267',
    leader: '#929BAB',
    metadata: '#222532',
  },
};

const VIEWBOX_SIZE = 1000;
const CENTER = VIEWBOX_SIZE / 2;
const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const SIGN_NAMES_VI = [
  'Bạch Dương',
  'Kim Ngưu',
  'Song Tử',
  'Cự Giải',
  'Sư Tử',
  'Xử Nữ',
  'Thiên Bình',
  'Bọ Cạp',
  'Nhân Mã',
  'Ma Kết',
  'Bảo Bình',
  'Song Ngư',
];
// Small, self-contained vector marks keep exports readable when a host lacks
// the Unicode astrology font. They are intentionally distinct by object
// family rather than a single generic placeholder.
const SYMBOL_PATHS: Record<string, string> = {
  'planet:sun': 'M0-5A5 5 0 1 0 0 5A5 5 0 1 0 0-5M0-8V8M-8 0H8',
  'planet:moon': 'M4-7A8 8 0 1 0 4 7A6 6 0 1 1 4-7',
  'planet:mercury': 'M0-7V7M-5-2H5M-3-5A3 3 0 1 0 3-5A3 3 0 1 0-3-5',
  'planet:venus': 'M0-2V8M-5 4H5M0-2A4 4 0 1 0 0-10A4 4 0 0 0 0-2',
  'planet:mars': 'M-2 2A4 4 0 1 1 2-2M1-1L7-7M3-7H7V-3',
  'planet:jupiter': 'M-3-8V8M3-8V8M-7-3H7M-7 3H7',
  'planet:saturn': 'M3-8L-2 8M-5-3H4A4 4 0 1 0 0 3H-4',
  'planet:uranus': 'M-6-6V6M0-8V8M6-6V6M-6-4H6M-6 4H6',
  'planet:neptune': 'M-6-7L0 0 6-7M0 0V8M-5 8H5',
  'planet:pluto': 'M0-8V8M-5-4A5 5 0 1 0 5-4A5 5 0 1 0-5-4M-5 5H5',
  'centaur:chiron': 'M-5 6L0-8 5 6M-3 1H3',
  'lunar-point:mean-lilith': 'M0-8V8M-5-3H5M-3-8L0-3 3-8',
  'lunar-point:true-north-node': 'M-5 5L0-6 5 5M-3 0H3',
  'derived:true-south-node': 'M-5-5L0 6 5-5M-3 0H3',
  'derived:part-of-fortune': 'M0-7A7 7 0 1 0 0 7A7 7 0 1 0 0-7M-4 0H4M0-4V4',
  'angle:vertex': 'M-6-6L0 6 6-6M-3 0H3',
  'asteroid:ceres': 'M0-7A6 6 0 1 0 0 5A4 4 0 1 1 0-3M-5 4H5',
  'asteroid:pallas': 'M0-8V8M-5-3H5M-4-7L0-3 4-7',
  'asteroid:juno': 'M0-7V8M-4-4H4M-4-7A4 4 0 1 0 4-7',
  'asteroid:vesta': 'M0-8L5 7M0-8L-5 7M-3 2H3',
};

function normalize(value: number): number {
  return ((value % 360) + 360) % 360;
}

function finite(value: number): string {
  if (!Number.isFinite(value)) throw new Error('Western natal SVG geometry must be finite');
  return Number(value.toFixed(4)).toString();
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function chartAngle(longitude: number, ascendant: number): number {
  return 180 + normalize(longitude - ascendant);
}

function point(angle: number, radius: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER + Math.sin(radians) * radius,
  };
}

function annularSector(startAngle: number, span: number, innerRadius: number, outerRadius: number): string {
  const outerStart = point(startAngle, outerRadius);
  const outerEnd = point(startAngle + span, outerRadius);
  const innerEnd = point(startAngle + span, innerRadius);
  const innerStart = point(startAngle, innerRadius);
  const largeArc = span > 180 ? 1 : 0;
  return [
    `M ${finite(outerStart.x)} ${finite(outerStart.y)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${finite(outerEnd.x)} ${finite(outerEnd.y)}`,
    `L ${finite(innerEnd.x)} ${finite(innerEnd.y)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${finite(innerStart.x)} ${finite(innerStart.y)}`,
    'Z',
  ].join(' ');
}

function objectById(result: SwissNatalChartResult): Map<string, SwissNatalObject> {
  return new Map(result.objects.map((object) => [object.id, object]));
}

function renderAspect(aspect: SwissNatalAspect, objects: Map<string, SwissNatalObject>, ascendant: number): string {
  const first = objects.get(aspect.objectAId);
  const second = objects.get(aspect.objectBId);
  if (!first || !second) return '';
  const firstPoint = point(chartAngle(first.longitude, ascendant), 250);
  const secondPoint = point(chartAngle(second.longitude, ascendant), 250);
  const common = `data-role="aspect" data-aspect-type="${escapeXml(aspect.id)}" data-object-a="${escapeXml(first.id)}" data-object-b="${escapeXml(second.id)}"`;
  if (aspect.id === 'conjunction') {
    const signedDifference = ((second.longitude - first.longitude + 540) % 360) - 180;
    const midpointLongitude = normalize(first.longitude + signedDifference / 2);
    const markerAngle = chartAngle(midpointLongitude, ascendant);
    const marker = point(markerAngle, 250);
    return `<g ${common}><circle data-role="conjunction-marker" data-midpoint-longitude="${finite(midpointLongitude)}" cx="${finite(marker.x)}" cy="${finite(marker.y)}" r="7" fill="none" stroke="${escapeXml(aspect.color)}" stroke-width="${finite(Math.max(2, aspect.width * 1.6))}" opacity="${finite(aspect.opacity)}"/><circle cx="${finite(marker.x)}" cy="${finite(marker.y)}" r="2.4" fill="${escapeXml(aspect.color)}"/></g>`;
  }
  const dash = aspect.dashPattern === 'solid' ? '' : ` stroke-dasharray="${escapeXml(aspect.dashPattern)}"`;
  return `<g ${common}><line x1="${finite(firstPoint.x)}" y1="${finite(firstPoint.y)}" x2="${finite(secondPoint.x)}" y2="${finite(secondPoint.y)}" stroke="${escapeXml(aspect.color)}" stroke-width="${finite(aspect.width)}" opacity="${finite(aspect.opacity * 0.72)}"${dash}/></g>`;
}

interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function boxesOverlap(first: LabelBox, second: LabelBox): boolean {
  const gap = 2;
  return !(
    first.x + first.width + gap <= second.x ||
    second.x + second.width + gap <= first.x ||
    first.y + first.height + gap <= second.y ||
    second.y + second.height + gap <= first.y
  );
}

function renderObjects(result: SwissNatalChartResult, palette: WesternNatalPalette): string {
  const ascendant = result.angles.Ascendant.longitude;
  const sorted = result.objects
    .map((object, index) => ({ object, index, angle: normalize(chartAngle(object.longitude, ascendant)) }))
    .sort((first, second) => first.angle - second.angle || first.index - second.index);
  const placed: LabelBox[] = [];
  return sorted
    .map(({ object, angle }) => {
      const position = `${SIGN_SYMBOLS[Math.floor(object.longitude / 30)]} ${object.degree}°${object.minute.toString().padStart(2, '0')}′${object.retrograde ? ' Rx' : ''}`;
      const width = Math.max(82, Math.min(174, Math.max(object.nameVi.length + 3, position.length) * 5.7));
      const height = 25;
      const offsets = [0, ...Array.from({ length: 12 }, (_, index) => [4 * (index + 1), -4 * (index + 1)]).flat()];
      let placement: { angle: number; radius: number; box: LabelBox; onRight: boolean } | undefined;
      for (const radius of [318, 338, 358, 378]) {
        for (const offsetAngle of offsets) {
          const displayAngle = angle + offsetAngle;
          const labelPoint = point(displayAngle, radius);
          const onRight = Math.cos((displayAngle * Math.PI) / 180) >= 0;
          const box = {
            x: onRight ? labelPoint.x + 7 : labelPoint.x - 7 - width,
            y: labelPoint.y - 13,
            width,
            height,
          };
          if (box.x < 5 || box.y < 5 || box.x + box.width > 995 || box.y + box.height > 995) continue;
          if (placed.every((existing) => !boxesOverlap(existing, box))) {
            placement = { angle: displayAngle, radius, box, onRight };
            break;
          }
        }
        if (placement) break;
      }
      if (!placement) throw new Error(`Western natal label layout could not place ${object.id}`);
      placed.push(placement.box);
      const truePoint = point(angle, 267);
      const leaderEnd = point(placement.angle, placement.radius - 12);
      const label = point(placement.angle, placement.radius);
      const anchor = placement.onRight ? 'start' : 'end';
      const offset = placement.onRight ? 7 : -7;
      return `<g data-role="object" data-object-id="${escapeXml(object.id)}" data-category="${escapeXml(object.category)}" data-house="${object.house}" data-track="${placement.radius}" data-bbox-x="${finite(placement.box.x)}" data-bbox-y="${finite(placement.box.y)}" data-bbox-width="${finite(placement.box.width)}" data-bbox-height="${finite(placement.box.height)}">
      <line data-role="true-position-leader" x1="${finite(truePoint.x)}" y1="${finite(truePoint.y)}" x2="${finite(leaderEnd.x)}" y2="${finite(leaderEnd.y)}" stroke="${palette.leader}" stroke-width="0.8" opacity="0.72"/>
      <circle cx="${finite(truePoint.x)}" cy="${finite(truePoint.y)}" r="2.1" fill="${palette.ink}"/>
      <use data-role="symbol-path-fallback" data-symbol-id="${escapeXml(object.id)}" href="#natal-symbol-${escapeXml(object.id.replaceAll(':', '-'))}" transform="translate(${finite(label.x)} ${finite(label.y - 5)})" fill="none" stroke="${palette.ink}" stroke-width="0.8"/>
      <text x="${finite(label.x + offset)}" y="${finite(label.y - 1)}" text-anchor="${anchor}" fill="${palette.ink}" font-size="11" font-weight="650"><tspan>${escapeXml(object.symbol)} ${escapeXml(object.nameVi)}</tspan><tspan x="${finite(label.x + offset)}" dy="12" fill="${palette.muted}" font-size="9.5">${escapeXml(position)}</tspan></text>
    </g>`;
    })
    .join('');
}

function renderPrimaryAngles(result: SwissNatalChartResult, palette: WesternNatalPalette): string {
  const ascendant = result.angles.Ascendant.longitude;
  return Object.values(result.angles)
    .map((angle) => {
      const screenAngle = chartAngle(angle.longitude, ascendant);
      const end = point(screenAngle, 468);
      const label = point(screenAngle, 231);
      const width = angle.id === 'angle:ascendant' ? 2.8 : 1.4;
      return `<g data-role="primary-angle" data-angle-id="${escapeXml(angle.id)}">
      <line x1="${CENTER}" y1="${CENTER}" x2="${finite(end.x)}" y2="${finite(end.y)}" stroke="${palette.outer}" stroke-width="${width}" opacity="0.94"/>
      <text x="${finite(label.x)}" y="${finite(label.y)}" text-anchor="middle" dominant-baseline="middle" fill="${palette.ink}" font-size="10" font-weight="750">${escapeXml(angle.symbol)} · ${SIGN_SYMBOLS[Math.floor(angle.longitude / 30)]} ${angle.degree}°${angle.minute.toString().padStart(2, '0')}′</text>
    </g>`;
    })
    .join('');
}

function renderZodiac(result: SwissNatalChartResult, palette: WesternNatalPalette): string {
  const ascendant = result.angles.Ascendant.longitude;
  return SIGN_SYMBOLS.map((symbol, index) => {
    const startAngle = chartAngle(index * 30, ascendant);
    const label = point(startAngle + 15, 443);
    return `<g data-role="zodiac-sign" data-sign-index="${index}"><path d="${annularSector(startAngle, 30, 417, 469)}" fill="${index % 2 === 0 ? palette.zodiacA : palette.zodiacB}" stroke="${palette.background}" stroke-width="1"/><text x="${finite(label.x)}" y="${finite(label.y - 3)}" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF" font-size="22">${symbol}</text><text x="${finite(label.x)}" y="${finite(label.y + 13)}" text-anchor="middle" fill="#FFFFFF" font-size="7.5">${escapeXml(SIGN_NAMES_VI[index])}</text></g>`;
  }).join('');
}

function renderHouses(result: SwissNatalChartResult, palette: WesternNatalPalette): string {
  const ascendant = result.angles.Ascendant.longitude;
  return result.houses
    .map((house, index) => {
      const next = result.houses[(index + 1) % result.houses.length];
      const span = normalize(next.longitude - house.longitude) || 30;
      const startAngle = chartAngle(house.longitude, ascendant);
      const cuspInner = point(startAngle, 250);
      const cuspOuter = point(startAngle, 416);
      const label = point(startAngle + span / 2, 386);
      return `<g data-role="house" data-house="${house.number}"><path d="${annularSector(startAngle, span, 250, 416)}" fill="${index % 2 === 0 ? palette.houseA : palette.houseB}"/><line x1="${finite(cuspInner.x)}" y1="${finite(cuspInner.y)}" x2="${finite(cuspOuter.x)}" y2="${finite(cuspOuter.y)}" stroke="${palette.houseLine}" stroke-width="${house.number === 1 ? 1.8 : 0.8}"/><text x="${finite(label.x)}" y="${finite(label.y)}" text-anchor="middle" dominant-baseline="middle" fill="${palette.gold}" font-size="12" font-weight="750">${house.number}</text></g>`;
    })
    .join('');
}

function renderTicks(palette: WesternNatalPalette): string {
  return Array.from({ length: 360 }, (_, index) => {
    const angle = index;
    const inner = point(angle, index % 30 === 0 ? 399 : index % 5 === 0 ? 404 : 409);
    const outer = point(angle, 416);
    const halfInner = point(angle + 0.5, 412);
    const halfOuter = point(angle + 0.5, 416);
    return `<line data-role="degree-tick" data-degree="${index}" x1="${finite(inner.x)}" y1="${finite(inner.y)}" x2="${finite(outer.x)}" y2="${finite(outer.y)}" stroke="${palette.outer}" stroke-width="${index % 30 === 0 ? 1.15 : 0.45}" opacity="0.72"/><line data-role="half-degree-tick" data-degree="${index}" x1="${finite(halfInner.x)}" y1="${finite(halfInner.y)}" x2="${finite(halfOuter.x)}" y2="${finite(halfOuter.y)}" stroke="${palette.outer}" stroke-width="0.3" opacity="0.38"/>`;
  }).join('');
}

function validateOptions(options: WesternNatalRenderOptions): { theme: WesternNatalTheme; size: number } {
  const theme = options.theme ?? 'light';
  const size = options.size ?? 900;
  if (theme !== 'light' && theme !== 'dark') throw new Error(`Unsupported Western natal theme: ${String(theme)}`);
  if (!Number.isFinite(size) || size <= 0) throw new Error('Western natal export size must be positive');
  return { theme, size: Math.round(size) };
}

export function renderWesternNatalSvg(result: SwissNatalChartResult, options: WesternNatalRenderOptions = {}): string {
  const { theme, size } = validateOptions(options);
  if (result.objects.length !== 20 || result.houses.length !== 12 || Object.keys(result.angles).length !== 4) {
    throw new Error('Western natal SVG requires 20 objects, 12 houses, and four primary angles');
  }
  const palette = WESTERN_NATAL_PALETTES[theme];
  const ascendant = result.angles.Ascendant.longitude;
  const aspects = [...result.aspects]
    .sort((first, second) => first.layer - second.layer)
    .map((aspect) => renderAspect(aspect, objectById(result), ascendant))
    .join('');
  const location =
    result.birth.locationName ?? `${result.birth.latitude.toFixed(4)}, ${result.birth.longitude.toFixed(4)}`;
  const ariaLabel = 'Lá số chiêm tinh Tây phương';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" role="img" aria-label="${ariaLabel}" data-theme="${theme}" data-chart="western-natal">
    <title>${ariaLabel}</title><desc>Lá số Placidus gồm 20 thiên thể, 12 nhà, bốn góc chính và các góc chiếu Swiss Ephemeris.</desc>
    <defs>${Object.entries(SYMBOL_PATHS)
      .map(
        ([id, path]) =>
          `<path id="natal-symbol-${escapeXml(id.replaceAll(':', '-'))}" data-role="symbol-path-fallback-def" data-symbol-id="${escapeXml(id)}" d="${path}"/>`,
      )
      .join('')}</defs>
    <g id="layer-background"><rect data-role="background" width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="${palette.background}"/><circle cx="${CENTER}" cy="${CENTER}" r="474" fill="none" stroke="${palette.outer}" stroke-width="7"/></g>
    <g id="layer-houses">${renderHouses(result, palette)}</g>
    <g id="layer-aspects">${aspects}</g>
    <g id="layer-ticks">${renderTicks(palette)}</g>
    <g id="layer-zodiac">${renderZodiac(result, palette)}</g>
    <g id="layer-angles">${renderPrimaryAngles(result, palette)}</g>
    <g id="layer-objects">${renderObjects(result, palette)}</g>
    <g id="layer-metadata"><g data-role="technical-metadata"><rect x="432" y="458" width="136" height="84" rx="8" fill="${palette.metadata}" stroke="${palette.houseLine}" stroke-width="0.7" opacity="0.94"/><text x="500" y="479" text-anchor="middle" fill="${palette.ink}" font-size="10" font-weight="700">${escapeXml(location)}</text><text x="500" y="496" text-anchor="middle" fill="${palette.muted}" font-size="8.5">${escapeXml(result.birth.utc.replace('.000Z', 'Z'))}</text><text x="500" y="512" text-anchor="middle" fill="${palette.muted}" font-size="8.5">JD ${finite(result.birth.julianDayUt)} · Placidus</text><text x="500" y="528" text-anchor="middle" fill="${palette.muted}" font-size="8">${escapeXml(result.metadata.engine)} · ${escapeXml(result.metadata.version)}</text></g><g data-role="aspect-legend"><circle cx="500" cy="557" r="5" fill="none" stroke="${palette.gold}" stroke-width="1.5"/><text x="510" y="560" fill="${palette.muted}" font-size="8">Conjunction / Đồng cung</text></g></g>
  </svg>`;
}
