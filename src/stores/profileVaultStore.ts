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
  loadSavedProfiles: (options?: { autoSelectFirst?: boolean }) => Promise<void>;
  saveCurrentAsProfile: (name: string) => Promise<VaultProfile>;
  selectSavedProfile: (profile: VaultProfile) => void;
  removeSavedProfile: (id: string) => Promise<void>;
}

export const useProfileVaultStore = create<ProfileVaultState>((set, get) => ({
  activeProfile: { ...DEFAULT_PROFILE },
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

  loadSavedProfiles: async (options = { autoSelectFirst: false }) => {
    set({ isLoading: true });
    try {
      const profiles = await getAllVaultProfiles();
      set({ savedProfiles: profiles, isLoading: false });
      if (options.autoSelectFirst && profiles.length > 0 && !get().activeProfile.id) {
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
    const sanitizedName = (name || '').trim() || current.name || 'Bản Thân';

    const saved = await saveVaultProfile({
      name: sanitizedName,
      solarDate: current.solarDate,
      birthHour: current.birthHour,
      birthMinute: current.birthMinute,
      gender: current.gender,
      birthplace: current.birthplace,
    });

    // Atomic update: set the saved profile directly as active BEFORE reloading list
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        id: saved.id,
        name: saved.name,
      },
    }));

    // Reload list without clobbering the active profile
    await get().loadSavedProfiles({ autoSelectFirst: false });
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
    const profiles = await getAllVaultProfiles();
    const currentActiveId = get().activeProfile.id;

    if (currentActiveId === id) {
      if (profiles.length > 0) {
        const fallback = profiles[0];
        set({
          savedProfiles: profiles,
          activeProfile: {
            id: fallback.id,
            name: fallback.name,
            solarDate: fallback.solarDate,
            birthHour: fallback.birthHour,
            birthMinute: fallback.birthMinute ?? 0,
            gender: fallback.gender,
            birthplace: fallback.birthplace ?? DEFAULT_PROFILE.birthplace,
          },
        });
      } else {
        set({
          savedProfiles: [],
          activeProfile: { ...DEFAULT_PROFILE },
        });
      }
    } else {
      set({ savedProfiles: profiles });
    }
  },
}));
