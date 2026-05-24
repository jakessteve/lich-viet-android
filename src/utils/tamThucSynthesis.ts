/**
 * Tam Thức Synthesis Engine — Cross-reference QMDJ + Lục Nhâm + Thái Ất
 *
 * Takes a shared date/time input, runs all three engines, and produces
 * a combined synthesis with agreement scoring and per-method summaries.
 */

import { generateQmdjChart, interpretQmdjChart } from './qmdjEngine';
import { getThaiAtYearChart, getThaiAtMonthOverlay } from './thaiAtEngine';
import { generateLucNhamChart } from './lucNhamEngine';
import { getLunarDate } from './calendarEngine';
import type { Chi } from '../types/calendar';

// ── Types ──────────────────────────────────────────────────────

export interface MethodSummary {
  name: string;
  nameShort: string;
  icon: string;
  verdict: 'cat' | 'hung' | 'trungBinh';
  verdictLabel: string;
  summary: string;
  details: string[];
}

export interface TamThucSynthesis {
  /** Shared input date */
  date: Date;
  /** Shared input hour branch (Vietnamese name) */
  hourBranchName: string;
  /** Per-method summaries */
  methods: {
    qmdj: MethodSummary;
    lucNham: MethodSummary;
    thaiAt: MethodSummary;
  };
  /** How many methods agree: 0-3 */
  agreementCount: number;
  /** Combined verdict */
  combinedVerdict: 'cat' | 'hung' | 'trungBinh';
  /** Human-readable combined verdict */
  combinedLabel: string;
  /** Synthesis narrative */
  narrative: string;
}

// ── Constants ──────────────────────────────────────────────────

