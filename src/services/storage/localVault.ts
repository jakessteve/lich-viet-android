/**
 * IndexedDB Local Vault Storage & 1-Click Backup/Restore — Lịch Việt v3
 *
 * Provides a secure, offline-first local database for storing user birth profiles
 * with zero-server transmission and JSON backup/restore capabilities.
 */

import { sanitizeCoordinates, sanitizePlainText } from '@/utils/security';

export interface VaultProfile {
  id: string;
  name: string;
  solarDate: string; // ISO string YYYY-MM-DD
  birthHour: number; // 0-11
  birthMinute?: number;
  gender: 'nam' | 'nữ';
  birthplace?: {
    locationName: string;
    lat: number;
    lng: number;
    timezone: number;
  };
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'LichVietLocalVault';
const DB_VERSION = 1;
const STORE_NAME = 'profiles';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readSafeLocalStorageList(): VaultProfile[] {
  try {
    const raw = localStorage.getItem('vault_profiles_backup');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VaultProfile[]) : [];
  } catch {
    return [];
  }
}

function writeSafeLocalStorageList(list: VaultProfile[]): void {
  try {
    localStorage.setItem('vault_profiles_backup', JSON.stringify(list));
  } catch {
    // Ignore storage quota edge cases
  }
}

/**
 * Saves or updates a profile in the IndexedDB Local Vault.
 */
export async function saveVaultProfile(
  profile: Omit<VaultProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<VaultProfile> {
  const now = Date.now();
  const rawCoords = profile.birthplace;
  const safeCoords = rawCoords ? sanitizeCoordinates(rawCoords.lat, rawCoords.lng) : { lat: 21.0285, lng: 105.8542 };

  const sanitizedBirthplace = rawCoords
    ? {
        locationName: sanitizePlainText(rawCoords.locationName || 'Việt Nam', 100),
        lat: safeCoords.lat,
        lng: safeCoords.lng,
        timezone: Math.max(-12, Math.min(14, rawCoords.timezone ?? 7)),
      }
    : undefined;

  const rawHour = Number(profile.birthHour);
  const safeHour = Number.isFinite(rawHour) ? Math.max(0, Math.min(23, Math.floor(rawHour))) : 0;
  const rawMinute = profile.birthMinute != null ? Number(profile.birthMinute) : undefined;
  const safeMinute =
    rawMinute != null && Number.isFinite(rawMinute) ? Math.max(0, Math.min(59, Math.floor(rawMinute))) : undefined;

  const fullProfile: VaultProfile = {
    id: profile.id || `profile_${now}_${Math.random().toString(36).slice(2, 8)}`,
    name: sanitizePlainText(profile.name || 'Hồ Sơ', 60),
    solarDate: profile.solarDate,
    birthHour: safeHour,
    birthMinute: safeMinute,
    gender: profile.gender === 'nữ' ? 'nữ' : 'nam',
    birthplace: sanitizedBirthplace,
    notes: profile.notes ? sanitizePlainText(profile.notes, 500) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fullProfile);

      req.onsuccess = () => resolve(fullProfile);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = readSafeLocalStorageList();
    const idx = list.findIndex((p) => p.id === fullProfile.id);
    if (idx >= 0) list[idx] = fullProfile;
    else list.push(fullProfile);
    writeSafeLocalStorageList(list);
    return fullProfile;
  }
}

/**
 * Retrieves all saved profiles from the Vault.
 */
export async function getAllVaultProfiles(): Promise<VaultProfile[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result as VaultProfile[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return readSafeLocalStorageList();
  }
}

/**
 * Deletes a profile from the Vault by ID.
 */
export async function deleteVaultProfile(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = readSafeLocalStorageList();
    const filtered = list.filter((p) => p.id !== id);
    writeSafeLocalStorageList(filtered);
  }
}

/**
 * Exports all profiles to a JSON string for 1-click local backup.
 */
export async function exportVaultBackupJson(): Promise<string> {
  const profiles = await getAllVaultProfiles();
  const backupData = {
    version: 1,
    appName: 'LichViet',
    exportedAt: new Date().toISOString(),
    profileCount: profiles.length,
    profiles,
  };
  return JSON.stringify(backupData, null, 2);
}

/**
 * Imports profiles from a backup JSON string.
 */
export async function importVaultBackupJson(jsonString: string): Promise<{ importedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let importedCount = 0;

  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.profiles)) {
      throw new Error('Dữ liệu sao lưu không đúng định dạng');
    }

    for (const p of parsed.profiles) {
      if (!p || typeof p !== 'object' || !p.name || !p.solarDate) {
        errors.push(`Hồ sơ thiếu thông tin bắt buộc: ${JSON.stringify(p)}`);
        continue;
      }
      await saveVaultProfile(p);
      importedCount++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi xử lý file JSON';
    errors.push(message);
  }

  return { importedCount, errors };
}
