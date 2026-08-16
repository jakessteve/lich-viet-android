/**
 * Markdown Formatter — exporting a Tử Vi chart as Markdown.
 *
 * Pure TypeScript — zero React dependencies.
 */

import type {
  TuViChart,
  TuViCenterInfo,
  TuViPalace,
  TuViCombination,
  TuViMarkdownOptions,
  TuViHanContext,
} from '../../types/tuvi';
import { getStarBrightnessMarker } from './starGrouping';
import { formatCivilDateYmd } from './timeNormalization';
import { calculateFlyingStars } from './flyingStars';
import { classifyTuViChart } from './chartClassification';
import { calculateHanContext } from './starPlacement';
import { getAllDaiHanInterpretations, getCurrentDaiHan } from './daiHanInterpretation';
import { detectPositionalSemantics } from './combinationDetection';

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|');
}

/**
 * Formats just the center info section.
 */
export function formatCenterInfoAsMarkdown(centerInfo: TuViCenterInfo, chart?: TuViChart): string {
  const lines = [
    '## Thông Tin Cơ Bản',
    `- Họ tên: ${centerInfo.hoTen}`,
    `- Âm Dương / Giới tính: ${centerInfo.amDuongLabel}`,
    `- Trường phái: ${centerInfo.schoolLabel}`,
    `- Dương lịch: ${centerInfo.duongLich}`,
    `- Âm lịch: ${centerInfo.amLich}`,
    `- Bát Tự (Tứ Trụ): Năm ${centerInfo.canChiYear}, Tháng ${centerInfo.canChiMonth}, Ngày ${centerInfo.canChiDay}, Giờ ${centerInfo.canChiHour}`,
    `- Bản Mệnh (Nạp Âm): ${centerInfo.menhNapAm}`,
    `- Cục: ${centerInfo.cuc} (Cục số ${centerInfo.cucNumber})`,
    `- Mệnh - Thân: ${centerInfo.menhCung} · ${centerInfo.thanCungLabel}`,
    `- Mệnh chủ: ${centerInfo.menhChu} · Thân chủ: ${centerInfo.thanChu} · Sao chủ cục: ${centerInfo.saoChuCuc}`,
    `- Lai nhân cung: ${centerInfo.laiNhanCung} · Nguyên thần: ${centerInfo.nguyenThan}`,
    `- Nơi sinh: ${centerInfo.noiSinh ?? 'Chưa nhập'}`,
  ];

  if (chart) {
    const rel = chart.menhCucRelation;
    lines.push(`- Tương quan Mệnh - Cục: Mệnh (${rel.menhHanh}) - Cục (${rel.cucHanh}) → ${rel.description}`);
  }

  return lines.join('\n');
}

/**
 * Formats chart classification and structure archetype.
 */
export function formatChartClassificationAsMarkdown(chart: TuViChart): string {
  const cls = classifyTuViChart(chart);
  const lines = [
    '## Cấu Trúc Lá Số & Thế Cục Bản Mệnh',
    `- **Cây phân loại**: ${cls.classificationPath.join(' ➔ ')}`,
    `- **Thế cục Mệnh**: ${cls.menhStructureType} (Chính tinh: ${cls.menhMajorStars.join(', ') || 'Vô Chính Diệu'})`,
    `- **Thân cư**: ${cls.thanCuCung} tại ${cls.thanChi}`,
    `- **Đánh giá tổng quan thế cục**: ${cls.patternSummaryVi}`,
  ];
  return lines.join('\n');
}

/**
 * Formats the 12-cung table with rings, Tuần/Triệt, Cường Cung, and placed stars.
 */
