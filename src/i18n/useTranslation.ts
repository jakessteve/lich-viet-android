/**
 * @module useTranslation
 * @description React hook for accessing the i18n translation system.
 *
 * Provides a `t()` function for translating keys, a `tArray()` function
 * for array values, and the current locale with a setter.
 *
 * @example
 * ```tsx
 * import { useTranslation } from '@/i18n/useTranslation';
 *
 * function Header() {
 *   const { t, locale, setLocale } = useTranslation();
 *   return (
 *     <div>
 *       <h1>{t('app.title')}</h1>
 *       <p>{t('app.copyright', { year: 2026 })}</p>
 *       <button onClick={() => setLocale('en')}>English</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo, useState } from 'react';
import { translate, translateArray, detectLocale, setLocalePreference, type LocaleCode } from './index';

interface UseTranslationReturn {
  /** Translate a dot-notation key with optional template variables */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Get an array translation (e.g., weekday names) */
  tArray: (key: string) => string[];
  /** Current active locale code */
  locale: LocaleCode;
  /** Change the active locale (persists to localStorage) */
  setLocale: (locale: LocaleCode) => void;
}

/**
 * React hook for i18n translations.
 *
 * Uses `useState` for locale so that changing locale triggers a re-render
 * of all components using this hook.
 */
export function useTranslation(): UseTranslationReturn {
  const [locale, setLocaleState] = useState<LocaleCode>(detectLocale);

  const setLocale = useCallback((newLocale: LocaleCode) => {
    setLocalePreference(newLocale);
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(key, locale, vars),
    [locale],
  );

  const tArray = useCallback((key: string) => translateArray(key, locale), [locale]);

  return useMemo(() => ({ t, tArray, locale, setLocale }), [t, tArray, locale, setLocale]);
}
