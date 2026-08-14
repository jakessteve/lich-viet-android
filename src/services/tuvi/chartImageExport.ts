import { toSvg } from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function saveToDocuments(dataUrl: string, filename: string): Promise<void> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);

  await new Promise<void>((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Documents
        });
        window.alert(`Đã lưu ảnh vào thư mục Documents/${filename}`);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
  });
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

  const safeFilename = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '.svg');

  try {
    const dataUrl = await toSvg(element, { backgroundColor: '#ffffff' });
    if (Capacitor.isNativePlatform()) {
      await saveToDocuments(dataUrl, safeFilename);
    } else {
      downloadDataUrl(dataUrl, safeFilename);
    }
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

  return `tu-vi-${safeName || 'la-so'}.svg`;
}
