import { describe, it, expect } from 'vitest';
import { normalizeUserTier, checkFeatureAccess } from '@/utils/tierGuard';

describe('tierGuard', () => {
  describe('normalizeUserTier', () => {
    it('normalizes undefined, guest, free, and curious to free', () => {
      expect(normalizeUserTier(undefined)).toBe('free');
      expect(normalizeUserTier('guest')).toBe('free');
      expect(normalizeUserTier('free')).toBe('free');
      expect(normalizeUserTier('curious')).toBe('free');
      expect(normalizeUserTier('unknown')).toBe('free');
    });

    it('normalizes premium and pro to pro', () => {
      expect(normalizeUserTier('premium')).toBe('pro');
      expect(normalizeUserTier('pro')).toBe('pro');
    });

    it('normalizes expert and admin to expert', () => {
      expect(normalizeUserTier('expert')).toBe('expert');
      expect(normalizeUserTier('admin')).toBe('expert');
    });
  });

  describe('checkFeatureAccess', () => {
    it('blocks Free users from Pro/Expert features and provides reasons', () => {
      const scanAccess = checkFeatureAccess('bulk_date_scan_long', 'free');
      expect(scanAccess.allowed).toBe(false);
      expect(scanAccess.minTierRequired).toBe('pro');
      expect(scanAccess.title).toBeDefined();
      expect(scanAccess.reason).toBeDefined();

      const pdfAccess = checkFeatureAccess('tuvi_pdf_export', 'free');
      expect(pdfAccess.allowed).toBe(false);

      const aiAccess = checkFeatureAccess('ai_interpretation', 'free');
      expect(aiAccess.allowed).toBe(false);
      expect(aiAccess.minTierRequired).toBe('expert');
    });

    it('allows Pro users access to Pro features but blocks Expert features', () => {
      const pdfAccess = checkFeatureAccess('tuvi_pdf_export', 'pro');
      expect(pdfAccess.allowed).toBe(true);

      const aiAccess = checkFeatureAccess('ai_interpretation', 'pro');
      expect(aiAccess.allowed).toBe(false);
      expect(aiAccess.minTierRequired).toBe('expert');
    });

    it('allows Expert/Admin users access to all features', () => {
      const pdfAccess = checkFeatureAccess('tuvi_pdf_export', 'expert');
      expect(pdfAccess.allowed).toBe(true);

      const aiAccess = checkFeatureAccess('ai_interpretation', 'expert');
      expect(aiAccess.allowed).toBe(true);

      const adminAiAccess = checkFeatureAccess('ai_interpretation', 'admin');
      expect(adminAiAccess.allowed).toBe(true);
    });
  });
});
