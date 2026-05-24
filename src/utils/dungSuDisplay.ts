/**
 * Dụng Sự display helpers.
 *
 * These helpers normalize raw "Nghi/Kỵ" item strings for presentation.
 * Some items carry an embedded percentage, e.g. "Cúng lễ (72%)".
 * We treat the embedded percentage as the decisive cue for whether the
 * item belongs in the Nghi or Kỵ bucket when rendering summaries.
 */

export interface DungSuDisplayBuckets {
  nghi: string[];
  ky: string[];
}

interface ParsedDungSuItem {
  label: string;
  percent: number | null;
}

interface LabeledDungSuItem extends ParsedDungSuItem {
  source: 'nghi' | 'ky';
  order: number;
}

const PERCENT_THRESHOLD = 50;

function expandDungSuItem(item: string): string[] {
  const trimmed = item.trim();
  const percentMatches = trimmed.match(/\(\d{1,3}%\)/g);

  // Hour-engine entries are often bundled as:
  // "A (72%), B (64%), C (18%)"
  // We only split those bundles when there are multiple percentage markers,
  // so regular labels that contain commas stay intact.
  if (!percentMatches || percentMatches.length <= 1) {
    return [trimmed];
  }

  return trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseDungSuItem(item: string): ParsedDungSuItem {
  const trimmed = item.trim();
  const match = trimmed.match(/^(.*?)(?:\s*\((\d{1,3})%\))?$/);
  if (!match) {
    return { label: trimmed, percent: null };
  }

  const label = match[1].trim();
  const percent = match[2] ? Number(match[2]) : null;

  return {
    label,
    percent: Number.isFinite(percent) ? percent : null,
  };
}

function formatDungSuItem(item: ParsedDungSuItem): string {
  return item.percent === null ? item.label : `${item.label} (${item.percent}%)`;
}

function normalizeBucket(items: string[], source: 'nghi' | 'ky', offset: number): LabeledDungSuItem[] {
  const expanded = items.flatMap(expandDungSuItem);
  return expanded.map((item, index) => ({
    ...parseDungSuItem(item),
    source,
    order: offset + index,
  }));
}

/**
 * Normalizes raw Dụng Sự item lists for display.
 *
 * Rules:
 * - If an item has a percentage, >= 50 belongs in `nghi`, < 50 belongs in `ky`.
 * - If an item appears in both buckets, the higher percentage wins.
 * - If an item has no percentage, it stays in its original bucket.
 */
export function normalizeDungSuBuckets(suitable: string[], unsuitable: string[]): DungSuDisplayBuckets {
  const merged = new Map<string, LabeledDungSuItem>();
  const items = [...normalizeBucket(suitable, 'nghi', 0), ...normalizeBucket(unsuitable, 'ky', suitable.length)];

  for (const item of items) {
    const key = item.label.toLowerCase();
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, item);
      continue;
    }

    const currentPercent = item.percent ?? -1;
    const existingPercent = existing.percent ?? -1;

    if (currentPercent > existingPercent) {
      merged.set(key, item);
      continue;
    }

    if (currentPercent === existingPercent && existing.source === 'ky' && item.source === 'nghi') {
      merged.set(key, item);
    }
  }

  const nghi: string[] = [];
  const ky: string[] = [];

  Array.from(merged.values())
    .sort((a, b) => a.order - b.order)
    .forEach((item) => {
      if (item.percent === null) {
        (item.source === 'nghi' ? nghi : ky).push(formatDungSuItem(item));
        return;
      }

      const formatted = formatDungSuItem(item);
      if (item.percent >= PERCENT_THRESHOLD) {
        nghi.push(formatted);
      } else {
        ky.push(formatted);
      }
    });

  return { nghi, ky };
}
