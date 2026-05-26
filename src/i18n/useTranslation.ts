/**
 * @module useTranslation
 * @description React hook for accessing the Vietnamese translation system.
 *
 * Provides a `t()` function for translating keys and a `tArray()` function
 * for array values. The UI is Vietnamese-only, so there is no locale switch
 * exposed here.
 *
 * @example
 * ```tsx
 * import { useTranslation } from '@/i18n/useTranslation';
 *
 * function Header() {
 *   const { t } = useTranslation();
 *   return (
 *     <div>
 *       <h1>{t('app.title')}</h1>
 *       <p>{t('app.copyright', { year: 2026 })}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { translate, translateArray } from './index';

interface UseTranslationReturn {
  /** Translate a dot-notation key with optional template variables */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Get an array translation (e.g., weekday names) */
  tArray: (key: string) => string[];
}

/**
 * React hook for i18n translations.
 *
 * This hook is intentionally fixed to Vietnamese-only output.
 */
export function useTranslation(): UseTranslationReturn {
  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(key, 'vi', vars), []);

  const tArray = useCallback((key: string) => translateArray(key, 'vi'), []);

  return useMemo(() => ({ t, tArray }), [t, tArray]);
}
