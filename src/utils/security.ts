/**
 * Security & Sanitization Utilities — Lịch Việt v3
 *
 * Provides zero-trust string sanitization, XSS escaping for SVG text nodes,
 * HTML exports, and Markdown generation.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS.
 */
export function escapeHtml(str: unknown): string {
  if (typeof str !== 'string' || !str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes strings specifically for SVG text elements and XML attributes.
 */
export function escapeSvgText(str: unknown): string {
  if (typeof str !== 'string' || !str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Deep sanitization for plain text: recursively strips tags, removes script schemes,
 * controls character length, and prevents protocol-injection attacks.
 */
export function sanitizePlainText(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string' || !input) return '';

  let sanitized = input;

  // Multi-pass recursive sanitization to defeat nested bypasses
  let prev = '';
  let iterations = 0;
  while (sanitized !== prev && iterations < 5) {
    prev = sanitized;
    sanitized = sanitized
      .replace(/<[^>]*>?/g, '')
      .replace(/(?:java|vb)script\s*:/gi, '')
      .replace(/data\s*:[^\s]*/gi, '')
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    iterations++;
  }

  return sanitized.trim().slice(0, Math.max(0, maxLength));
}

/**
 * Validates and normalizes latitude (-90 to 90) and longitude (-180 to 180).
 */
export function sanitizeCoordinates(lat: unknown, lng: unknown): { lat: number; lng: number } {
  const numLat = typeof lat === 'number' && Number.isFinite(lat) ? lat : 0;
  const numLng = typeof lng === 'number' && Number.isFinite(lng) ? lng : 0;

  const safeLat = Math.max(-90, Math.min(90, numLat));
  const safeLng = Math.max(-180, Math.min(180, numLng));
  return { lat: safeLat, lng: safeLng };
}
