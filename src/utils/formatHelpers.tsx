import React from 'react';

/**
 * Text formatting helpers for Vietnamese lunar calendar display.
 * Extracted from DetailedDayView for reuse and testability.
 */

/**
 * Renders text with parenthesized portions in italics.
 * Example: "Canh không gieo cấy (mùa vụ sẽ thất bát)" →
 *   "Canh không gieo cấy " + <em>"(mùa vụ sẽ thất bát)"</em>
 */
export function renderWithItalics(text: string): React.ReactElement | null {
  if (!text) return null;
  const parts = text.split(/(\([^)]+\))/g);
  return (
    <p>
      {parts.map((part, i) =>
        part.startsWith('(') && part.endsWith(')') ? (
          <span key={i} className="italic">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

/**
 * Formats Nạp Âm text by extracting "Đặc biệt" items into a bulleted list.
 */
export function formatNapAm(text: string): React.ReactElement | string {
  if (!text) return text;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
        const parts = line.split(/[,;]?\s*(?=[Đđ]ặc biệt)/);

        if (parts.length === 1) {
          return <p key={lineIdx}>{parts[0].trim()}</p>;
        }

        const normalText = parts[0].trim();
        const dacBietItems = parts
          .slice(1)
          .map((p) => {
            let s = p.trim();
            const lowerRegexTuoi = /^[Đđ]ặc biệt tuổi:\s*/;
            const lowerRegex = /^[Đđ]ặc biệt:\s*/;

            if (lowerRegexTuoi.test(s)) {
              s = s.replace(lowerRegexTuoi, 'Tuổi ');
            } else if (lowerRegex.test(s)) {
              s = s.replace(lowerRegex, '');
              if (s.length > 0) {
                s = s.charAt(0).toUpperCase() + s.slice(1);
              }
            } else {
              // Keep it as is if it just says 'Đặc biệt' without a colon, capitalizing it.
              s = s.charAt(0).toUpperCase() + s.slice(1);
            }

            // Remove trailing semicolons or periods if they exist, for cleaner list
            s = s.replace(/[;.]+$/, '');

            return s;
          })
          .filter(Boolean);

        return (
          <div key={lineIdx}>
            {normalText && <p>{normalText}</p>}
            {dacBietItems.length > 0 && (
              <div className={normalText ? 'mt-1.5' : ''}>
                <p className="font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Đặc biệt:</p>
                <ul className="list-none pl-4 space-y-1">
                  {dacBietItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="relative before:content-['-'] before:absolute before:-left-4 text-text-secondary-light dark:text-text-secondary-dark leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Formats Xung/Hợp text by splitting on semicolons and labeling
 * the first segment as "Hợp" (green) and the second as "Xung" (red).
 */
export function formatXungHop(text: string): React.ReactElement | string {
  if (!text) return text;
  const parts = text.split(';');
  return (
    <div className="space-y-1.5">
      {parts[0] && (
        <p>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1">Hợp:</span>
          <span>{parts[0].trim()}</span>
        </p>
      )}
      {parts[1] && (
        <p>
          <span className="font-bold text-crimson-600 dark:text-crimson-400 mr-1">Xung:</span>
          <span>{parts[1].trim()}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Extracts the final label from a status string like "Tý → HOÀNG ĐẠO".
 * Returns the last segment after "-->".
 */
export function getStatusLabel(statusStr: string): string {
  if (!statusStr) return '';
  const parts = statusStr.split('-->').map((p) => p.trim());
  return parts[parts.length - 1];
}

/**
 * Renders a status string with arrow separators and color-coded labels.
 * "HOÀNG ĐẠO" segments render in emerald green; others in default text color.
 */
export function renderStatusParts(statusStr: string): React.ReactElement[] | null {
  if (!statusStr) return null;
  return statusStr.split('-->').map((part, i, arr) => {
    const p = part.trim();
    const colorClass =
      p === 'HOÀNG ĐẠO'
        ? 'text-emerald-600 dark:text-emerald-500'
        : 'text-text-primary-light dark:text-text-primary-dark';
    return (
      <span key={i}>
        <span className={colorClass}>{p}</span>
        {i < arr.length - 1 && <span className="text-text-secondary-light mx-0.5">➜</span>}
      </span>
    );
  });
}
