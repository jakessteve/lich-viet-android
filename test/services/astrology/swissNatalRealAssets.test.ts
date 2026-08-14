import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  calculateSwissNatalChart,
  initializeBundledSwissNatalEphemeris,
} from '@/services/astrology/swissNatalChart';

describe('bundled Swiss browser integration', () => {
  let server: Server;
  let assetBaseUrl: string;

  beforeAll(async () => {
    server = createServer(async (request, response) => {
      try {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        const file = pathname === '/swisseph.wasm'
          ? resolve('node_modules/@swisseph/browser/dist/swisseph.wasm')
          : resolve('public', pathname.slice(1));
        const data = await readFile(file);
        response.writeHead(200, { 'Content-Type': pathname.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' });
        response.end(data);
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
    assetBaseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
  });

  afterAll(async () => {
    await new Promise<void>((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  });

  it('loads the real WASM and local ephemeris bundle for a fractional fixed offset', async () => {
    const ephemeris = await initializeBundledSwissNatalEphemeris(assetBaseUrl);
    const result = await calculateSwissNatalChart({
      birthDate: new Date(2000, 0, 1),
      birthHour: 12,
      birthMinute: 0,
      latitude: 21.0285,
      longitude: 105.8542,
      timezone: 7,
      locationName: 'Hà Nội',
    }, { ephemeris });

    expect(result.birth.utc).toBe('2000-01-01T05:00:00.000Z');
    expect(result.birth.houseSystem).toBe('placidus');
    expect(result.objects).toHaveLength(20);
    expect(result.houses).toHaveLength(12);
    expect(result.houses.every((house) => Number.isFinite(house.longitude))).toBe(true);
    expect(Object.values(result.angles).every((angle) => Number.isFinite(angle.longitude))).toBe(true);
    expect(result.objects.slice(0, 13).every((object) => Number.isFinite(object.rightAscension) && Number.isFinite(object.declination))).toBe(true);
    const byId = new Map(result.objects.map((object) => [object.id, object]));
    expect(byId.get('planet:sun')?.longitude).toBeCloseTo(280.071588, 2);
    expect(byId.get('planet:moon')?.longitude).toBeCloseTo(219.810978, 2);
    expect(result.angles.Ascendant.longitude).toBeCloseTo(14.346185, 2);
    expect(result.angles.Midheaven.longitude).toBeCloseTo(280.133922, 2);
    expect(byId.get('planet:sun')?.retrograde).toBe(false);
    for (const id of ['planet:saturn', 'lunar-point:true-north-node', 'derived:true-south-node', 'asteroid:pallas']) {
      expect(byId.get(id)?.retrograde, id).toBe(true);
    }
  }, 30_000);
});
