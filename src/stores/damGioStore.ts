import { create } from 'zustand';
import { DamGioRecord, CreateDamGioDto, UpdateDamGioDto } from '@lich-viet/contracts';
import { getRuntime } from '@/gateways/bootstrap';

const DAM_GIO_LOCAL_STORAGE_KEY = 'lichviet_dam_gio_cache';

interface DamGioState {
  records: DamGioRecord[];
  isLoading: boolean;
  error: string | null;

  fetchDamGio: () => Promise<void>;
  createDamGio: (entry: CreateDamGioDto) => Promise<DamGioRecord>;
  updateDamGio: (id: string, entry: UpdateDamGioDto) => Promise<DamGioRecord>;
  deleteDamGio: (id: string) => Promise<void>;
  getUpcomingRecords: (lunarMonth: number, lunarDay: number) => DamGioRecord[];
  clearError: () => void;
}

function loadCachedRecords(): DamGioRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DAM_GIO_LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DamGioRecord[]) : [];
  } catch {
    return [];
  }
}

function saveCachedRecords(records: DamGioRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAM_GIO_LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota edge cases
  }
}

export const useDamGioStore = create<DamGioState>((set, get) => ({
  records: loadCachedRecords(),
  isLoading: false,
  error: null,

  fetchDamGio: async () => {
    set({ isLoading: true, error: null });
    try {
      const runtime = getRuntime();
      const records = await runtime.damGio.listDamGio();
      saveCachedRecords(records);
      set({ records, isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Không thể tải danh sách ngày giỗ',
      });
    }
  },

  createDamGio: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const runtime = getRuntime();
      const created = await runtime.damGio.createDamGio(entry);
      const next = [created, ...get().records];
      saveCachedRecords(next);
      set({ records: next, isLoading: false });
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tạo ngày giỗ';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  updateDamGio: async (id, entry) => {
    set({ isLoading: true, error: null });
    try {
      const runtime = getRuntime();
      const updated = await runtime.damGio.updateDamGio(id, entry);
      const next = get().records.map((r) => (r.id === id ? updated : r));
      saveCachedRecords(next);
      set({ records: next, isLoading: false });
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật ngày giỗ';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  deleteDamGio: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const runtime = getRuntime();
      await runtime.damGio.deleteDamGio(id);
      const next = get().records.filter((r) => r.id !== id);
      saveCachedRecords(next);
      set({ records: next, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xóa ngày giỗ';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  getUpcomingRecords: (lunarMonth, lunarDay) => {
    const { records } = get();
    return records.filter((r) => {
      if (r.lunarMonth !== lunarMonth) return false;
      return lunarDay === undefined || r.lunarDay >= lunarDay;
    });
  },

  clearError: () => set({ error: null }),
}));
