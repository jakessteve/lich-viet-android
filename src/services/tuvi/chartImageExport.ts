const MAX_PIXEL_RATIO = 2;
const JPEG_QUALITY = 0.94;
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

type RectLike = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;

function waitForFonts(): Promise<void> {
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

function isVisible(element: Element, style = window.getComputedStyle(element)): boolean {
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
}

function parseCssPixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasPaint(color: string): boolean {
  return Boolean(color && color !== TRANSPARENT && !color.endsWith(', 0)') && color !== 'transparent');
}

function getChartBackground(element: HTMLElement): string {
  const computed = window.getComputedStyle(element);
  return hasPaint(computed.backgroundColor) ? computed.backgroundColor : 'rgb(255, 255, 255)';
}

function fillRoundedRect(context: CanvasRenderingContext2D, rect: RectLike, radius: number): void {
  if (radius <= 0) {
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
    return;
  }

  const safeRadius = Math.min(radius, rect.width / 2, rect.height / 2);
  context.beginPath();
  context.moveTo(rect.left + safeRadius, rect.top);
  context.lineTo(rect.left + rect.width - safeRadius, rect.top);
  context.quadraticCurveTo(rect.left + rect.width, rect.top, rect.left + rect.width, rect.top + safeRadius);
  context.lineTo(rect.left + rect.width, rect.top + rect.height - safeRadius);
  context.quadraticCurveTo(rect.left + rect.width, rect.top + rect.height, rect.left + rect.width - safeRadius, rect.top + rect.height);
  context.lineTo(rect.left + safeRadius, rect.top + rect.height);
  context.quadraticCurveTo(rect.left, rect.top + rect.height, rect.left, rect.top + rect.height - safeRadius);
  context.lineTo(rect.left, rect.top + safeRadius);
  context.quadraticCurveTo(rect.left, rect.top, rect.left + safeRadius, rect.top);
  context.closePath();
  context.fill();
}

function drawElementBox(context: CanvasRenderingContext2D, element: HTMLElement, rootRect: DOMRect): void {
  const style = window.getComputedStyle(element);
  if (!isVisible(element, style)) return;

  const rect = element.getBoundingClientRect();
  const box = {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    width: rect.width,
    height: rect.height,
  };

  if (hasPaint(style.backgroundColor)) {
    context.fillStyle = style.backgroundColor;
    fillRoundedRect(context, box, parseCssPixels(style.borderTopLeftRadius));
  }

  const borderWidth = parseCssPixels(style.borderTopWidth);
  if (borderWidth > 0 && hasPaint(style.borderTopColor)) {
    context.strokeStyle = style.borderTopColor;
    context.lineWidth = borderWidth;
    context.strokeRect(box.left + borderWidth / 2, box.top + borderWidth / 2, box.width - borderWidth, box.height - borderWidth);
  }
}

function fontFromStyle(style: CSSStyleDeclaration): string {
  return [
    style.fontStyle,
    style.fontVariant,
    style.fontWeight,
    style.fontSize,
    style.fontFamily,
  ]
    .filter(Boolean)
    .join(' ');
}

function drawTextNode(context: CanvasRenderingContext2D, node: Text, rootRect: DOMRect): void {
  const text = node.textContent?.replace(/\s+/g, ' ').trim();
  const parent = node.parentElement;
  if (!text || !parent) return;

  const style = window.getComputedStyle(parent);
  if (!isVisible(parent, style) || !hasPaint(style.color)) return;

  const range = document.createRange();
  range.selectNodeContents(node);
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
  range.detach();
  if (rects.length === 0) return;

  context.fillStyle = style.color;
  context.font = fontFromStyle(style);
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';

  const lineHeight = parseCssPixels(style.lineHeight) || parseCssPixels(style.fontSize) * 1.2;
  for (const rect of rects) {
    context.fillText(text, rect.left - rootRect.left, rect.top - rootRect.top + Math.min(rect.height, lineHeight) * 0.82);
  }
}

function drawSvgLines(context: CanvasRenderingContext2D, svg: SVGSVGElement, rootRect: DOMRect): void {
  const svgRect = svg.getBoundingClientRect();
  if (svgRect.width <= 0 || svgRect.height <= 0) return;

  svg.querySelectorAll<SVGLineElement>('line').forEach((line) => {
    const style = window.getComputedStyle(line);
    const x1 = (Number(line.getAttribute('x1')) / 100) * svgRect.width + svgRect.left - rootRect.left;
    const y1 = (Number(line.getAttribute('y1')) / 100) * svgRect.height + svgRect.top - rootRect.top;
    const x2 = (Number(line.getAttribute('x2')) / 100) * svgRect.width + svgRect.left - rootRect.left;
    const y2 = (Number(line.getAttribute('y2')) / 100) * svgRect.height + svgRect.top - rootRect.top;

    context.save();
    context.strokeStyle = hasPaint(style.stroke) ? style.stroke : 'rgba(90, 90, 90, 0.4)';
    context.lineWidth = parseCssPixels(style.strokeWidth) || 1;
    context.setLineDash((style.strokeDasharray || '').split(/[,\s]+/).map(Number).filter(Number.isFinite));
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
  });
}

function drawExportHighlights(context: CanvasRenderingContext2D, root: HTMLElement, rootRect: DOMRect): void {
  root.querySelectorAll<HTMLElement>('.tuvi-palace.menh, .tuvi-palace.than').forEach((palace) => {
    const rect = palace.getBoundingClientRect();
    const isThan = palace.classList.contains('than');
    context.save();
    context.strokeStyle = isThan ? 'rgba(75, 85, 99, 0.9)' : '#b8860b';
    context.lineWidth = 2;
    context.setLineDash(isThan ? [6, 4] : []);
    context.strokeRect(rect.left - rootRect.left + 4, rect.top - rootRect.top + 4, rect.width - 8, rect.height - 8);
    context.restore();
  });
}

function createJpegBlobFromElement(element: HTMLElement, backgroundColor: string): Promise<Blob> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width));
  const height = Math.max(1, Math.ceil(rect.height));
  const scale = Math.max(1, Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const context = canvas.getContext('2d');
  if (!context) {
    return Promise.reject(new Error('Canvas context is unavailable.'));
  }

  context.scale(scale, scale);
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  element.querySelectorAll<HTMLElement>('*').forEach((child) => drawElementBox(context, child, rect));
  element.querySelectorAll<SVGSVGElement>('svg').forEach((svg) => drawSvgLines(context, svg, rect));

  const textWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let current = textWalker.nextNode();
  while (current) {
    drawTextNode(context, current as Text, rect);
    current = textWalker.nextNode();
  }

  drawExportHighlights(context, element, rect);

  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to serialize chart image.'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', JPEG_QUALITY);
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Failed to serialize chart image.'));
    }
  });
}

export async function downloadTuViChartAsImage(selector: string, filename: string): Promise<void> {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error('Không tìm thấy bảng Tử Vi để xuất ảnh.');
  }

  await waitForFonts();
  const blob = await createJpegBlobFromElement(element, getChartBackground(element));
  downloadBlob(blob, filename.replace(/\.(png|svg|webp)$/i, '.jpg'));
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
