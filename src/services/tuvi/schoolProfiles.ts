import type { Can } from '../../types/calendar';
import type { TuHoaType, TuViLeapMonthPolicy, TuViSchool, TuViTimePolicy } from '../../types/tuvi';

export type KinhDaRule = 'fixed' | 'thuan-nghich';
export type KhoiVietRule = 'vietnamese' | 'standard';
export type ThaiTueRingRule = 'vietnamese' | 'bac-phai';

export interface TuViSchoolProfile {
  id: TuViSchool;
  label: string;
  shortLabel: string;
  description: string;
  kinhDaRule: KinhDaRule;
  khoiVietRule: KhoiVietRule;
  thaiTueRingRule: ThaiTueRingRule;
  leapMonthPolicy: TuViLeapMonthPolicy;
  timePolicy: TuViTimePolicy;
  tuHoaTable: Record<Can, Record<TuHoaType, string>>;
}

const TOAN_THU_TU_HOA: Record<Can, Record<TuHoaType, string>> = {
  Giáp: { Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' },
  Ất: { Lộc: 'Thiên Cơ', Quyền: 'Thiên Lương', Khoa: 'Tử Vi', Kỵ: 'Thái Âm' },
  Bính: { Lộc: 'Thiên Đồng', Quyền: 'Thiên Cơ', Khoa: 'Văn Xương', Kỵ: 'Liêm Trinh' },
  Đinh: { Lộc: 'Thái Âm', Quyền: 'Thiên Đồng', Khoa: 'Thiên Cơ', Kỵ: 'Cự Môn' },
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Hữu Bật', Kỵ: 'Thiên Cơ' },
  Kỷ: { Lộc: 'Vũ Khúc', Quyền: 'Tham Lang', Khoa: 'Thiên Lương', Kỵ: 'Văn Khúc' },
  Canh: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thái Âm', Kỵ: 'Thiên Đồng' },
  Tân: { Lộc: 'Cự Môn', Quyền: 'Thái Dương', Khoa: 'Văn Khúc', Kỵ: 'Văn Xương' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Tả Phụ', Kỵ: 'Vũ Khúc' },
  Quý: { Lộc: 'Phá Quân', Quyền: 'Cự Môn', Khoa: 'Thái Âm', Kỵ: 'Tham Lang' },
};

const TRUNG_CHAU_TU_HOA: Record<Can, Record<TuHoaType, string>> = {
  ...TOAN_THU_TU_HOA,
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Thái Dương', Kỵ: 'Thiên Cơ' },
  Canh: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thiên Phủ', Kỵ: 'Thiên Đồng' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Thiên Phủ', Kỵ: 'Vũ Khúc' },
};

export const TU_VI_SCHOOL_PROFILES: Record<TuViSchool, TuViSchoolProfile> = {
  'nam-phai': {
    id: 'nam-phai',
    label: 'Nam phái',
    shortLabel: 'Nam',
    description: 'Cổ truyền Tam Hợp / Toàn Thư, dùng Kình Đà cố định quanh Lộc Tồn và split-15 cho leap month.',
    kinhDaRule: 'fixed',
    khoiVietRule: 'vietnamese',
    thaiTueRingRule: 'vietnamese',
    leapMonthPolicy: 'split-15',
    timePolicy: 'historical-vietnam',
    tuHoaTable: TOAN_THU_TU_HOA,
  },
  'thien-luong': {
    id: 'thien-luong',
    label: 'Thiên Lương',
    shortLabel: 'TL',
    description: 'Biến thể Thiên Lương hiện tại, đảo Kình Đà theo chiều thuận-nghịch và split-15 cho leap month.',
    kinhDaRule: 'thuan-nghich',
    khoiVietRule: 'vietnamese',
    thaiTueRingRule: 'vietnamese',
    leapMonthPolicy: 'split-15',
    timePolicy: 'historical-vietnam',
    tuHoaTable: TOAN_THU_TU_HOA,
  },
  'bac-phai': {
    id: 'bac-phai',
    label: 'Bắc phái',
    shortLabel: 'Bắc',
    description: 'Bắc phái / Trung Châu tham chiếu iztro: Khôi Việt chuẩn, Tứ Hóa dị biệt, dùng leap month nguyên bản.',
    kinhDaRule: 'fixed',
    khoiVietRule: 'standard',
    thaiTueRingRule: 'bac-phai',
    leapMonthPolicy: 'raw',
    timePolicy: 'historical-vietnam',
    tuHoaTable: TRUNG_CHAU_TU_HOA,
  },
};

export const DEFAULT_TU_VI_SCHOOL: TuViSchool = 'thien-luong';

export function resolveTuViSchoolProfile(school?: TuViSchool): TuViSchoolProfile {
  return TU_VI_SCHOOL_PROFILES[school ?? DEFAULT_TU_VI_SCHOOL];
}
