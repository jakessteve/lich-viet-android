import { z } from 'zod';

export const TuViGenderSchema = z.enum(['nam', 'nữ']);
export type TuViGender = z.infer<typeof TuViGenderSchema>;

export const TuViSchoolSchema = z.enum(['nam-phai', 'thien-luong', 'bac-phai', 'phi-tinh']);
export type TuViSchool = z.infer<typeof TuViSchoolSchema>;

export const TuViBirthInputSchema = z.object({
  name: z.string().optional(),
  solarDate: z.string(), // ISO string or YYYY-MM-DD
  birthHour: z.number().int().min(0).max(23),
  birthMinute: z.number().int().min(0).max(59).default(0),
  gender: TuViGenderSchema.default('nam'),
  school: TuViSchoolSchema.default('thien-luong'),
  viewingYear: z.number().int().optional(),
  timezone: z.union([z.number(), z.string()]).default(7),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
});
export type TuViBirthInput = z.infer<typeof TuViBirthInputSchema>;

export interface TuViStarDto {
  name: string;
  element: string;
  brightness?: string;
  isMain?: boolean;
  type?: string;
  phuTinhGroup?: string;
  originPalaceIndex?: number;
  significance?: string;
}

export interface TuViPalaceDto {
  index: number;
  name: string;
  earthlyBranch: string;
  heavenlyStem: string;
  isBodyPalace: boolean;
  isMenhPalace?: boolean;
  isThanPalace?: boolean;
  mainStars: TuViStarDto[];
  goodStars: TuViStarDto[];
  badStars: TuViStarDto[];
  auxiliaryStars?: TuViStarDto[];
  daiHanAge: number;
  tieuHanBranch: string;
}

export interface TuViChartDto {
  centerInfo: {
    name?: string;
    solarDate: string;
    lunarDate: string;
    lunarYearCanChi: string;
    lunarMonthCanChi: string;
    lunarDayCanChi: string;
    lunarHourCanChi: string;
    cuc: string;
    menh: string;
    thanCung: string;
    menhCung: string;
    birthHourName: string;
    amDuongNamNu: string;
  };
  palaces: TuViPalaceDto[];
  viewingYear?: number;
}
