/**
 * Security & Sanitization Utilities — Lịch Việt v3
 *
 * Provides zero-trust string sanitization, XSS escaping for SVG text nodes,
 * HTML exports, and Markdown generation.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
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
export function escapeSvgText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Strips script tags, javascript: URIs, and dangerous attributes.
 */
export function sanitizePlainText(str: string, maxLength = 100): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // strip HTML tags
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes latitude (-90 to 90) and longitude (-180 to 180).
 */
export function sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const safeLat = isNaN(lat) ? 0 : Math.max(-90, Math.min(90, lat));
  const safeLng = isNaN(lng) ? 0 : Math.max(-180, Math.min(180, lng));
  return { lat: safeLat, lng: safeLng };
}
