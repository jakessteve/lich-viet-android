import { describe, it, expect, beforeEach } from 'vitest';
import { safeStorage, sanitizeParsedJson } from '@/utils/safeStorage';

describe('Storage Resilience & Prototype Pollution Security Suite (F-06, DIR-08, DIR-09)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('safely gets and sets items in LocalStorage', () => {
    safeStorage.setItem('test_key', { name: 'Lịch Việt', version: '3.1.0' });
    const read = safeStorage.getItem<{ name: string; version: string }>('test_key');
    expect(read).toEqual({ name: 'Lịch Việt', version: '3.1.0' });
  });

  it('blocks Prototype Pollution payloads and returns null (DIR-09)', () => {
    const maliciousPayload = JSON.parse('{"__proto__": {"polluted": true}, "name": "attacker"}');
    const sanitized = sanitizeParsedJson(maliciousPayload);
    expect(sanitized).toBeNull();
  });

  it('handles corrupted/malformed JSON in storage gracefully without crashing', () => {
    localStorage.setItem('corrupted_key', '{"incomplete_json:');
    const read = safeStorage.getItem('corrupted_key', { fallback: true });
    expect(read).toEqual({ fallback: true });
  });
});
