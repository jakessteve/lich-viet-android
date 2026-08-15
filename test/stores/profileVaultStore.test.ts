import { describe, it, expect, beforeEach } from 'vitest';
import { useProfileVaultStore } from '@/stores/profileVaultStore';
import { getDualLayerTerm } from '@/utils/jargonTranslator';

describe('useProfileVaultStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default profile and allows updating active profile', () => {
    const store = useProfileVaultStore.getState();
    expect(store.activeProfile.solarDate).toBeDefined();

    store.setActiveProfile({
      name: 'Nguyen Van B',
      solarDate: '2000-08-20',
      birthHour: 8,
    });

    const updated = useProfileVaultStore.getState();
    expect(updated.activeProfile.name).toBe('Nguyen Van B');
    expect(updated.activeProfile.solarDate).toBe('2000-08-20');
    expect(updated.activeProfile.birthHour).toBe(8);
  });
});

describe('getDualLayerTerm (Dual-Layer Terminology)', () => {
  it('retrieves classical term with supportive plain subtitle and psychological meaning', () => {
    const term = getDualLayerTerm('Apex');
    expect(term.classicalTerm).toContain('Apex');
    expect(term.plainSubtitleVi).toContain('áp lực');
    expect(term.psychologicalMeaningVi).toBeDefined();
    expect(term.actionableHintVi).toBeDefined();
  });

  it('retrieves Tử Vi terms without replacing classical names', () => {
    const triet = getDualLayerTerm('Triệt Không');
    expect(triet.classicalTerm).toContain('Triệt Không');
    expect(triet.plainSubtitleVi).toContain('30');
  });

  it('returns safe fallback for unlisted terms', () => {
    const custom = getDualLayerTerm('CustomAstrologicalTerm');
    expect(custom.classicalTerm).toBe('CustomAstrologicalTerm');
    expect(custom.plainSubtitleVi).toBeDefined();
  });
});
