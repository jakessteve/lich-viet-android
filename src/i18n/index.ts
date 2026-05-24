/**
 * @module i18n
 * @description Lightweight i18n (internationalization) system for the Lunar Calendar app.
 *
 * Provides a simple key-based translation lookup with template variable support.
 * Designed to be framework-agnostic in the core utility, with a React hook wrapper.
 *
 * ## Usage
 *
 * ```tsx
 * import { useTranslation } from '@/i18n';
 *
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <h1>{t('app.title')}</h1>;
 * }
 * ```
 *
 * ## Adding a new locale
 * 1. Create a new JSON file in `src/i18n/locales/` (e.g., `zh.json`)
 * 2. Add the locale to the `SUPPORTED_LOCALES` array below
 * 3. Import and register it in the `localeModules` map
 */

import viLocale from './locales/vi.json';
import enLocale from './locales/en.json';

// ── Types ──────────────────────────────────────────────────────────

/** Supported locale codes */
export type LocaleCode = 'vi' | 'en';

/** Flat key-value map of translations */
type TranslationMap = Record<string, string | string[]>;

/** Template variable replacements */
type TemplateVars = Record<string, string | number>;

// ── Constants ──────────────────────────────────────────────────────

/** List of supported locale codes */
export const SUPPORTED_LOCALES: readonly LocaleCode[] = ['vi', 'en'] as const;

/** Default locale — Vietnamese since this is a Vietnamese cultural app */
export const DEFAULT_LOCALE: LocaleCode = 'vi';

/** Human-readable locale names for UI display */
export const LOCALE_NAMES: Record<LocaleCode, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

// ── Locale Registry ────────────────────────────────────────────────

/**
 * Pre-loaded locale modules.
 * For a larger app, these could be lazy-loaded with dynamic imports.
 */
const localeModules: Record<LocaleCode, Record<string, unknown>> = {
  vi: viLocale,
  en: enLocale,
};

// ── Core Translation Engine ────────────────────────────────────────

/**
 * Flattens a nested locale JSON object into dot-notation keys.
 *
 * @example
 * flattenLocale({ app: { title: "Hello" } })
 * // => { "app.title": "Hello" }
 */
function flattenLocale(obj: Record<string, unknown>, prefix: string = ''): TranslationMap {
  const result: TranslationMap = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      result[fullKey] = value as string[];
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenLocale(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

/** Cache of flattened locale maps to avoid recomputation */
const flatCache = new Map<LocaleCode, TranslationMap>();

/**
 * Gets or builds the flattened translation map for a locale.
 */
function getFlatLocale(locale: LocaleCode): TranslationMap {
  const cached = flatCache.get(locale);
  if (cached) return cached;

  const flat = flattenLocale(localeModules[locale]);
  flatCache.set(locale, flat);
  return flat;
}

/**
 * Replaces `{{variable}}` placeholders in a translation string.
 *
 * @example
 * interpolate("© {{year}} App", { year: 2026 })
 * // => "© 2026 App"
 */
function interpolate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? `{{${key}}}`));
}

/**
 * Translates a dot-notation key to the corresponding string in the given locale.
 *
 * Falls back to the default locale (Vietnamese) if the key is missing,
 * then to the raw key itself if still not found.
 *
 * @param key   - Dot-notation translation key (e.g., "nav.amLich")
 * @param locale - Target locale code
 * @param vars  - Optional template variables for interpolation
 * @returns Translated string, or the raw key if not found
 */
export function translate(key: string, locale: LocaleCode = DEFAULT_LOCALE, vars?: TemplateVars): string {
  const map = getFlatLocale(locale);
  let value = map[key];

  // Fallback chain: requested locale → default locale → raw key
  if (value === undefined && locale !== DEFAULT_LOCALE) {
    const fallback = getFlatLocale(DEFAULT_LOCALE);
    value = fallback[key];
  }

  if (value === undefined) {
    return key; // Return raw key as last resort
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return vars ? interpolate(value, vars) : value;
}

/**
 * Gets an array value from translations (e.g., weekday names).
 *
 * @param key   - Dot-notation translation key
 * @param locale - Target locale code
 * @returns Array of strings, or empty array if not found
 */
export function translateArray(key: string, locale: LocaleCode = DEFAULT_LOCALE): string[] {
  const map = getFlatLocale(locale);
  const value = map[key];

  if (Array.isArray(value)) return value;

  // Fallback
  if (locale !== DEFAULT_LOCALE) {
    const fallback = getFlatLocale(DEFAULT_LOCALE);
    const fallbackValue = fallback[key];
    if (Array.isArray(fallbackValue)) return fallbackValue;
  }

  return [];
}

/**
 * Detects the user's preferred locale from browser settings.
 * Returns a supported locale code, falling back to DEFAULT_LOCALE.
 */
export function detectLocale(): LocaleCode {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // Check localStorage first (user preference)
  const saved = localStorage.getItem('locale');
  if (saved && SUPPORTED_LOCALES.includes(saved as LocaleCode)) {
    return saved as LocaleCode;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.includes(browserLang as LocaleCode)) {
    return browserLang as LocaleCode;
  }

  return DEFAULT_LOCALE;
}

/**
 * Persists the user's locale preference.
 */
export function setLocalePreference(locale: LocaleCode): void {
  localStorage.setItem('locale', locale);
}
