/**
 * Markdown Formatter — exporting a Tử Vi chart as Markdown.
 *
 * Pure TypeScript — zero React dependencies.
 */

import type { TuViChart, TuViCenterInfo, TuViPalace, TuViCombination, TuViMarkdownOptions } from '../../types/tuvi';
import { PALACE_NAMES } from './constants';
import { getStarBrightnessMarker } from './starGrouping';
import { formatCivilDateYmd } from './timeNormalization';

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|');
}

/**
 * Formats just the center info section.
 */
export function formatCenterInfoAsMarkdown(centerInfo: TuViCenterInfo): string {
  return `## Thông Tin Cơ Bản
- Họ tên: ${centerInfo.hoTen}
- Dương/Âm: ${centerInfo.amDuongLabel}
- Trường phái: ${centerInfo.schoolLabel}
- Dương lịch: ${centerInfo.duongLich}
- Nơi sinh: ${centerInfo.noiSinh ?? 'Chưa nhập'}
- Âm lịch: ${centerInfo.amLich}
- Tứ trụ: ${centerInfo.canChiYear}, ${centerInfo.canChiMonth}, ${centerInfo.canChiDay}, ${centerInfo.canChiHour}
- Mệnh/Nạp Âm: ${centerInfo.menhNapAm}
- Cục: ${centerInfo.cuc}
- Sao chủ cục: ${centerInfo.saoChuCuc}
- Mệnh chủ: ${centerInfo.menhChu}
- Thân chủ: ${centerInfo.thanChu}
- Lai nhân cung: ${centerInfo.laiNhanCung}
- Nguyên thần: ${centerInfo.nguyenThan}
- Mệnh cung: ${centerInfo.menhCung}
- Thân cung: ${centerInfo.thanCungLabel}`;
}

/**
 * Formats the 12-cung table.
 */
