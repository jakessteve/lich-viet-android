/**
 * MoonPhaseSVG — Moon phase visualization for the landing page
 *
 * Renders an SVG moon with phase-dependent illumination.
 */

export default function MoonPhaseSVG({ lunarDay }: { lunarDay: number }) {
  // Normalize lunar day (1–30)
  const day = Math.min(30, Math.max(1, Math.round(lunarDay)));
  const r = 32;
  const cx = 40;
  const cy = 40;

  // Exact moon phase geometry
  const isFull = day === 15 || day === 16;
  const isNew = day === 1 || day === 30;
  const isWaxing = day < 15;

  // Normalized phase: 0 (new) to 0.5 (full) to 1 (new)
  const rx = Math.max(0.1, Math.abs(r * Math.cos((day / 30) * 2 * Math.PI)));

  // SVG Path for illuminated portion
  let pathD = '';
  if (isWaxing) {
    // Semicircle on right, terminator returning on left/right depending on crescent/gibbous
    const sweepFlag = day < 7.5 ? 0 : 1;
    pathD = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweepFlag} ${cx} ${cy - r}`;
  } else {
    // Semicircle on left, terminator returning on right/left depending on gibbous/crescent
    const sweepFlag = day < 22.5 ? 0 : 1;
    pathD = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweepFlag} ${cx} ${cy - r}`;
  }

  return (
    <svg
      viewBox="0 0 80 80"
      className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg"
      aria-label={`Pha trăng ngày ${lunarDay}`}
    >
      <defs>
        {/* Ambient glow */}
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,168,67,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Moon surface gradient */}
        <radialGradient id="moonSurface" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="50%" stopColor="#F5E6B8" />
          <stop offset="100%" stopColor="#D4A843" />
        </radialGradient>
      </defs>

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={r + 8} fill="url(#moonGlow)" className="animate-glow-pulse" />

      {/* Moon base (dark side) */}
      <circle cx={cx} cy={cy} r={r} fill="#2a2a3e" />

      {/* Illuminated portion */}
      {isFull ? (
        <circle cx={cx} cy={cy} r={r} fill="url(#moonSurface)" />
      ) : isNew ? null : (
        <path d={pathD} fill="url(#moonSurface)" />
      )}

      {/* Subtle crater marks */}
      <circle cx={cx - 8} cy={cy - 5} r="2.5" fill="rgba(0,0,0,0.06)" />
      <circle cx={cx + 5} cy={cy + 8} r="3" fill="rgba(0,0,0,0.05)" />
      <circle cx={cx - 3} cy={cy + 12} r="1.8" fill="rgba(0,0,0,0.04)" />
    </svg>
  );
}
