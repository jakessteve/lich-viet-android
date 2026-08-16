import { describe, it, expect } from 'vitest';
import { checkHoraryRadicality, judgeHoraryChart } from '@omce/core-logic';

describe('Horary Astrology Engine', () => {
  it('detects early Ascendant (< 3°) and late Ascendant (> 27°) radicality warnings', () => {
    const early = checkHoraryRadicality(1.5, 'Aries', 100);
    expect(early.isRadical).toBe(false);
    expect(early.warnings.some((w) => w.type === 'early_ascendant')).toBe(true);

    const late = checkHoraryRadicality(28.5, 'Aries', 100);
    expect(late.isRadical).toBe(false);
    expect(late.warnings.some((w) => w.type === 'late_ascendant')).toBe(true);

    const radical = checkHoraryRadicality(15.0, 'Aries', 100);
    expect(radical.isRadical).toBe(true);
  });

  it('detects Moon in Via Combusta (15° Libra to 15° Scorpio)', () => {
    // 200° is in Scorpio (180 + 20) -> Via Combusta is 195° - 225°
    const viaCombusta = checkHoraryRadicality(15.0, 'Aries', 205);
    expect(viaCombusta.warnings.some((w) => w.type === 'via_combusta')).toBe(true);
  });

  it('evaluates Horary question judgment with significators and aspects', () => {
    const houseCusps = Array.from({ length: 12 }, (_, i) => i * 30);
    const planets = [
      { body: 'mars', tropicalLongitude: 10, house: 1 }, // Lord of 1st (Aries)
      { body: 'venus', tropicalLongitude: 12, house: 7 }, // Lord of 7th (Libra)
      { body: 'moon', tropicalLongitude: 45, house: 2 },
    ];

    const result = judgeHoraryChart({
      topicId: 'love',
      houseCusps,
      planets,
      ascendantLongitude: 10, // 10° Aries
    });

    expect(result.querentSignificators.primary).toBe('mars');
    expect(result.quesitedSignificators.primary).toBe('venus');
    expect(result.aspectPerfection).toBe('conjunction');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(70);
  });
});
