import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../../packages/app-backend/src/main.js';
import {
  createCalendarDayDetail,
  createTuViChartReadiness,
  ElectionService
} from '../../packages/app-backend/src/index.js';

interface StreamEventItem {
  type: string;
  payload: Record<string, unknown>;
}

describe('NestJS Fastify Metaphysical Backend Server', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await createApp();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Calendar & Dụng Sự Endpoints', () => {
    it('GET /v1/calendar/day returns accurate solar/lunar calendar data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/calendar/day?date=2026-08-16&timezone=7'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('calendar-day-detail');
      expect(data.canChi).toBeDefined();
      expect(data.canChi.day.can).toBeDefined();
      expect(data.canChi.day.chi).toBeDefined();
      expect(data.lunarDate).toBeDefined();

      // Golden comparison against pure engine
      const golden = createCalendarDayDetail({
        date: new Date('2026-08-16'),
        location: { timezone: 7 }
      });
      expect(data.canChi.year.can).toBe(golden.canChi.year.can);
      expect(data.canChi.year.chi).toBe(golden.canChi.year.chi);
    });

    it('GET /v1/calendar/dung-su/catalog returns full event catalog', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/calendar/dung-su/catalog'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('dung-su-catalog');
      expect(data.intents.length).toBeGreaterThan(0);
    });

    it('POST /v1/calendar/dung-su/score calculates event suitability', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/calendar/dung-su/score',
        payload: {
          date: '2026-08-16',
          profileId: 'ds_kai_shi'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('dung-su-score-detail');
      expect(data.eventId).toBe('ds_kai_shi');
      expect(data.score).toBeDefined();
    });
  });

  describe('Tử Vi Đẩu Số Endpoint', () => {
    it('POST /v1/tu-vi/chart generates full 12-palace astrological chart', async () => {
      const payload = {
        birthDate: '1990-05-15T08:30:00.000Z',
        gender: 'male' as const,
        name: 'Nguyễn Văn Test',
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: 7.0,
        school: 'nam_phai' as const
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/tu-vi/chart',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('tu-vi-chart-readiness');
      expect(data.chart.palaces).toHaveLength(12);
      expect(data.chart.menhPalaceIndex).toBeGreaterThanOrEqual(0);
      expect(data.chart.thanPalaceIndex).toBeGreaterThanOrEqual(0);
      expect(data.chart.cucNumber).toBeDefined();

      // Golden comparison
      const golden = createTuViChartReadiness({
        birthProfile: {
          profileId: payload.name,
          birthTimestamp: new Date(payload.birthDate).getTime(),
          latitude: payload.latitude,
          longitude: payload.longitude,
          timezone: payload.timezone,
          gender: payload.gender
        },
        school: payload.school
      });
      expect(data.chart.menhPalaceIndex).toBe(golden.chart.menhPalaceIndex);
      expect(data.chart.thanPalaceIndex).toBe(golden.chart.thanPalaceIndex);
      expect(data.chart.cucNumber).toBe(golden.chart.cucNumber);
    });
  });

  describe('Astrology (Western, Vedic & Synastry) Endpoints', () => {
    it('POST /v1/astrology/western calculates Western natal chart with Placidus houses', async () => {
      const payload = {
        birthDate: '1995-10-24T14:30:00.000Z',
        birthLocation: {
          latitude: 21.0285,
          longitude: 105.8542,
          altitudeMeters: 19,
          timezone: 7.0
        },
        houseSystem: 'placidus' as const
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/astrology/western',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('western-chart');
      expect(data.planets.length).toBeGreaterThan(5);
      expect(data.houses.cusps).toHaveLength(12);
      expect(data.aspects.major.length).toBeGreaterThan(0);
    });

    it('POST /v1/astrology/vedic calculates Vedic Kundli with D1 & D9 Navamsha', async () => {
      const payload = {
        birthDate: '1995-10-24T14:30:00.000Z',
        birthLocation: {
          latitude: 21.0285,
          longitude: 105.8542,
          altitudeMeters: 19,
          timezone: 7.0
        },
        ayanamsa: 'lahiri'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/astrology/vedic',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('vedic-kundli');
      expect(data.divisional.D1).toBeDefined();
      expect(data.divisional.D9).toBeDefined();
      expect(data.dashas).toBeDefined();
    });

    it('POST /v1/astrology/synastry calculates relationship compatibility', async () => {
      const payload = {
        person1: {
          birthDate: '1990-05-15T08:30:00.000Z',
          birthLocation: { latitude: 21.0285, longitude: 105.8542, timezone: 7.0 }
        },
        person2: {
          birthDate: '1992-08-20T10:15:00.000Z',
          birthLocation: { latitude: 10.8231, longitude: 106.6297, timezone: 7.0 }
        }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/astrology/synastry',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('synastry-readiness');
      expect(data.westernSynastry).toBeDefined();
      expect(data.vedicAshtakoot).toBeDefined();
      expect(data.tuViSynastry).toBeDefined();
    });
  });

  describe('Divination (Mai Hoa & Tam Thức) Endpoints', () => {
    it('POST /v1/divination/mai-hoa casts hexagram from numbers', async () => {
      const payload = {
        number1: 8,
        number2: 3,
        number3: 5,
        query: 'Khai trương'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/divination/mai-hoa',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('mai-hoa-reading');
      expect(data.mainHexagram).toBeDefined();
      expect(data.mainHexagram.id).toBeGreaterThanOrEqual(1);
    });

    it('POST /v1/divination/tam-thuc synthesizes QMDJ, Thái Ất, và Lục Nhâm', async () => {
      const payload = {
        date: '2026-08-16T14:30:00.000Z',
        timezone: 7.0
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/divination/tam-thuc',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.kind).toBe('tam-thuc-reading');
      expect(data.methods.qmdj).toBeDefined();
      expect(data.methods.thaiAt).toBeDefined();
      expect(data.methods.daiLucNham).toBeDefined();
    });
  });

  describe('Election (Ngày Tốt & Async Scans) Endpoints', () => {
    it('POST /v1/election/scan calculates synchronous election scan envelope', async () => {
      const payload = {
        request: {
          taskId: 'test-scan-001',
          dungSuEventId: 'ds_kai_shi',
          userBirthData: {
            jd: 2460826.5,
            lat: 10.8231,
            lng: 106.6297,
            alt: 19
          },
          searchWindow: {
            startJd: 2460826.5,
            endJd: 2460827.5
          }
        },
        options: {
          chunkHours: 24,
          strictMode: true
        }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/v1/election/scan',
        payload
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.request.taskId).toBe('test-scan-001');
      expect(data.events[0].type).toBe('omce:progress');
      expect(data.events.at(-1).type).toBe('omce:result');
      expect(data.response.status).toBe('completed');
    });

    it('ElectionService.streamScan emits chunked SSE progress/chunk/result events', async () => {
      const electionService = app.get(ElectionService);
      const payload = {
        request: {
          taskId: 'test-scan-stream-001',
          dungSuEventId: 'ds_kai_shi',
          userBirthData: {
            jd: 2460826.5,
            lat: 10.8231,
            lng: 106.6297,
            alt: 19
          },
          searchWindow: {
            startJd: 2460826.5,
            endJd: 2460827.5
          }
        },
        options: {
          chunkHours: 24,
          strictMode: true
        }
      };

      const events: StreamEventItem[] = [];
      await new Promise<void>((resolve, reject) => {
        electionService.streamScan(payload).subscribe({
          next: (event) => events.push(event.data as StreamEventItem),
          complete: () => resolve(),
          error: (err) => reject(err)
        });
      });

      expect(events.length).toBeGreaterThanOrEqual(3);
      expect(events[0].type).toBe('omce:progress');
      expect(events[0].payload.taskId).toBe('test-scan-stream-001');
      expect(events.at(-1).type).toBe('omce:result');
      expect(events.at(-1).payload.status).toBe('completed');
    });
  });
});
