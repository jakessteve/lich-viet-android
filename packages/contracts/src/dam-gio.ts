export interface DamGioRecord {
  id: string;
  userId: string;
  deceasedName: string;
  relationship: string;
  lunarDay: number;
  lunarMonth: number;
  isLeapMonth?: boolean | undefined;
  notes?: string | undefined;
  alarmLeadDays: number[]; // e.g. [1, 3, 7]
  syncedAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDamGioDto {
  deceasedName: string;
  relationship: string;
  lunarDay: number;
  lunarMonth: number;
  isLeapMonth?: boolean | undefined;
  notes?: string | undefined;
  alarmLeadDays: number[];
}

export interface UpdateDamGioDto {
  deceasedName?: string | undefined;
  relationship?: string | undefined;
  lunarDay?: number | undefined;
  lunarMonth?: number | undefined;
  isLeapMonth?: boolean | undefined;
  notes?: string | undefined;
  alarmLeadDays?: number[] | undefined;
}
