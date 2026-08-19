import { describe, it, expect } from 'vitest';
import {
  TuViBirthInputSchema,
  WesternChartInputSchema,
  VedicChartInputSchema,
  MaiHoaInputSchema,
  TamThucInputSchema,
  ApiEnvelope,
  createApiEnvelopeSchema,
  UserProfileSchema,
} from '@lich-viet/contracts';
import { LichVietApiClient } from '@lich-viet/api-client';

describe('Contract Freshness & Zod Schema Integrity Gate (DIR-04)', () => {
  describe('Input Validation Schemas', () => {
    it('validates a valid TuViBirthInput payload', () => {
      const validPayload = {
        name: 'Nguyễn Văn A',
        solarDate: '1995-08-15',
        birthHour: 10,
        birthMinute: 30,
        gender: 'nam',
        school: 'thien-luong',
        timezone: 7,
      };

      const parsed = TuViBirthInputSchema.parse(validPayload);
      expect(parsed.solarDate).toBe('1995-08-15');
      expect(parsed.gender).toBe('nam');
      expect(parsed.birthHour).toBe(10);
    });

    it('rejects invalid birthHour or gender in TuViBirthInput', () => {
      const invalidPayload = {
        solarDate: '1995-08-15',
        birthHour: 25, // Out of bounds
        gender: 'other', // Invalid enum
      };

      const result = TuViBirthInputSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('validates Western & Vedic Chart Input schemas', () => {
      const westernPayload = {
        birthDate: '1995-08-15T10:30:00.000Z',
        birthHour: 10,
        birthMinute: 30,
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: 7,
        houseSystem: 'placidus',
        zodiacMode: 'tropical',
      };

      const parsedWestern = WesternChartInputSchema.parse(westernPayload);
      expect(parsedWestern.latitude).toBe(21.0285);
      expect(parsedWestern.houseSystem).toBe('placidus');

      const vedicPayload = {
        ...westernPayload,
        ayanamsa: 'lahiri',
      };
      const parsedVedic = VedicChartInputSchema.parse(vedicPayload);
      expect(parsedVedic.ayanamsa).toBe('lahiri');
    });

    it('validates Mai Hoa and Tam Thuc input schemas', () => {
      const maiHoaPayload = {
        number1: 15,
        number2: 24,
        query: 'Công danh',
      };
      const parsedMaiHoa = MaiHoaInputSchema.parse(maiHoaPayload);
      expect(parsedMaiHoa.number1).toBe(15);
      expect(parsedMaiHoa.query).toBe('Công danh');

      const tamThucPayload = {
        date: '2025-06-15T10:30:00.000Z',
        timezone: 7,
      };
      const parsedTamThuc = TamThucInputSchema.parse(tamThucPayload);
      expect(parsedTamThuc.timezone).toBe(7);
    });
  });

  describe('Standard ApiEnvelope Envelope Structure', () => {
    it('correctly constructs and parses ApiEnvelope', () => {
      const envelopeSchema = createApiEnvelopeSchema(UserProfileSchema);

      const envelope: ApiEnvelope = {
        ok: true,
        data: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tier: 'free',
          createdAt: new Date().toISOString(),
        },
        meta: {
          traceId: 'trace-abc-123',
          timestamp: new Date().toISOString(),
        },
      };

      const parsed = envelopeSchema.parse(envelope);
      expect(parsed.ok).toBe(true);
      expect(parsed.meta?.traceId).toBe('trace-abc-123');
    });
  });

  describe('LichVietApiClient SDK Export & Instantiation', () => {
    it('instantiates client cleanly with auth token handling', () => {
      const client = new LichVietApiClient('http://localhost:3000');
      expect(client.getToken()).toBeNull();

      client.setToken('test-token-xyz');
      expect(client.getToken()).toBe('test-token-xyz');
    });
  });
});
