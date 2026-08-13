import { toJpeg } from 'html-to-image';

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadTuViChartAsImage(selector: string, filename: string): Promise<void> {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error('Không tìm thấy bảng Tử Vi để xuất ảnh.');
  }

  // Ensure fonts are loaded before capturing
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const safeFilename = filename.replace(/\.(png|svg|webp)$/i, '.jpg');

  try {
    const dataUrl = await toJpeg(element, { quality: 0.94, pixelRatio: 2, backgroundColor: '#ffffff' });
    downloadDataUrl(dataUrl, safeFilename);
  } catch (error) {
    console.error('html-to-image failed:', error);
    throw new Error('Failed to create image');
  }
}

export function buildTuViImageFilename(name?: string): string {
  const safeName = (name?.trim() || 'la-so')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `tu-vi-${safeName || 'la-so'}.jpg`;
}
