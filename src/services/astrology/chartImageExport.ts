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

export async function downloadChartAsImage(
  selector: string,
  filename: string,
): Promise<void> {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) {
    throw new Error('Không tìm thấy biểu đồ để xuất ảnh.');
  }

  // Ensure fonts are loaded before capturing
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  try {
    // We capture the whole container which includes the background and paddings.
    // We don't force a white background so that dark theme backgrounds are preserved.
    const dataUrl = await toJpeg(container, { quality: 0.94, pixelRatio: 2 });
    downloadDataUrl(dataUrl, filename);
  } catch (error) {
    console.error('html-to-image failed:', error);
    throw new Error('Failed to create image');
  }
}

export function buildChartImageFilename(prefix: string, name?: string): string {
  const safeName = (name?.trim() || 'chart')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${prefix}-${safeName || 'chart'}.jpg`;
}
