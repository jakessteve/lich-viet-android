import { describe, expect, it, vi } from 'vitest';
import { createWesternNatalFixture } from '../../fixtures/westernNatalFixture';
import { saveWesternNatalChart } from '@/services/astrology/westernNatalSave';

describe('Western natal web/native save helper', () => {
  const pngHeader = (size: number) => {
    const bytes = new Uint8Array(24);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
    new DataView(bytes.buffer).setUint32(16, size);
    new DataView(bytes.buffer).setUint32(20, size);
    return new Blob([bytes], { type: 'image/png' });
  };

  it('downloads an SVG Blob on the web with a stable filename', async () => {
    const downloadWeb = vi.fn();

    const saved = await saveWesternNatalChart(createWesternNatalFixture(), 'svg', {
      theme: 'light',
      environment: { native: false, downloadWeb },
    });

    expect(saved.destination).toBe('web');
    expect(saved.filename).toMatch(/^western-natal-2000-01-01\.svg$/);
    expect(downloadWeb).toHaveBeenCalledOnce();
    expect(downloadWeb.mock.calls[0][0].type).toBe('image/svg+xml');
  });

  it('requests a 2x raster for PNG exports when configured for high-resolution output', async () => {
    const rasterize = vi.fn(async (_svg: string, size: number) => pngHeader(size));
    await saveWesternNatalChart(createWesternNatalFixture(), 'png', {
      size: 1180,
      pixelRatio: 2,
      rasterize,
      environment: { native: false, downloadWeb: vi.fn() },
    });
    expect(rasterize).toHaveBeenCalledWith(expect.any(String), 2360);
  });

  it('requests legacy Android public storage permission and writes under LichViet', async () => {
    const checkPublicStorage = vi.fn(async () => 'denied' as const);
    const requestPublicStorage = vi.fn(async () => 'granted' as const);
    const writeNative = vi.fn(async () => ({ uri: 'file:///Documents/LichViet/chart.png' }));
    const rasterize = vi.fn(async (_svg: string, size: number) => pngHeader(size));

    const saved = await saveWesternNatalChart(createWesternNatalFixture(), 'png', {
      theme: 'dark',
      rasterize,
      environment: {
        native: true,
        platform: 'android',
        checkPublicStorage,
        requestPublicStorage,
        writeNative,
      },
    });

    expect(saved.destination).toBe('documents');
    expect(saved.filename).toMatch(/\.png$/);
    expect(saved.uri).toBe('file:///Documents/LichViet/chart.png');
    expect(checkPublicStorage).toHaveBeenCalledOnce();
    expect(requestPublicStorage).toHaveBeenCalledOnce();
    expect(writeNative).toHaveBeenCalledOnce();
    expect(writeNative.mock.calls[0][0].data).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(writeNative.mock.calls[0][0].path).toBe(`LichViet/${saved.filename}`);
    expect(writeNative.mock.calls[0][0].recursive).toBe(true);
  });

  it('fails closed without writing when legacy Android storage permission is denied', async () => {
    const writeNative = vi.fn();

    await expect(saveWesternNatalChart(createWesternNatalFixture(), 'svg', {
      environment: {
        native: true,
        platform: 'android',
        checkPublicStorage: async () => 'denied',
        requestPublicStorage: async () => 'denied',
        writeNative,
      },
    })).rejects.toThrow(/storage permission/i);

    expect(writeNative).not.toHaveBeenCalled();
  });
});
