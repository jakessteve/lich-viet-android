/**
 * MoonPhaseSVG — Moon phase visualization for the landing page
 *
 * Renders an SVG moon with phase-dependent illumination.
 */

export default function MoonPhaseSVG({ lunarDay }: { lunarDay: number }) {
  // Approximate moon phase from lunar day (1–30)
  // 1 = new moon, 8 = first quarter, 15 = full, 22 = third quarter, 30 = new
  const phase = lunarDay / 30; // 0–1
  const r = 32;
  const cx = 40;
  const cy = 40;

  // Calculate the illumination curve
  // Shadow mask using two arcs to create the lit/dark boundary
  const illumination = Math.abs(Math.cos(phase * Math.PI * 2));
  const isWaxing = phase < 0.5;
  const isFullish = illumination < 0.1 && phase > 0.3 && phase < 0.7;

  // Control point for the terminator curve
  const terminatorX = cx + (isWaxing ? -1 : 1) * r * (1 - illumination * 2);

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
      {isFullish ? (
        <circle cx={cx} cy={cy} r={r} fill="url(#moonSurface)" />
      ) : (
        <path
          d={`
            M ${cx} ${cy - r}
            A ${r} ${r} 0 0 ${isWaxing ? 1 : 0} ${cx} ${cy + r}
            Q ${terminatorX} ${cy} ${cx} ${cy - r}
          `}
          fill="url(#moonSurface)"
        />
      )}

      {/* Subtle crater marks */}
      <circle cx={cx - 8} cy={cy - 5} r="2.5" fill="rgba(0,0,0,0.06)" />
      <circle cx={cx + 5} cy={cy + 8} r="3" fill="rgba(0,0,0,0.05)" />
      <circle cx={cx - 3} cy={cy + 12} r="1.8" fill="rgba(0,0,0,0.04)" />
    </svg>
  );
}
