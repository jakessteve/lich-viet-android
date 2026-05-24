import { useEffect } from 'react';

/**
 * Custom hook to set the document title for each page.
 * Improves SEO and provides better UX when users have multiple tabs open.
 *
 * @param title - The page-specific title
 * @param suffix - Optional suffix (defaults to "Lịch Việt")
 *
 * @example
 * ```tsx
 * usePageTitle('Tử Vi');
 * // Sets document.title to "Tử Vi — Lịch Việt"
 * ```
 */
export function usePageTitle(title: string, suffix = 'Lịch Việt'): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} — ${suffix}` : suffix;

    return () => {
      document.title = prevTitle;
    };
  }, [title, suffix]);
}
