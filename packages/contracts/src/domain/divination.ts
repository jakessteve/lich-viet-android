import { z } from 'zod';

export const MaiHoaInputSchema = z.object({
  date: z.string().optional(),
  number1: z.number().int().positive().optional(),
  number2: z.number().int().positive().optional(),
  number3: z.number().int().positive().optional(),
  query: z.string().optional(),
});
export type MaiHoaInput = z.infer<typeof MaiHoaInputSchema>;

export const TamThucInputSchema = z.object({
  date: z.string(),
  timezone: z.number().default(7),
  controlZone: z.string().optional(),
  hourIndex: z.number().int().min(0).max(11).optional(),
});
export type TamThucInput = z.infer<typeof TamThucInputSchema>;

export interface DivinationMethodSummaryDto {
  name: string;
  nameShort?: string;
  icon?: string;
  verdict: 'cat' | 'hung' | 'trungBinh';
  verdictLabel: string;
  summary: string;
  details: string[];
}

export interface TamThucSynthesisDto {
  date: string | Date;
  hourBranchName?: string;
  methods: {
    qmdj: DivinationMethodSummaryDto;
    lucNham: DivinationMethodSummaryDto;
    thaiAt: DivinationMethodSummaryDto;
  };
  agreementCount: number;
  combinedVerdict: 'cat' | 'hung' | 'trungBinh';
  combinedLabel: string;
  narrative: string;
}
