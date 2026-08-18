import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SwissNatalChartResult } from '@/services/astrology/swissNatalChart';

const ASPECT_PREVIEW_LIMIT = 12;
const n = (value: number | null, digits = 6) => (value === null ? '—' : value.toFixed(digits));

const Value: React.FC<{ label: string; children: React.ReactNode; wide?: boolean }> = ({ label, children, wide }) => (
  <div className={wide ? 'col-span-2 sm:col-span-4' : ''}>
    <dt className="text-micro font-medium uppercase tracking-wide text-text-secondary-light/75 dark:text-text-secondary-dark/75">
      {label}
    </dt>
    <dd className="mt-0.5 break-words font-medium text-text-primary-light dark:text-text-primary-dark">{children}</dd>
  </div>
);

const Section: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <details className="group border-t border-border-light/50 first:border-t-0 dark:border-border-dark/50">
    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-text-primary-light marker:hidden dark:text-text-primary-dark [&::-webkit-details-marker]:hidden">
      <span>{title}</span>
      <span className="flex items-center gap-2">
        {count !== undefined && <span className="badge-astral">{count}</span>}
        <ChevronDown
          className="h-4 w-4 text-text-secondary-light transition-transform group-open:rotate-180 dark:text-text-secondary-dark"
          aria-hidden="true"
        />
      </span>
    </summary>
    <div className="border-t border-border-light/40 bg-surface-container-lowest/40 dark:border-border-dark/40">
      {children}
    </div>
  </details>
);

