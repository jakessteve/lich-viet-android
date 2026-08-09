import type { TuViInput, TuViChart, TuViHanContext } from '../../types/tuvi';
import { resolveTuViSchoolProfile } from './schoolProfiles';
import { buildTuViBirthContext } from './birthContext';
import { createTuViStarChart } from '@omce/core-logic';
import { CHI } from '../../utils/constants';

// We map OMCE's response directly to TuViChart
export function generateChart(input: TuViInput): TuViChart {
  const schoolProfile = resolveTuViSchoolProfile(input.school);
  const birthContext = buildTuViBirthContext(input, schoolProfile);
  
  const omceResult = createTuViStarChart({
    yearCanIndex: birthContext.yearCanIndex,
    yearChiIndex: birthContext.yearChiIndex,
    lunarMonth: birthContext.logicalMonth,
    lunarDay: birthContext.lunarDate.day,
    birthHour: birthContext.hourBranchIndex,
    gender: input.gender,
    school: schoolProfile.id,
    menhPalaceIndex: undefined,
    thanPalaceIndex: undefined,
    cucNumber: undefined,
  } as any) as any;

  const centerInfo = {
    hoTen: input.name ?? '',
    gioiTinh: String(input.gender).toLowerCase() === 'nam' ? 'Nam' : 'Nữ',
    amDuongLabel: `${omceResult.amDuong} ${String(input.gender).toLowerCase() === 'nam' ? 'Nam' : 'Nữ'}`,
    duongLich: birthContext.correctedDate.toISOString().split('T')[0],
    noiSinh: input.birthLocation?.locationName,
    schoolLabel: schoolProfile.label,
    amLich: `${birthContext.lunarDate.day}/${birthContext.lunarDate.month}/${birthContext.lunarDate.year}${birthContext.lunarDate.isLeap ? ' (nhuận)' : ''}`,
    canChiYear: `${birthContext.canChi.year.can} ${birthContext.canChi.year.chi}`,
    canChiMonth: `${birthContext.canChi.month.can} ${birthContext.canChi.month.chi}`,
    canChiDay: `${birthContext.canChi.day.can} ${birthContext.canChi.day.chi}`,
    canChiHour: `${birthContext.canChi.hour.can} ${birthContext.canChi.hour.chi}`,
    menhNapAm: omceResult.menhNapAm,
    cuc: ['Unknown', 'Unknown', 'Thủy Nhị Cục', 'Mộc Tam Cục', 'Kim Tứ Cục', 'Thổ Ngũ Cục', 'Hỏa Lục Cục'][omceResult.cucNumber] || '',
    cucNumber: omceResult.cucNumber,
    saoChuCuc: omceResult.saoChuCuc,
    menhChu: omceResult.menhChu,
    thanChu: omceResult.thanChu,
    laiNhanCung: omceResult.laiNhanCung,
    nguyenThan: omceResult.nguyenThan,
    menhCung: `Mệnh cư ${CHI[omceResult.menhPalaceIndex]}`,
    thanCung: `Thân cư ${CHI[omceResult.thanPalaceIndex]}`,
    thanCungLabel: `Thân cư ${CHI[omceResult.thanPalaceIndex]}`,
  };

  const menhCucRelation = {
    relation: 'bình hòa' as any,
    description: 'Mệnh Cục',
    menhHanh: '',
    cucHanh: '',
  };

  return {
    input: {
      ...input,
      school: schoolProfile.id,
      timePolicy: schoolProfile.timePolicy,
    },
    engineMeta: {
      version: 'accuracy-v4',
      schoolLabel: schoolProfile.label,
      leapMonthPolicy: birthContext.leapMonthPolicy,
      timePolicy: birthContext.timePolicy,
      historicalRegion: birthContext.historicalRegion,
      catalog: {} as any,
      warnings: birthContext.warnings,
      sources: ['omce-core-logic'],
    },
    correctedDate: birthContext.correctedDate,
    lunarDate: {
      day: birthContext.lunarDate.day,
      month: birthContext.lunarDate.month,
      year: birthContext.lunarDate.year,
      isLeapMonth: birthContext.lunarDate.isLeap,
    },
    canChi: birthContext.canChi,
    amDuong: omceResult.amDuong as any,
    thuanNghich: omceResult.thuanNghich as any,
    centerInfo,
    palaces: omceResult.palaces as any,
    combinations: omceResult.combinations as any,
    menhCucRelation,
    auditWarnings: birthContext.warnings,
  };
}

export function calculateHanContext(chart: TuViChart, viewYear: number, viewMonth: number): TuViHanContext {
  return {} as any;
}
