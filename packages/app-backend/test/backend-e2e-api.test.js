import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/main.js';

test('NestJS Fastify Backend E2E - Full API Route Suite', async (t) => {
  process.env.NODE_ENV = 'test';
  const app = await createApp();
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  await t.test('1. GET /v1/calendar/day', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/calendar/day?date=2026-08-18&timezone=7',
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.date && typeof body.date.isoDate === 'string');
    assert.ok(body.lunarDate !== undefined);
    assert.ok(body.canChi !== undefined);
  });

  await t.test('2. GET /v1/calendar/dung-su/catalog', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/calendar/dung-su/catalog',
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.categories) || typeof body === 'object');
  });

  await t.test('3. POST /v1/tu-vi/chart', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/tu-vi/chart',
      payload: {
        name: 'Nguyễn Văn A',
        birthYear: 1995,
        birthMonth: 8,
        birthDay: 15,
        birthHour: 10,
        birthMinute: 30,
        gender: 'male',
        viewYear: 2026,
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.chart !== undefined || body.cuc !== undefined || body.palaces !== undefined);
  });

  await t.test('4. POST /v1/astrology/western', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/astrology/western',
      payload: {
        birthDate: '1995-08-15T10:30:00.000Z',
        birthLocation: {
          latitude: 21.0285,
          longitude: 105.8542,
          altitudeMeters: 19,
          timezone: 7,
        },
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.planets !== undefined || body.aspects !== undefined || body.ascendant !== undefined || body.summary !== undefined);
  });

  await t.test('5. POST /v1/astrology/vedic', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/astrology/vedic',
      payload: {
        birthDate: '1995-08-15T10:30:00.000Z',
        birthLocation: {
          latitude: 21.0285,
          longitude: 105.8542,
          altitudeMeters: 19,
          timezone: 7,
        },
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.d1 !== undefined || body.nakshatra !== undefined || body.dashas !== undefined || body.lagna !== undefined || body.summary !== undefined);
  });

  await t.test('6. POST /v1/divination/mai-hoa', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/divination/mai-hoa',
      payload: {
        date: '2026-08-18T10:30:00.000Z',
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.mainHexagram !== undefined || body.reading !== undefined || body.upperTrigram !== undefined || body.hexagram !== undefined);
  });

  await t.test('7. POST /v1/divination/tam-thuc', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/divination/tam-thuc',
      payload: {
        date: '2026-08-18T10:30:00.000Z',
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.methods !== undefined && body.methods.qmdj !== undefined);
  });

  await t.test('8. POST /v1/election/scan', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/election/scan',
      payload: {
        request: {
          taskId: 'e2e-scan-test',
          userBirthData: {
            jd: 2450000.5,
            lat: 21.0285,
            lng: 105.8542,
            alt: 19,
          },
          searchWindow: {
            startJd: 2460826.5,
            endJd: 2460827.5,
          },
        },
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.envelope !== undefined || body.timeline !== undefined || body.status !== undefined || body.response !== undefined);
  });

  await app.close();
});
