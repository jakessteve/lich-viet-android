async function waitForFonts(): Promise<void> {
  if (document.fonts?.ready) {
    return document.fonts.ready.then(() => undefined);
  }
  return Promise.resolve();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function svgToCanvas(svgElement: SVGSVGElement): Promise<HTMLCanvasElement> {
  const rect = svgElement.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width));
  const height = Math.max(1, Math.ceil(rect.height));
  const scale = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context unavailable');

  context.scale(scale, scale);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      context.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG to canvas'));
    };
    img.src = url;
  });
}

export async function downloadChartAsImage(
  selector: string,
  filename: string,
): Promise<void> {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) {
    throw new Error('Không tìm thấy biểu đồ để xuất ảnh.');
  }

  const svg = container.querySelector('svg');
  if (!svg) {
    throw new Error('Không tìm thấy biểu đồ SVG.');
  }

  await waitForFonts();
  const canvas = await svgToCanvas(svg);

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) { reject(new Error('toBlob failed')); return; }
        resolve(b);
      }, 'image/jpeg', 0.94);
    });
    downloadBlob(blob, filename);
  } catch {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    downloadDataUrl(dataUrl, filename);
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