export function formatPalacesAsMarkdown(palaces: TuViPalace[], includeBrightness: boolean): string {
  const header = `## Thập Nhị Cung
| Cung Vị | Can Chi | Chính Tinh | Phụ Tinh | Sát Tinh | Tứ Hóa | 4 Vòng Tràng Sinh | Không Vong | Đại Hạn |
|---|---|---|---|---|---|---|---|---|`;

  const rows = palaces.map((palace) => {
    const cuongCungMarker = palace.isCuongCung ? ' (★)' : '';
    const thanMarker = palace.isThan ? ' [Thân]' : '';
    const palaceNameFull = `${palace.name}${cuongCungMarker}${thanMarker}`;

    const chinhTinh =
      palace.chinhTinh
        .map((s) => {
          if (includeBrightness) {
            return `${s.name}${getStarBrightnessMarker(s)}`;
          }
          return s.name;
        })
        .join(' ') || '—';

    const phuTinh =
      palace.phuTinh
        .map((s) => {
          if (includeBrightness) {
            return `${s.name}${getStarBrightnessMarker(s)}`;
          }
          return s.name;
        })
        .join(', ') || '—';

    const satTinh =
      palace.satTinh
        .map((s) => {
          if (includeBrightness) {
            return `${s.name}${getStarBrightnessMarker(s)}`;
          }
          return s.name;
        })
        .join(', ') || '—';

    const tuHoa = palace.tuHoa.map((th) => `Hóa ${th.type}`).join(', ') || '—';

    const ringsList: string[] = [];
    if (palace.rings?.truongSinh) ringsList.push(`Tr.Sinh: ${palace.rings.truongSinh}`);
    if (palace.rings?.thaiTue) ringsList.push(`Th.Tuế: ${palace.rings.thaiTue}`);
    if (palace.rings?.bacSi) ringsList.push(`B.Sĩ: ${palace.rings.bacSi}`);
    if (palace.rings?.tuongTinh) ringsList.push(`Tướng: ${palace.rings.tuongTinh}`);
    const ringsText = ringsList.length > 0 ? ringsList.join(' · ') : '—';

    const khongVong =
      palace.hasTuan && palace.hasTriet
        ? 'Tuần + Triệt'
        : palace.hasTuan
          ? 'Tuần Không'
          : palace.hasTriet
            ? 'Triệt Không'
            : '—';

    return `| ${escapeMarkdown(palaceNameFull)} | ${palace.canChi} | ${escapeMarkdown(chinhTinh)} | ${escapeMarkdown(phuTinh)} | ${escapeMarkdown(satTinh)} | ${tuHoa} | ${escapeMarkdown(ringsText)} | ${khongVong} | ${palace.daiHanAgeRange} |`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Formats Positional Semantics (Tam Phương Tứ Chính, Tọa, Chiếu, Củng, Giáp, Hiệp) for key palaces.
 */
export function formatPositionalSemanticsAsMarkdown(chart: TuViChart): string {
  const keyPalaces = chart.palaces.filter(
    (p) => p.isMenh || p.isThan || ['Quan Lộc', 'Tài Bạch', 'Phúc Đức', 'Thiên Di'].includes(p.name),
  );
  if (keyPalaces.length === 0) return '';

  const lines = ['## Tam Phương Tứ Chính & Tương Tác Cung Vị Then Chốt'];

  for (const palace of keyPalaces) {
    const semantics = detectPositionalSemantics(palace, chart.palaces);
    const title = `${palace.name} (${palace.canChi}${palace.isMenh ? ' - Bản Mệnh' : palace.isThan ? ' - Thân Cư' : ''})`;
    lines.push(`\n### Cung ${title}`);

    if (semantics.length === 0) {
      lines.push('- Độc lập, không chịu ảnh hưởng đặc thù từ thế giáp/hội.');
      continue;
    }

    for (const sem of semantics) {
      const starList = sem.stars.length > 0 ? ` (${sem.stars.join(', ')})` : '';
      const srcList = sem.sourcePalaces.length > 0 ? ` từ ${sem.sourcePalaces.join(', ')}` : '';
      lines.push(`- **${sem.label}**${starList}${srcList}: ${sem.description}`);
    }
  }

  return lines.join('\n');
}


/**
 * Formats comprehensive Vận Hạn (12 Đại Hạn schedule, Active Đại Hạn deep dive, Tiểu Hạn, Nguyệt Hạn, Lưu Diệu).
 */
export function formatHanContextAsMarkdown(chart: TuViChart, customHan?: TuViHanContext): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const han = customHan ?? chart.hanContext ?? calculateHanContext(chart, currentYear, currentMonth);
  const allDaiHans = getAllDaiHanInterpretations(chart);
  const activeDaiHan = getCurrentDaiHan(chart, han.viewAge) ?? allDaiHans.find((d) => d.isCurrent) ?? allDaiHans[0];

  const lines: string[] = ['## Vận Hạn & Lưu Niên Chi Tiết'];
  lines.push(`- **Thời điểm tra cứu**: Năm ${han.viewYear} (Âm lịch), Tháng ${han.viewMonth}, Tuổi mụ: ${han.viewAge} tuổi`);
  lines.push(`- **Đại Hạn Đang Đi (10 năm)**: Cung ${han.daiHanPalaceName || activeDaiHan?.palaceName || '—'} (${han.daiHanAgeRange || activeDaiHan?.ageRange || '—'})`);
  
  const tieuHanPalace = han.tieuHanPalaceIndex !== null ? chart.palaces[han.tieuHanPalaceIndex] : null;
  lines.push(`- **Tiểu Hạn Năm ${han.viewYear}**: Cung ${tieuHanPalace ? `${tieuHanPalace.name} (${tieuHanPalace.canChi})` : '—'}`);

  const nguyetHanPalace = han.nguyetHanPalaceIndex !== null ? chart.palaces[han.nguyetHanPalaceIndex] : null;
  lines.push(`- **Nguyệt Hạn Tháng ${han.viewMonth}**: Cung ${nguyetHanPalace ? `${nguyetHanPalace.name} (${nguyetHanPalace.canChi})` : '—'}`);

  // 1. Table of 12 Major Luck Periods
  lines.push('\n### Bảng 12 Thập Niên Đại Hạn Cuộc Đời');
  lines.push('| Độ Tuổi | Cung Vị | Can Chi | Tràng Sinh | Mức Độ Vận | Đánh Giá Tam Tài |');
  lines.push('|---|---|---|---|---|---|');

  for (const dh of allDaiHans) {
    const isCurrentMarker = dh.palaceId === activeDaiHan?.palaceId ? ' ★ (Hiện tại)' : '';
    const nameFull = `${dh.palaceName}${isCurrentMarker}`;
    const tamTaiDesc = `Thiên: ${dh.tamTai.thienThoi.level} · Địa: ${dh.tamTai.diaLoi.level} · Nhân: ${dh.tamTai.nhanHoa.level}`;
    lines.push(`| ${dh.ageRange} | ${escapeMarkdown(nameFull)} | ${dh.palaceCanChi} | ${dh.truongSinh.name} | **${dh.luckTier}** (${dh.luckScore}/10) | ${tamTaiDesc} |`);
  }

  // 2. Active Major Luck Period Deep Dive
  if (activeDaiHan) {
    lines.push(`\n### Luận Giải Chuyên Sâu Đại Hạn ${activeDaiHan.ageRange} (Cung ${activeDaiHan.palaceName} - ${activeDaiHan.palaceCanChi})`);
    lines.push(`- **Chủ đề vận hạn (Theme)**: ${activeDaiHan.themeVi}`);
    lines.push(`- **Đánh giá Tam Tài (${activeDaiHan.luckScore}/10 - ${activeDaiHan.luckTier})**:`);
    lines.push(`  - **Thiên Thời (${activeDaiHan.tamTai.thienThoi.level})**: ${activeDaiHan.tamTai.thienThoi.desc}`);
    lines.push(`  - **Địa Lợi (${activeDaiHan.tamTai.diaLoi.level})**: ${activeDaiHan.tamTai.diaLoi.desc}`);
    lines.push(`  - **Nhân Hòa (${activeDaiHan.tamTai.nhanHoa.level})**: ${activeDaiHan.tamTai.nhanHoa.desc}`);
    lines.push(`  - **Khí Lực Tràng Sinh (${activeDaiHan.truongSinh.name})**: ${activeDaiHan.truongSinh.energyDescription}`);
    
    lines.push(`- **Lưu Tứ Hóa Can Cung ${activeDaiHan.daiHanTuHoa.canCung}**:`);
    lines.push(`  - Hóa Lộc: ${activeDaiHan.daiHanTuHoa.hoaLoc} · Hóa Quyền: ${activeDaiHan.daiHanTuHoa.hoaQuyen} · Hóa Khoa: ${activeDaiHan.daiHanTuHoa.hoaKhoa} · Hóa Kỵ: ${activeDaiHan.daiHanTuHoa.hoaKy}`);
    if (activeDaiHan.daiHanTuHoa.interactionWithNatal.length > 0) {
      lines.push(`  - Tương tác với Tứ Hóa gốc: ${activeDaiHan.daiHanTuHoa.interactionWithNatal.join('; ')}`);
    }

    lines.push(`- **Phân kỳ 5 năm (Tiền vận vs Hậu vận)**:`);
    lines.push(`  - 5 năm đầu (${activeDaiHan.startAge}–${activeDaiHan.startAge + 4} tuổi): ${activeDaiHan.phasingBreakdown.firstHalf}`);
    lines.push(`  - 5 năm sau (${activeDaiHan.startAge + 5}–${activeDaiHan.endAge} tuổi): ${activeDaiHan.phasingBreakdown.secondHalf}`);

    lines.push(`- **Định hướng chiến lược (Strategic Guidance)**: ${activeDaiHan.detailedSynthesis.strategicGuidance}`);
    lines.push(`- **Sự nghiệp & Tài lộc**: ${activeDaiHan.detailedSynthesis.careerAndWealth}`);
    lines.push(`- **Tình duyên & Gia đạo/Sức khỏe**: ${activeDaiHan.detailedSynthesis.relationshipAndHealth}`);
  }

  // 3. Moving Stars (Lưu Diệu) for the viewed year
  if (han.luuDieuByPalace && Object.keys(han.luuDieuByPalace).length > 0) {
    lines.push(`\n### Bảng Phân Bố Lưu Diệu Năm ${han.viewYear}`);
    lines.push('| Cung Vị | Can Chi | Các Sao Lưu Diệu Chiếu Đến |');
    lines.push('|---|---|---|');

    for (let idx = 0; idx < 12; idx++) {
      const p = chart.palaces[idx];
      const movingStars = han.luuDieuByPalace[idx] ?? [];
      const movingText = movingStars.map((s) => s.name).join(', ') || '—';
      lines.push(`| ${p.name} | ${p.canChi} | ${escapeMarkdown(movingText)} |`);
    }
  }

  return lines.join('\n');
}

/**
 * Formats the detected combinations section with contextual details.
 */
export function formatCombinationsAsMarkdown(combinations: TuViCombination[]): string {
  if (combinations.length === 0) {
    return '## Cách Cục Đặc Biệt\nKhông phát hiện cách cục đặc biệt.';
  }

  const lines: string[] = ['## Cách Cục Đặc Biệt'];

  combinations.forEach((c) => {
    const purityLabel = c.purity === 'thuần' ? 'Thuần Cách' : c.purity === 'bán' ? 'Bán Cách' : 'Phá Cách';
    const catLabel = c.category === 'cat' ? 'Đại Cát' : c.category === 'hung' ? 'Hung Cách' : 'Trung Tính';
    lines.push(`\n### ${c.name} (${c.nameHanViet}) — [${purityLabel} · ${catLabel} · Độ mạnh: ${c.strength}/10]`);
    lines.push(`- **Sao hội tụ**: ${c.involvedStars.join(', ')} tại Cung ${c.involvedCung.join(', ')}.`);
    lines.push(`- **Cơ chế hình thành**: ${c.detectionReason}`);
    lines.push(`- **Luận giải cổ điển**: ${c.note}`);

    if (c.contextualDetails) {
      const ctx = c.contextualDetails;
      if (ctx.dynamicSynthesisVi) lines.push(`- **Luận giải phối hợp bản mệnh**: ${ctx.dynamicSynthesisVi}`);
      if (ctx.tuHoaEffects.length > 0) lines.push(`- **Tác động Tứ Hóa**: ${ctx.tuHoaEffects.join('; ')}`);
      if (ctx.tuanTrietImpact) lines.push(`- **Ảnh hưởng Tuần/Triệt**: ${ctx.tuanTrietImpact}`);
      if (ctx.careerAndLifeGuidance) lines.push(`- **Lời khuyên hành động**: ${ctx.careerAndLifeGuidance}`);
    }
  });

  return lines.join('\n');
}

/**
 * Formats Flying Stars (Phi Tinh Tứ Hóa) interactions into Markdown.
 */
export function formatFlyingStarsAsMarkdown(chart: TuViChart): string {
  const flying = calculateFlyingStars(chart);
  const lines: string[] = ['## Phi Tinh Tứ Hóa 12 Cung'];
  lines.push(`- **Tổng quan phi tinh**: ${flying.overallSynthesisVi}`);

  if (flying.keyInteractions.menhFlying.length > 0) {
    lines.push('- **Cung Mệnh phi xuất Tứ Hóa**:');
    flying.keyInteractions.menhFlying.forEach((h) => {
      lines.push(`  - Hóa ${h.type} (${h.starName}) → Cung ${h.targetPalaceName}: ${h.descriptionVi}`);
    });
  }

  if (flying.keyInteractions.menhReceived.length > 0) {
    lines.push('- **Các cung phi nhập Cung Mệnh**:');
    flying.keyInteractions.menhReceived.forEach((h) => {
      lines.push(`  - Từ Cung ${h.sourcePalaceName} (Hóa ${h.type} - ${h.starName}): ${h.descriptionVi}`);
    });
  }

  lines.push('\n### Bảng Tứ Hóa Phi Xuất 12 Cung');
  lines.push('| Cung Vị | Can Chi | Hóa Lộc | Hóa Quyền | Hóa Khoa | Hóa Kỵ | Tự Hóa |');
  lines.push('|---|---|---|---|---|---|---|');

  flying.palaces.forEach((p) => {
    const loc = p.flyingHuas['Lộc'] ? `${p.flyingHuas['Lộc'].targetPalaceName} (${p.flyingHuas['Lộc'].starName})` : '—';
    const quyen = p.flyingHuas['Quyền']
      ? `${p.flyingHuas['Quyền'].targetPalaceName} (${p.flyingHuas['Quyền'].starName})`
      : '—';
    const khoa = p.flyingHuas['Khoa']
      ? `${p.flyingHuas['Khoa'].targetPalaceName} (${p.flyingHuas['Khoa'].starName})`
      : '—';
    const ky = p.flyingHuas['Kỵ'] ? `${p.flyingHuas['Kỵ'].targetPalaceName} (${p.flyingHuas['Kỵ'].starName})` : '—';
    const tuHoa = p.tuHuas.length > 0 ? p.tuHuas.map((th) => th.type).join(', ') : '—';
    lines.push(`| ${p.palaceName} | ${p.can} ${p.chi} | ${escapeMarkdown(loc)} | ${escapeMarkdown(quyen)} | ${escapeMarkdown(khoa)} | ${escapeMarkdown(ky)} | ${tuHoa} |`);
  });

  return lines.join('\n');
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

  return `Phân tích lá số Tử Vi: ${name}, sinh ${date}, ${gender}. Mệnh ${menhHanh} ${cungName}, Cục ${cuc}.`;
}

/**
 * Formats a complete TuViChart as a comprehensive, rich Markdown document.
 */
export function formatTuViChartAsMarkdown(chart: TuViChart, options?: Partial<TuViMarkdownOptions>): string {
  const opts: TuViMarkdownOptions = {
    includeCombinations: true,
    includeBrightness: true,
    promptHeader: '',
    ...options,
  };

  const parts: string[] = [];

  if (opts.promptHeader) {
    parts.push(opts.promptHeader);
  }

  parts.push('# Lá Số Tử Vi');
  parts.push(formatCenterInfoAsMarkdown(chart.centerInfo, chart));
  parts.push(formatChartClassificationAsMarkdown(chart));
  parts.push(formatPalacesAsMarkdown(chart.palaces, opts.includeBrightness));
  parts.push(formatPositionalSemanticsAsMarkdown(chart));
  parts.push(formatHanContextAsMarkdown(chart));

  if (opts.includeCombinations) {
    parts.push(formatCombinationsAsMarkdown(chart.combinations));
  }

  parts.push(formatFlyingStarsAsMarkdown(chart));

  parts.push(`## Ghi Chú & Cơ Sở Học Thuật
- Lá số được an sao và tính toán theo chuẩn trường phái ${chart.centerInfo.schoolLabel || 'Thiên Lương'}.
- Các yếu tố Vòng Trường Sinh, Vòng Thái Tuế, Vòng Bác Sĩ, Vòng Tướng Tinh, Tuần Không và Triệt Không đã được tích hợp đầy đủ.
- Đại Hạn 10 năm và Lưu Diệu hàng năm phản ánh sự biến thiên của thời vận qua ma trận Tam Tài (Thiên Thời - Địa Lợi - Nhân Hòa).`);

  return parts.join('\n\n');
}

