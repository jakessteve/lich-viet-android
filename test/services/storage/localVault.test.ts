import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveVaultProfile,
  getAllVaultProfiles,
  exportVaultBackupJson,
  importVaultBackupJson,
} from '@/services/storage/localVault';
import { escapeHtml, escapeSvgText, sanitizePlainText, sanitizeCoordinates } from '@/utils/security';

describe('Security & Sanitization Utilities', () => {
  it('escapes unsafe HTML characters to prevent XSS', () => {
    const raw = '<script>alert("xss")</script> & \'test\'';
    const escaped = escapeHtml(raw);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&#039;');
  });

  it('escapes SVG text characters safely', () => {
    const svgInput = '<text onmouseover="evil()">User & Name</text>';
    const escaped = escapeSvgText(svgInput);
    expect(escaped).toContain('&lt;text');
    expect(escaped).toContain('&amp;');
    expect(escaped).not.toContain('<text');
  });

  it('sanitizes plain text and enforces max length', () => {
    const dirty = '<b>Nguyen Van A</b><script>eval()</script> javascript:void(0)';
    const clean = sanitizePlainText(dirty, 20);
    expect(clean).not.toContain('<b>');
    expect(clean).not.toContain('javascript:');
    expect(clean.length).toBeLessThanOrEqual(20);
  });

  it('normalizes latitude and longitude boundaries', () => {
    expect(sanitizeCoordinates(150, 250)).toEqual({ lat: 90, lng: 180 });
    expect(sanitizeCoordinates(-120, -300)).toEqual({ lat: -90, lng: -180 });
    expect(sanitizeCoordinates(21.0285, 105.8542)).toEqual({ lat: 21.0285, lng: 105.8542 });
  });
});

describe('IndexedDB Local Vault Storage (with fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves profiles', async () => {
    const profile = await saveVaultProfile({
      name: 'Nguyen Van Test',
      solarDate: '1995-05-15',
      birthHour: 5,
      gender: 'nam',
    });

    expect(profile.id).toBeDefined();
    expect(profile.name).toBe('Nguyen Van Test');

    const all = await getAllVaultProfiles();
    expect(all.some((p) => p.name === 'Nguyen Van Test')).toBe(true);
  });

  it('exports and imports backup JSON', async () => {
    await saveVaultProfile({
      name: 'User A',
      solarDate: '1990-01-01',
      birthHour: 2,
      gender: 'nữ',
    });

    const json = await exportVaultBackupJson();
    expect(json).toContain('User A');
    expect(json).toContain('LichViet');

    const importRes = await importVaultBackupJson(json);
    expect(importRes.importedCount).toBeGreaterThanOrEqual(1);
    expect(importRes.errors).toHaveLength(0);
  });

  it('resiliently handles corrupted localStorage JSON without throwing', async () => {
    localStorage.setItem('vault_profiles_backup', '{ invalid corrupted json content ...');

    // Should return empty array or handle gracefully instead of throwing
    const profiles = await getAllVaultProfiles();
    expect(Array.isArray(profiles)).toBe(true);

    // Saving should still succeed by resetting corrupted list safely
    const saved = await saveVaultProfile({
      name: 'Resilient Profile',
      solarDate: '1998-08-08',
      birthHour: 10,
      gender: 'nam',
    });
    expect(saved.name).toBe('Resilient Profile');
  });

  it('sanitizes and clamps boundaries on imported backup profiles', async () => {
    const maliciousJson = JSON.stringify({
      version: 1,
      appName: 'LichViet',
      profiles: [
        {
          name: '<b>Bad User</b><script>alert(1)</script>',
          solarDate: '1992-04-10',
          birthHour: -99,
          birthMinute: 150,
          gender: 'invalid',
          birthplace: {
            locationName: 'Overloaded City',
            lat: 500,
            lng: -999,
            timezone: 25,
          },
        },
      ],
    });

    const result = await importVaultBackupJson(maliciousJson);
    expect(result.importedCount).toBe(1);

    const all = await getAllVaultProfiles();
    const imported = all.find((p) => p.solarDate === '1992-04-10');
    expect(imported).toBeDefined();
    expect(imported?.name).not.toContain('<script>');
    expect(imported?.birthHour).toBe(0); // clamped to min 0
    expect(imported?.birthMinute).toBe(59); // clamped to max 59
    expect(imported?.gender).toBe('nam'); // default fallback
    expect(imported?.birthplace?.lat).toBe(90); // clamped to 90
    expect(imported?.birthplace?.lng).toBe(-180); // clamped to -180
    expect(imported?.birthplace?.timezone).toBe(14); // clamped to max 14
  });
});
