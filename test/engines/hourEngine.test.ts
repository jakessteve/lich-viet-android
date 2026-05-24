import { describe, it, expect } from 'vitest';
import { getHourCanChi } from '@/utils/hourEngine';

describe('hourEngine', () => {
  describe('getHourCanChi()', () => {
    it('returns correct hour Can Chi for Giáp day starting at Tý', () => {
      const result = getHourCanChi('Giáp', 'Tý');
      expect(result).toEqual({ can: 'Giáp', chi: 'Tý' });
    });

    it('returns correct hour Can Chi for Giáp day at Sửu', () => {
      const result = getHourCanChi('Giáp', 'Sửu');
      expect(result).toEqual({ can: 'Ất', chi: 'Sửu' });
    });

    it('returns correct hour Can Chi for Giáp day at Dần', () => {
      const result = getHourCanChi('Giáp', 'Dần');
      expect(result).toEqual({ can: 'Bính', chi: 'Dần' });
    });

    it('returns correct hour Can Chi for Ất day at Tý', () => {
      const result = getHourCanChi('Ất', 'Tý');
      expect(result).toEqual({ can: 'Bính', chi: 'Tý' });
    });

    it('returns correct hour Can Chi for Canh day at Tý', () => {
      const result = getHourCanChi('Canh', 'Tý');
      expect(result).toEqual({ can: 'Bính', chi: 'Tý' });
    });

    it('returns correct hour Can Chi for Canh day at Ngọ', () => {
      const result = getHourCanChi('Canh', 'Ngọ');
      expect(result).toEqual({ can: 'Nhâm', chi: 'Ngọ' });
    });

    it('returns correct hour Can Chi for Nhâm day at Tý', () => {
      const result = getHourCanChi('Nhâm', 'Tý');
      expect(result).toEqual({ can: 'Canh', chi: 'Tý' });
    });
  });
});