export function formatPalacesAsMarkdown(palaces: TuViPalace[], includeBrightness: boolean): string {
  const header = `## Thập Nhị Cung
| Cung | Can Chi | Chính Tinh | Phụ Tinh | Tứ Hóa | Đại Hạn |
|------|---------|------------|----------|--------|---------|`;

  const rows = palaces.map((palace) => {
    const chinhTinh = palace.chinhTinh
      .map((star) => {
        if (includeBrightness) {
          return `${star.name}${getStarBrightnessMarker(star)}`;
        }
        return star.name;
      })
      .join(' ');

    const phuTinh = palace.phuTinh
      .map((star) => {
        if (includeBrightness) {
          return `${star.name}${getStarBrightnessMarker(star)}`;
        }
        return star.name;
      })
      .join(', ');

    const tuHoa = palace.tuHoa.map((t) => t.type).join(', ');

    return `| ${palace.name} | ${palace.canChi} | ${escapeMarkdown(chinhTinh)} | ${escapeMarkdown(phuTinh)} | ${tuHoa} | ${palace.daiHanAgeRange} |`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Formats the detected combinations section.
 */
export function formatCombinationsAsMarkdown(combinations: TuViCombination[]): string {
  if (combinations.length === 0) {
    return '## Cách Cục Đặc Biệt\nKhông phát hiện cách cục đặc biệt.';
  }

  const lines = combinations.map((c) => {
    const purityLabel = c.purity === 'thuần' ? 'Thuần' : c.purity === 'bán' ? 'Bán' : 'Phá';
    return `- **${c.name}** (${c.nameHanViet}): ${c.involvedStars.join(', ')} in ${c.involvedCung.join(', ')}. ${purityLabel}. Strength: ${c.strength}/10. ${c.note}`;
  });

  return `## Cách Cục Đặc Biệt\n${lines.join('\n')}`;
}

/**
 * Generates a short prompt header for external LLM use.
 */
export function generatePromptHeader(chart: TuViChart): string {
  const name = chart.input.name ?? 'Chưa rõ';
  const date = formatCivilDateYmd(chart.correctedDate);
  const gender = chart.input.gender === 'nam' ? 'Nam' : 'Nữ';
  const menhHanh = chart.menhCucRelation.menhHanh;
  const cungName = chart.centerInfo.menhCung.replace('Mệnh cư ', '');
  const cuc = chart.centerInfo.cuc;
  const score = chart.huyenKhi.totalScore;

  return `Phân tích lá số Tử Vi: ${name}, sinh ${date}, ${gender}. Mệnh ${menhHanh} ${cungName}, Cục ${cuc}. Điểm huyền khí: ${score}.`;
}

/**
 * Formats a complete TuViChart as a Markdown string.
 */
export function formatTuViChartAsMarkdown(chart: TuViChart, options?: Partial<TuViMarkdownOptions>): string {
  const opts: TuViMarkdownOptions = {
    includeCombinations: true,
    includeHuyenKhi: true,
    includeBrightness: true,
    promptHeader: '',
    ...options,
  };

  const parts: string[] = [];

  if (opts.promptHeader) {
    parts.push(opts.promptHeader);
  }

  parts.push('# Lá Số Tử Vi');
  parts.push(formatCenterInfoAsMarkdown(chart.centerInfo));

  if (chart.engineMeta) {
    const meta = chart.engineMeta;
    parts.push(`## Dữ Liệu Engine
- Phiên bản: ${meta.version}
- Trường phái: ${meta.schoolLabel}
- Leap month: ${meta.leapMonthPolicy}
- Time policy: ${meta.timePolicy}
- Historical region: ${meta.historicalRegion ?? '—'}
- Nguồn kiểm chứng: ${meta.sources?.join(', ') || '—'}`);
    if (meta.catalog) {
      const layerText = meta.catalog.layers.map((layer) => `${layer.label}: ${layer.count}`).join(' · ');
      parts.push(`## Phân Tầng Danh Mục
- Tổng sao đang mô hình hóa: ${meta.catalog.total}
- Phân tầng: ${layerText}
- Mốc học thuật tham chiếu: ${meta.catalog.academicTargetTotal}
- Thiếu so với mốc học thuật: ${meta.catalog.academicGap}
- Cơ sở tham chiếu: ${meta.catalog.academicBasis}`);
    }
    if (meta.warnings.length > 0) {
      parts.push(`## Cảnh Báo Engine
${meta.warnings.map((warning) => `- ${warning}`).join('\n')}`);
    }
  }

  const relation = chart.menhCucRelation;
  parts.push(`## Mệnh - Cục Quan Hệ
- Mệnh (${relation.menhHanh}) - Cục (${relation.cucHanh}): ${relation.description}`);

  if (chart.hanContext) {
    const han = chart.hanContext;
    parts.push(`## Hạn Đang Xem
- Năm xem: ${han.viewYear}
- Tháng xem: ${han.viewMonth}
- Tuổi xem: ${han.viewAge}
- Đại hạn: ${han.daiHanPalaceName || '—'} ${han.daiHanAgeRange ? `(${han.daiHanAgeRange})` : ''}`);
  }

  if (opts.includeHuyenKhi) {
    const hk = chart.huyenKhi;
    const scoreEntries = PALACE_NAMES.map((name) => {
      const score = hk.palaceScores[name] ?? 0;
      return `${name}: ${score}`;
    }).join(', ');

    parts.push(`## Điểm Huyền Khí
- Tổng điểm: ${hk.totalScore}
- Cấp: ${hk.grade} Cách
- ${scoreEntries}`);
  }

  parts.push(formatPalacesAsMarkdown(chart.palaces, opts.includeBrightness));

  if (opts.includeCombinations) {
    parts.push(formatCombinationsAsMarkdown(chart.combinations));
  }

  parts.push(`## Cảnh Báo
- Kết quả dựa trên trường phái Thiên Lương (天梁). Các trường phái khác có thể cho kết quả khác biệt.
- Giờ sinh cần được chuyển đổi chính xác theo múi giờ địa phương.
- Leap-month và lịch sử múi giờ Việt Nam được áp theo cấu hình engine khi có dữ liệu.`);

  return parts.join('\n\n');
}
