const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const MAX_PIXEL_RATIO = 2;

function copyComputedStyles(source: Element, target: HTMLElement | SVGElement): void {
  const computed = window.getComputedStyle(source);
  const targetStyle = target.style;
  for (const property of Array.from(computed)) {
    targetStyle.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
  }

  if (source instanceof HTMLElement && target instanceof HTMLElement) {
    targetStyle.width = computed.width;
    targetStyle.height = computed.height;
    targetStyle.boxSizing = computed.boxSizing;
  }
}

function cloneNodeWithStyles(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const sourceElements = [source, ...Array.from(source.querySelectorAll('*'))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll('*'))];

  sourceElements.forEach((sourceEl, index) => {
    const cloneEl = cloneElements[index];
    if (!cloneEl) return;
    if (cloneEl instanceof HTMLElement || cloneEl instanceof SVGElement) {
      copyComputedStyles(sourceEl, cloneEl);
    }
    if (cloneEl instanceof HTMLElement) {
      cloneEl.setAttribute('xmlns', XHTML_NS);
    }
  });

  return clone;
}

function injectExportOnlyHighlights(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.tuvi-palace.menh').forEach((palace) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.position = 'absolute';
    overlay.style.inset = '4px';
    overlay.style.border = '2px solid #b8860b';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';
    palace.appendChild(overlay);
  });

  root.querySelectorAll<HTMLElement>('.tuvi-palace.than').forEach((palace) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.position = 'absolute';
    overlay.style.inset = '4px';
    overlay.style.border = '2px dashed rgba(75, 85, 99, 0.9)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';
    palace.appendChild(overlay);
  });
}

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

function createPngBlobFromElement(element: HTMLElement, backgroundColor: string): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const rect = element.getBoundingClientRect();
    const width = Math.max(1, Math.ceil(rect.width));
    const height = Math.max(1, Math.ceil(rect.height));
    const scale = Math.max(1, Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1));

    const clone = cloneNodeWithStyles(element);
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.position = 'relative';
    clone.style.overflow = 'hidden';
    injectExportOnlyHighlights(clone);

    const foreignObject = document.createElementNS(SVG_NS, 'foreignObject');
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('width', String(width));
    foreignObject.setAttribute('height', String(height));
    foreignObject.appendChild(clone);

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.appendChild(foreignObject);

    const serialized = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Canvas context is unavailable.'));
        return;
      }

      context.scale(scale, scale);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to serialize chart image.'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load the chart image for export.'));
    };
    image.src = svgUrl;
  });
}

export async function downloadTuViChartAsImage(selector: string, filename: string): Promise<void> {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error('Không tìm thấy bảng Tử Vi để xuất ảnh.');
  }

  await waitForFonts();

  const backgroundColor = window.getComputedStyle(element).backgroundColor || 'rgb(255, 255, 255)';
  const blob = await createPngBlobFromElement(element, backgroundColor);
  downloadBlob(blob, filename);
}

export function buildTuViImageFilename(name?: string): string {
  const safeName = (name?.trim() || 'la-so')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `tu-vi-${safeName || 'la-so'}.png`;
}