export const WesternNatalTechnicalDisplay: React.FC<{ result: SwissNatalChartResult }> = ({ result }) => {
  const [open, setOpen] = useState(false);
  const [showAllAspects, setShowAllAspects] = useState(false);
  const visibleAspects = useMemo(() => {
    if (showAllAspects) return result.aspects;
    return [...result.aspects]
      .sort((first, second) => second.strength - first.strength || first.orbDifference - second.orbDifference)
      .slice(0, ASPECT_PREVIEW_LIMIT);
  }, [result.aspects, showAllAspects]);

  return (
    <section
      className="surface-card overflow-hidden rounded-2xl border border-border-light/60 text-xs dark:border-border-dark/60"
      data-western-natal-technical
    >
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-astral-surface-light/40 dark:hover:bg-astral-surface-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-astral-primary"
        aria-expanded={open}
        aria-controls="western-natal-technical-content"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            Dữ liệu kỹ thuật
          </span>
          <span className="mt-0.5 block truncate text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Đối tượng, nhà, góc chiếu và thông số máy tính
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-surface-container px-2 py-1 text-micro text-text-secondary-light dark:text-text-secondary-dark sm:inline">
            20 · 12 · 4 · {result.aspects.length}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-text-secondary-light transition-transform dark:text-text-secondary-dark ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div
          id="western-natal-technical-content"
          className="border-t border-border-light/50 dark:border-border-dark/50"
        >
          <div className="grid grid-cols-4 gap-2 p-3 sm:hidden" aria-label="Tóm tắt dữ liệu kỹ thuật">
            {[
              ['Đối tượng', 20],
              ['Nhà', 12],
              ['Góc', 4],
              ['Góc chiếu', result.aspects.length],
            ].map(([label, count]) => (
              <div
                key={String(label)}
                className="rounded-xl bg-surface-container-low px-1.5 py-2 text-center border border-border-light/30 dark:border-border-dark/30"
              >
                <strong className="block text-sm text-text-primary-light dark:text-text-primary-dark">{count}</strong>
                <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">{label}</span>
              </div>
            ))}
          </div>

          <Section title="20 đối tượng" count={result.objects.length}>
            <ul className="divide-y divide-border-light/40 dark:divide-border-dark/40">
              {result.objects.map((object) => (
                <li key={object.id} data-technical-object={object.id} className="p-3 sm:p-4">
                  <div className="mb-2 flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                        <span>{object.symbol}</span>
                        <span>{object.nameVi}</span>
                        {object.dignity && object.dignity.type !== 'peregrine' && (
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-micro font-medium ${object.dignity.badgeClass}`}
                          >
                            {object.dignity.symbol} {object.dignity.labelVi}
                          </span>
                        )}
                      </p>
                      <code className="block truncate text-micro text-text-secondary-light dark:text-text-secondary-dark">
                        {object.id}
                      </code>
                    </div>
                    <span className="badge-astral shrink-0">
                      {object.signVi} {object.degree}°{object.minute.toString().padStart(2, '0')}′
                      {object.retrograde ? ' · Rx' : ''}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
                    <Value label="Kinh độ">{object.longitude.toFixed(6)}°</Value>
                    <Value label="Nhà">{object.house}</Value>
                    <Value label="Speed">
                      {n(object.speed)}
                      {object.retrograde ? ' Rx' : object.retrograde === null ? ' · unknown' : ''}
                    </Value>
                    <Value label="Latitude">{object.latitude.toFixed(6)}°</Value>
                    <Value label="Distance">{n(object.distance)} AU</Value>
                    <Value label="Lat / dist speed">
                      {n(object.latitudeSpeed)} / {n(object.distanceSpeed)}
                    </Value>
                    <Value label="RA / Dec">
                      {n(object.rightAscension)}° / {n(object.declination)}°
                    </Value>
                    <Value label="Flags ecl / eq">
                      {result.metadata.returnedFlags[object.id] ?? '—'} /{' '}
                      {result.metadata.returnedEquatorialFlags[object.id] ?? '—'}
                    </Value>
                  </dl>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="12 đỉnh nhà & Chủ quản (House Rulers)" count={result.houses.length}>
            <div className="grid gap-px bg-border-light/40 sm:grid-cols-2 lg:grid-cols-3 dark:bg-border-dark/40">
              {result.houses.map((house) => {
                const ruler = result.houseRulers?.find((r) => r.houseNumber === house.number);
                return (
                  <div
                    key={house.number}
                    data-technical-house={house.number}
                    className="flex flex-col justify-between gap-2 bg-surface-container-lowest px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm">Nhà {house.number}</strong>
                      <span className="text-right font-medium text-text-primary-light dark:text-text-primary-dark">
                        {house.signVi} {house.degree}°{house.minute.toString().padStart(2, '0')}′
                      </span>
                    </div>
                    {ruler && (
                      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark border-t border-border-light/30 pt-1.5 dark:border-border-dark/30 flex items-center justify-between">
                        <span>
                          Chủ tinh:{' '}
                          <strong className="text-text-primary-light dark:text-text-primary-dark">
                            {ruler.traditionalRulerVi} {ruler.traditionalRulerSymbol}
                          </strong>
                        </span>
                        {ruler.rulerHouse && <span>(tại Nhà {ruler.rulerHouse})</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Bốn góc chính" count={4}>
            <div className="grid gap-px bg-border-light/40 sm:grid-cols-2 dark:bg-border-dark/40">
              {Object.values(result.angles).map((angle) => (
                <div
                  key={angle.id}
                  data-technical-angle={angle.id}
                  className="flex items-center justify-between gap-3 bg-surface-container-lowest px-4 py-3"
                >
                  <span>
                    <strong>{angle.symbol}</strong> {angle.nameVi}
                    <code className="block text-micro text-text-secondary-light dark:text-text-secondary-dark">
                      {angle.id}
                    </code>
                  </span>
                  <span className="text-right font-medium">
                    {angle.signVi} {angle.degree}°{angle.minute.toString().padStart(2, '0')}′<br />
                    <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                      {angle.longitude.toFixed(6)}°
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Góc chiếu" count={result.aspects.length}>
            <ul className="divide-y divide-border-light/40 dark:divide-border-dark/40">
              {visibleAspects.map((aspect, index) => (
                <li
                  key={`${aspect.objectAId}-${aspect.objectBId}-${aspect.id}-${index}`}
                  data-technical-aspect={aspect.id}
                  className="p-3 sm:px-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {aspect.objectAName}{' '}
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">↔</span>{' '}
                        {aspect.objectBName}
                      </p>
                      <p className="truncate text-micro text-text-secondary-light dark:text-text-secondary-dark">
                        {aspect.objectAId} · {aspect.objectBId}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-lg px-2 py-1 font-semibold"
                      style={{ color: aspect.color, backgroundColor: `${aspect.color}16` }}
                    >
                      {aspect.name}
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
                    <Value label="Separation / exact">
                      {aspect.separation.toFixed(6)}° / {aspect.exactAngle}°
                    </Value>
                    <Value label="Orb / allowed">
                      {aspect.orbDifference.toFixed(6)}° / {aspect.allowedOrb}°
                    </Value>
                    <Value label="State / strength">
                      {aspect.state} / {aspect.strength.toFixed(6)}
                    </Value>
                    <Value label="Style / layer">
                      {aspect.color} · {aspect.opacity} · {aspect.width} · {aspect.dashPattern} · L{aspect.layer}
                    </Value>
                  </dl>
                </li>
              ))}
            </ul>
            {result.aspects.length > ASPECT_PREVIEW_LIMIT && (
              <div className="border-t border-border-light/40 p-3 text-center dark:border-border-dark/40">
                <button
                  type="button"
                  onClick={() => setShowAllAspects((current) => !current)}
                  className="min-h-11 rounded-xl px-4 font-semibold text-astral-primary transition-colors hover:bg-astral-surface-light dark:hover:bg-astral-surface-dark dark:text-astral-primary-dark"
                >
                  {showAllAspects ? 'Thu gọn góc chiếu' : `Xem tất cả ${result.aspects.length} góc chiếu`}
                </button>
              </div>
            )}
          </Section>

          <Section title="Metadata kỹ thuật">
            <dl className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4" data-technical-metadata>
              <Value label="Julian Day">{result.birth.julianDayUt}</Value>
              <Value label="UTC">{result.birth.utc}</Value>
              <Value label="UTC offset">{result.birth.fixedUtcOffsetHours}</Value>
              <Value label="Houses">{result.birth.houseSystem}</Value>
              <Value label="Engine">
                {result.metadata.engine} {result.metadata.version}
              </Value>
              <Value label="Ephemeris">{result.metadata.ephemeris}</Value>
              <Value label="Requested flags">
                {result.metadata.requestedFlags} / eq {result.metadata.requestedEquatorialFlags}
              </Value>
              <Value label="Policy">
                {result.metadata.objectPolicyVersion} · {result.metadata.aspectPolicyVersion}
              </Value>
              <Value label="Time policy">{result.metadata.timePolicy}</Value>
              <Value label="Part of Fortune" wide>
                {result.metadata.partOfFortuneAltitudePolicy} · solar altitude{' '}
                {result.metadata.partOfFortuneSolarAltitudeDeg.toFixed(6)}°
              </Value>
            </dl>
          </Section>
        </div>
      )}
    </section>
  );
};

export default WesternNatalTechnicalDisplay;
