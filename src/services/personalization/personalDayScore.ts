import { getCanChiYear } from '../../utils/calendarEngine';
import type { Chi, Can } from '../../types/calendar';
import { getBranchRelationship } from '@omce/core-logic';

export const CHI_LIST: Chi[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const CAN_LIST: Can[] = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

export interface PersonalDayScore {
  actionScore: number;
  label: string;
  description: string;
  isThaiTue: boolean;
  isTamHop: boolean;
  isLucHop: boolean;
  isTuongXung: boolean;
  isTuongHai: boolean;
  isTuongHinh: boolean;
  isTuongPha: boolean;
}

export function getYearChi(year: number): Chi {
  const canChi = getCanChiYear(year);
  return canChi.split(' ')[1] as Chi;
}

export const isTamHop = (chi1: Chi, chi2: Chi): boolean => getBranchRelationship(chi1, chi2) === 'hop_tam';
export const isLucHop = (chi1: Chi, chi2: Chi): boolean => getBranchRelationship(chi1, chi2) === 'hop_luc';
export const isTuongXung = (chi1: Chi, chi2: Chi): boolean => getBranchRelationship(chi1, chi2) === 'xung';
export const isTuongHai = (chi1: Chi, chi2: Chi): boolean => getBranchRelationship(chi1, chi2) === 'hai';
export const isTuongHinh = (chi1: Chi, chi2: Chi): boolean => getBranchRelationship(chi1, chi2) === 'tu_hinh';

export const isTuongPha = (chi1: Chi, chi2: Chi): boolean => {
  const phaGroups: [Chi, Chi][] = [
    ['Tý', 'Dậu'], ['Sửu', 'Thìn'], ['Dần', 'Hợi'],
    ['Mão', 'Ngọ'], ['Tỵ', 'Thân'], ['Mùi', 'Tuất'],
  ];
  return phaGroups.some(([a, b]) => (chi1 === a && chi2 === b) || (chi1 === b && chi2 === a));
};

export function calculatePersonalDayScore(
  userBirthYear: number,
  dayCanChi: string,
  birthDetails?: any
): PersonalDayScore {
  const birthChi = getYearChi(userBirthYear);
  const dayChi = dayCanChi.split(' ')[1] as Chi;

  const scoreData: PersonalDayScore = {
    actionScore: 0,
    label: 'Bình hòa',
    description: 'Ngày bình thường, không quá tốt cũng không quá xấu.',
    isThaiTue: birthChi === dayChi,
    isTamHop: isTamHop(birthChi, dayChi),
    isLucHop: isLucHop(birthChi, dayChi),
    isTuongXung: isTuongXung(birthChi, dayChi),
    isTuongHai: isTuongHai(birthChi, dayChi),
    isTuongHinh: isTuongHinh(birthChi, dayChi),
    isTuongPha: isTuongPha(birthChi, dayChi),
  };

  if (scoreData.isTamHop || scoreData.isLucHop) {
    scoreData.actionScore = 2;
    scoreData.label = 'Ngày Hợp';
    scoreData.description = 'Ngày tương hợp với tuổi, làm việc gì cũng dễ thành công, được quý nhân giúp đỡ.';
  } else if (scoreData.isTuongXung) {
    scoreData.actionScore = -2;
    scoreData.label = 'Ngày Xung';
    scoreData.description = 'Ngày xung khắc với tuổi, cẩn trọng trong mọi việc, dễ xảy ra xích mích hoặc trở ngại.';
  } else if (scoreData.isTuongHai || scoreData.isTuongHinh || scoreData.isTuongPha) {
    scoreData.actionScore = -1;
    scoreData.label = 'Ngày Hình Hại';
    scoreData.description = 'Ngày có yếu tố hình hại, nên tránh các việc lớn, đề phòng thị phi hoặc hao tài.';
  } else if (scoreData.isThaiTue) {
    scoreData.actionScore = -1;
    scoreData.label = 'Ngày Thái Tuế';
    scoreData.description = 'Ngày trùng với tuổi (Thái Tuế), áp lực lớn, tâm trạng dễ bồn chồn.';
  }

  return scoreData;
}
