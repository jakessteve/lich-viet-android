/**
 * Unified Global Profile Store — Lịch Việt v3
 *
 * Single Source of Truth for user birth profiles, connecting all astrological modules
 * (Tử Vi, Western Astrology, Vedic Jyotish, Synastry) to the IndexedDB Local Vault
 * for zero-friction cross-system navigation without re-entering birth data.
 */

import { create } from 'zustand';
import {
  getAllVaultProfiles,
  saveVaultProfile,
  deleteVaultProfile,
  type VaultProfile,
} from '../services/storage/localVault';

export interface ActiveBirthProfile {
  id?: string;
  name: string;
  solarDate: string; // YYYY-MM-DD
  birthHour: number; // 0-11 for Chi (or 0-23 for solar hour)
  birthMinute: number;
  gender: 'nam' | 'nữ';
  birthplace: {
    locationName: string;
    lat: number;
    lng: number;
    timezone: number;
  };
}

const DEFAULT_PROFILE: ActiveBirthProfile = {
  name: 'Bản Thân',
  solarDate: '1995-05-15',
  birthHour: 5,
  birthMinute: 30,
  gender: 'nam',
  birthplace: {
    locationName: 'Hà Nội, Việt Nam',
    lat: 21.0285,
    lng: 105.8542,
    timezone: 7,
  },
};

interface ProfileVaultState {
  activeProfile: ActiveBirthProfile;
  savedProfiles: VaultProfile[];
  isLoading: boolean;

  // Actions
  setActiveProfile: (profile: Partial<ActiveBirthProfile>) => void;
  loadSavedProfiles: () => Promise<void>;
  saveCurrentAsProfile: (name: string) => Promise<VaultProfile>;
  selectSavedProfile: (profile: VaultProfile) => void;
  removeSavedProfile: (id: string) => Promise<void>;
}

export const useProfileVaultStore = create<ProfileVaultState>((set, get) => ({
  activeProfile: DEFAULT_PROFILE,
  savedProfiles: [],
  isLoading: false,

  setActiveProfile: (partial) => {
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        ...partial,
        birthplace: {
          ...state.activeProfile.birthplace,
          ...(partial.birthplace ?? {}),
        },
      },
    }));
  },

  loadSavedProfiles: async () => {
    set({ isLoading: true });
    try {
      const profiles = await getAllVaultProfiles();
      set({ savedProfiles: profiles, isLoading: false });
      if (profiles.length > 0 && !get().activeProfile.id) {
        const first = profiles[0];
        set({
          activeProfile: {
            id: first.id,
            name: first.name,
            solarDate: first.solarDate,
            birthHour: first.birthHour,
            birthMinute: first.birthMinute ?? 0,
            gender: first.gender,
            birthplace: first.birthplace ?? DEFAULT_PROFILE.birthplace,
          },
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  saveCurrentAsProfile: async (name: string) => {
    const current = get().activeProfile;
    const saved = await saveVaultProfile({
      name,
      solarDate: current.solarDate,
      birthHour: current.birthHour,
      birthMinute: current.birthMinute,
      gender: current.gender,
      birthplace: current.birthplace,
    });
    await get().loadSavedProfiles();
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        id: saved.id,
        name: saved.name,
      },
    }));
    return saved;
  },

  selectSavedProfile: (profile: VaultProfile) => {
    set({
      activeProfile: {
        id: profile.id,
        name: profile.name,
        solarDate: profile.solarDate,
        birthHour: profile.birthHour,
        birthMinute: profile.birthMinute ?? 0,
        gender: profile.gender,
        birthplace: profile.birthplace ?? DEFAULT_PROFILE.birthplace,
      },
    });
  },

  removeSavedProfile: async (id: string) => {
    await deleteVaultProfile(id);
    await get().loadSavedProfiles();
  },
}));