const CHI_FROM_INDEX: Chi[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// ── Engine Runners ─────────────────────────────────────────────

function runQmdj(date: Date, hourIndex: number): MethodSummary {
  try {
    const hourChi = CHI_FROM_INDEX[hourIndex % 12];
    const chart = generateQmdjChart(date, hourChi);

    // Find directing door and star
    const trucSuPalace = chart.palaces.find((p) => p.door?.id === chart.trucSuDoorId);
    const trucPhuPalace = chart.palaces.find((p) => p.star?.id === chart.trucPhuStarId);
    const door = trucSuPalace?.door;
    const star = trucPhuPalace?.star;

    const doorIsCat = door?.auspiciousness === 'cat';
    const starIsCat = star?.auspiciousness === 'cat';
    const auspFormations = chart.formations.filter((f) => f.effect === 'cat');
    const inausFormations = chart.formations.filter((f) => f.effect === 'hung');

    let verdict: MethodSummary['verdict'] = 'trungBinh';
    if (doorIsCat && starIsCat) verdict = 'cat';
    else if (!doorIsCat && !starIsCat) verdict = 'hung';

    const verdictLabels = { cat: 'Thuận lợi', hung: 'Bất lợi', trungBinh: 'Trung bình' };

    const details: string[] = [
      `Trực Sử: ${door?.nameVi || '—'} (${doorIsCat ? 'Cát' : 'Hung'})`,
      `Trực Phù: ${star?.nameVi || '—'} (${starIsCat ? 'Cát' : 'Hung'})`,
      `Cục ${chart.gameNumber} · ${chart.isDuongDon ? 'Dương Độn' : 'Âm Độn'}`,
    ];

    // I1+I2: Add per-Door×Star interpretation and element analysis
    const palaceInterps = interpretQmdjChart(chart);
    if (trucSuPalace) {
      const trucSuInterp = palaceInterps.find((p) => p.palaceNumber === trucSuPalace.number);
      if (trucSuInterp?.doorStarCombo) {
        details.push(trucSuInterp.doorStarCombo);
      }
      if (trucSuInterp?.palaceDoorElement) {
        details.push(
          `Ngũ Hành: ${trucSuInterp.palaceDoorElement.label} (Điểm: ${trucSuInterp.elementScore > 0 ? '+' : ''}${trucSuInterp.elementScore})`,
        );
      }
      if (trucSuInterp?.deityInfluence) {
        details.push(`Thần: ${trucSuInterp.deityInfluence}`);
      }
      // I3: Purpose-specific domain advice
      if (trucSuInterp?.domainAdvice) {
        details.push(trucSuInterp.domainAdvice);
      }
      // I4: Stem clash/harmony
      if (trucSuInterp?.stemNote) {
        details.push(trucSuInterp.stemNote);
      }
    }

    if (auspFormations.length > 0) {
      details.push(`Cách cát: ${auspFormations.map((f) => f.nameVi).join(', ')}`);
    }
    if (inausFormations.length > 0) {
      details.push(`Cách hung: ${inausFormations.map((f) => f.nameVi).join(', ')}`);
    }

    // Use I1 element-adjusted verdict instead of simple binary
    const trucSuInterp = palaceInterps.find((p) => trucSuPalace && p.palaceNumber === trucSuPalace.number);
    if (trucSuInterp) {
      verdict =
        trucSuInterp.overallAuspiciousness === 'cat'
          ? 'cat'
          : trucSuInterp.overallAuspiciousness === 'hung'
            ? 'hung'
            : 'trungBinh';
    }

    return {
      name: 'Kỳ Môn Độn Giáp',
      nameShort: 'Kỳ Môn',
      icon: '🏛️',
      verdict,
      verdictLabel: verdictLabels[verdict],
      summary: `${door?.nameVi || '—'} + ${star?.nameVi || '—'}: ${verdictLabels[verdict]}`,
      details,
    };
  } catch {
    return {
      name: 'Kỳ Môn Độn Giáp',
      nameShort: 'Kỳ Môn',
      icon: '🏛️',
      verdict: 'trungBinh',
      verdictLabel: 'Không xác định',
      summary: 'Không thể tính quẻ Kỳ Môn',
      details: [],
    };
  }
}

function runLucNham(date: Date, hourIndex: number): MethodSummary {
  try {
    const chart = generateLucNhamChart(date, hourIndex);
    // interpretChart used for category interpretations (accessed separately via L1/L2/L3 chart fields)

    let verdict: MethodSummary['verdict'] = 'trungBinh';
    if (chart.verdict.level === 'daiCat' || chart.verdict.level === 'cat') verdict = 'cat';
    else if (chart.verdict.level === 'hung' || chart.verdict.level === 'daiHung') verdict = 'hung';

    const details: string[] = [
      `Khóa Thức: ${chart.khoaThuc.nameVi} (${chart.khoaThuc.nameCn})`,
      `Phán Quyết: ${chart.verdict.label}`,
      `Tam Truyền: ${chart.tamTruyen.steps.map((s) => s.branchName).join(' → ')}`,
    ];

    // L1+L2: Surface element relations and Lục Thân
    const firstLesson = chart.tuKhoa.lessons[0];
    if (firstLesson?.lucThanLabel) {
      details.push(`Sơ Khóa Lục Thân: ${firstLesson.lucThanLabel}`);
    }
    if (firstLesson?.elementRelation) {
      details.push(
        `Ngũ Hành Sơ Khóa: ${firstLesson.upperElement} ${firstLesson.relationship} ${firstLesson.lowerElement}`,
      );
    }
    // Show all Lục Thân for Tam Truyền visibility
    const lucThanSummary = chart.tuKhoa.lessons
      .filter((l) => l.lucThanLabel)
      .map((l) => `K${l.index}: ${l.lucThanLabel}`)
      .join(' · ');
    if (lucThanSummary) {
      details.push(`Lục Thân: ${lucThanSummary}`);
    }

    // L3: Surface Thần Sát markers
    if (chart.thanSat && chart.thanSat.length > 0) {
      const catSat = chart.thanSat.filter((s) => s.nature === 'cat').map((s) => s.nameVi);
      const hungSat = chart.thanSat.filter((s) => s.nature === 'hung').map((s) => s.nameVi);
      if (catSat.length > 0) details.push(`Cát Thần: ${catSat.join(', ')}`);
      if (hungSat.length > 0) details.push(`Hung Thần: ${hungSat.join(', ')}`);
    }

    return {
      name: 'Đại Lục Nhâm',
      nameShort: 'Lục Nhâm',
      icon: '🔮',
      verdict,
      verdictLabel: chart.verdict.label,
      summary: `${chart.khoaThuc.nameVi}: ${chart.verdict.label}`,
      details,
    };
  } catch {
    return {
      name: 'Đại Lục Nhâm',
      nameShort: 'Lục Nhâm',
      icon: '🔮',
      verdict: 'trungBinh',
      verdictLabel: 'Không xác định',
      summary: 'Không thể tính quẻ Lục Nhâm',
      details: [],
    };
  }
}

function runThaiAt(date: Date): MethodSummary {
  try {
    const lunarDate = getLunarDate(date);
    const chart = getThaiAtYearChart(lunarDate.year);
    const monthOverlay = getThaiAtMonthOverlay(lunarDate.year, lunarDate.month, lunarDate.isLeap);

    let verdict: MethodSummary['verdict'] = 'trungBinh';
    if (chart.forecastTone === 'optimistic') verdict = 'cat';
    else if (chart.forecastTone === 'cautious') verdict = 'hung';

    const toneLabels = { optimistic: 'Thuận lợi', cautious: 'Cần cảnh giác', neutral: 'Trung hòa' };
    const verdictLabel = toneLabels[chart.forecastTone] || 'Trung hòa';

    const details: string[] = [
      `Cung: ${chart.thaiAtPalaceInfo.nameVi} (Cung ${chart.thaiAtPalace})`,
      `Ngũ Hành: ${chart.element}`,
      `Chủ-Khách: ${chart.hostGuest.dominanceLabel}`,
    ];

    // Palace element interaction with year's Nạp Âm
    if (chart.palaceElementAnalysis) {
      details.push(
        `Cung-Năm: ${chart.palaceElementAnalysis.relationLabel} (Điểm: ${chart.palaceElementAnalysis.score > 0 ? '+' : ''}${chart.palaceElementAnalysis.score})`,
      );
      details.push(chart.palaceElementAnalysis.interpretation);
    }

    // Host / Guest / Fixed
    if (chart.hostGuest.fixedCount !== undefined) {
      details.push(
        `Chủ Toán: ${chart.hostGuest.hostCount} · Khách Toán: ${chart.hostGuest.guestCount} · Định Toán: ${chart.hostGuest.fixedCount}`,
      );
    }

    details.push(`Dự báo tháng: ${monthOverlay.monthlyForecast}`);

    return {
      name: 'Thái Ất Thần Số',
      nameShort: 'Thái Ất',
      icon: '☯️',
      verdict,
      verdictLabel,
      summary: `${chart.thaiAtPalaceInfo.nameVi}: ${verdictLabel}`,
      details,
    };
  } catch {
    return {
      name: 'Thái Ất Thần Số',
      nameShort: 'Thái Ất',
      icon: '☯️',
      verdict: 'trungBinh',
      verdictLabel: 'Không xác định',
      summary: 'Không thể tính Thái Ất',
      details: [],
    };
  }
}

// ── Main Synthesis ─────────────────────────────────────────────

/**
 * Run all three Tam Thức engines and produce a unified synthesis.
 *
 * @param date - The query date
 * @param hourIndex - Hour branch index (0=Tý, 1=Sửu, ..., 11=Hợi)
 */
export function synthesizeTamThuc(date: Date, hourIndex: number): TamThucSynthesis {
  const qmdj = runQmdj(date, hourIndex);
  const lucNham = runLucNham(date, hourIndex);
  const thaiAt = runThaiAt(date);

  const verdicts = [qmdj.verdict, lucNham.verdict, thaiAt.verdict];
  const catCount = verdicts.filter((v) => v === 'cat').length;
  const hungCount = verdicts.filter((v) => v === 'hung').length;

  let combinedVerdict: TamThucSynthesis['combinedVerdict'] = 'trungBinh';
  if (catCount >= 2) combinedVerdict = 'cat';
  else if (hungCount >= 2) combinedVerdict = 'hung';

  const agreementCount = Math.max(catCount, hungCount, verdicts.filter((v) => v === 'trungBinh').length);

  const combinedLabels = {
    cat: 'Tam Thức Đồng Thuận — Thuận Lợi',
    hung: 'Tam Thức Cảnh Báo — Cần Thận Trọng',
    trungBinh: 'Tam Thức Hỗn Hợp — Tình Hình Trung Bình',
  };

  // Build narrative
  const narrativeParts: string[] = [];
  if (combinedVerdict === 'cat') {
    narrativeParts.push('Ba phương pháp Tam Thức đều có xu hướng thuận lợi.');
    if (qmdj.verdict === 'cat') narrativeParts.push(`Kỳ Môn cho thấy ${qmdj.summary}.`);
    if (lucNham.verdict === 'cat') narrativeParts.push(`Lục Nhâm xác nhận ${lucNham.summary}.`);
    if (thaiAt.verdict === 'cat') narrativeParts.push(`Thái Ất bổ trợ: ${thaiAt.summary}.`);
  } else if (combinedVerdict === 'hung') {
    narrativeParts.push('Ba phương pháp Tam Thức cảnh báo cần thận trọng.');
    if (qmdj.verdict === 'hung') narrativeParts.push(`Kỳ Môn cảnh báo: ${qmdj.summary}.`);
    if (lucNham.verdict === 'hung') narrativeParts.push(`Lục Nhâm cho thấy: ${lucNham.summary}.`);
    if (thaiAt.verdict === 'hung') narrativeParts.push(`Thái Ất nhận định: ${thaiAt.summary}.`);
  } else {
    narrativeParts.push('Các phương pháp Tam Thức cho kết quả hỗn hợp, cần xem xét kỹ từng phương diện.');
    narrativeParts.push(
      `Kỳ Môn: ${qmdj.verdictLabel}. Lục Nhâm: ${lucNham.verdictLabel}. Thái Ất: ${thaiAt.verdictLabel}.`,
    );
  }

  return {
    date,
    hourBranchName: CHI_FROM_INDEX[hourIndex % 12],
    methods: { qmdj, lucNham, thaiAt },
    agreementCount,
    combinedVerdict,
    combinedLabel: combinedLabels[combinedVerdict],
    narrative: narrativeParts.join(' '),
  };
}
