import React, { useId } from 'react';

/**
 * Bold Bát Quái & Âm Dương Art
 * A massive, authoritative geometric background element emphasizing the 8 Trigrams
 * and deep space constellations, replacing the previous delicate astrolabe.
 */
export default function HeroAuspiciousArt() {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const goldGradId = `heroGoldGrad-${uid}`;
  const softGoldId = `heroSoftGold-${uid}`;
  const solidYaoId = `solidYao-${uid}`;
  const brokenYaoId = `brokenYao-${uid}`;
  const constGroup1Id = `constellationGroup1-${uid}`;
  const constGroup2Id = `constellationGroup2-${uid}`;

  // Tiên Thiên Bát Quái (Earlier Heaven Bagua sequence)
  // Maps to binaries representing the solid/broken lines
  // 1 = solid (dương), 0 = broken (âm)
  // Sequence: Càn (Qian), Tốn (Xun), Khảm (Kan), Cấn (Gen), Khôn (Kun), Chấn (Zhen), Ly (Li), Đoài (Dui)
  const trigrams = [
    0b111, // 7: Càn (South)
    0b011, // 3: Tốn (SouthWest)
    0b010, // 2: Khảm (West)
    0b001, // 1: Cấn (NorthWest)
    0b000, // 0: Khôn (North)
    0b100, // 4: Chấn (NorthEast)
    0b101, // 5: Ly (East)
    0b110, // 6: Đoài (SouthEast)
  ];

  return (
    <div
      className="w-full h-full relative flex items-center justify-center pointer-events-none select-none overflow-visible"
      style={{
        maskImage: 'radial-gradient(circle at 50% 50%, black 88%, rgba(0,0,0,0.6) 96%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 88%, rgba(0,0,0,0.6) 96%, transparent 100%)',
      }}
    >
      {/* Main Celestial Board with native GPU-accelerated SVG */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="-120 -120 1040 1040"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
      >
        <defs>
          <linearGradient id={goldGradId} x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4a843" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#8c6a1d" stopOpacity="0.4" />
            <stop offset="1" stopColor="#d4a843" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id={softGoldId} x1="0" y1="800" x2="800" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4a843" stopOpacity="0.5" />
            <stop offset="1" stopColor="#d4a843" stopOpacity="0.1" />
          </linearGradient>

          {/* Individual Yao (Line) Definitions for the Trigrams */}
          <g id={solidYaoId}>
            <rect x="-90" y="-8" width="180" height="16" fill={`url(#${goldGradId})`} rx="2" />
          </g>
          <g id={brokenYaoId}>
            <rect x="-90" y="-8" width="75" height="16" fill={`url(#${goldGradId})`} rx="2" />
            <rect x="15" y="-8" width="75" height="16" fill={`url(#${goldGradId})`} rx="2" />
          </g>

          {/* Reusable Constellation Element */}
          <g id={constGroup1Id}>
            <path
              d="M0 0 L30 -20 L70 -10 L100 20 L140 -10 L170 10 L210 -30"
              stroke="#d4a843"
              strokeWidth="1"
              opacity="0.22"
            />
            <circle cx="0" cy="0" r="4" fill="#d4a843" opacity="0.9" />
            <circle cx="30" cy="-20" r="2" fill="#d4a843" opacity="0.7" />
            <circle cx="70" cy="-10" r="5" fill="#d4a843" opacity="0.9" />
            <circle cx="100" cy="20" r="2" fill="#d4a843" opacity="0.8" />
            <circle cx="140" cy="-10" r="3" fill="#d4a843" opacity="0.9" />
            <circle cx="170" cy="10" r="2" fill="#d4a843" opacity="0.6" />
            <circle cx="210" cy="-30" r="4" fill="#d4a843" opacity="0.9" />
          </g>

          <g id={constGroup2Id}>
            <path d="M0 0 L-20 30 L-50 10 L-90 40 L-120 0" stroke="#d4a843" strokeWidth="1" opacity="0.2" />
            <circle cx="0" cy="0" r="3" fill="#d4a843" opacity="0.8" />
            <circle cx="-20" cy="30" r="1.5" fill="#d4a843" opacity="0.6" />
            <circle cx="-50" cy="10" r="4" fill="#d4a843" opacity="0.9" />
            <circle cx="-90" cy="40" r="2" fill="#d4a843" opacity="0.5" />
            <circle cx="-120" cy="0" r="3" fill="#d4a843" opacity="0.7" />
          </g>
        </defs>

        <g>
          {/* 2. BIG BOLD BÁT QUÁI RING (Zoomed +30%, 30% faster spin: 60s) */}
          <g style={{ transform: 'scale(1.3)', transformOrigin: '400px 400px' }}>
            <g
              style={{
                animation: 'spin 60s linear infinite',
                transformBox: 'view-box',
                transformOrigin: '400px 400px',
                willChange: 'transform',
              }}
            >
              {trigrams.map((val, i) => {
                const isInnerSolid = (val & 1) !== 0;
                const isMidSolid = (val & 2) !== 0;
                const isOuterSolid = (val & 4) !== 0;

                const angle = i * 45;
                return (
                  <g key={`trigram-${i}`} transform={`rotate(${angle} 400 400)`}>
                    <g transform="translate(400, 130)">
                      {isInnerSolid ? <use href={`#${solidYaoId}`} /> : <use href={`#${brokenYaoId}`} />}
                    </g>
                    <g transform="translate(400, 95)">
                      {isMidSolid ? <use href={`#${solidYaoId}`} /> : <use href={`#${brokenYaoId}`} />}
                    </g>
                    <g transform="translate(400, 60)">
                      {isOuterSolid ? <use href={`#${solidYaoId}`} /> : <use href={`#${brokenYaoId}`} />}
                    </g>
                  </g>
                );
              })}
            </g>
          </g>

          {/* 3. CHÒM SAO (Constellations Void Filler, Zoomed +30% to 1.43x, 30% faster: 70s) */}
          <g style={{ transform: 'scale(1.43)', transformOrigin: '400px 400px' }}>
            <g
              style={{
                animation: 'spin 70s linear infinite reverse',
                transformBox: 'view-box',
                transformOrigin: '400px 400px',
                willChange: 'transform',
              }}
            >
              {[0, 72, 144, 216, 288].map((angle) => (
                <use
                  key={`c1-${angle}`}
                  href={`#${constGroup1Id}`}
                  x="300"
                  y="240"
                  transform={`rotate(${angle} 400 400)`}
                />
              ))}
              {[36, 108, 180, 252, 324].map((angle) => (
                <use
                  key={`c2-${angle}`}
                  href={`#${constGroup2Id}`}
                  x="520"
                  y="260"
                  transform={`rotate(${angle} 400 400)`}
                />
              ))}
              {/* Dense Background starry dust filling the gap */}
              {[...Array(80)].map((_, i) => {
                const r = 90 + ((i * 17) % 140);
                const angle = (i * 137.5) % 360;
                const size = i % 3 === 0 ? 2 : i % 5 === 0 ? 2.5 : 1;
                const op = 0.2 + (i % 7) * 0.1;
                return (
                  <circle
                    key={`star-${i}`}
                    cx={400 + r * Math.cos((angle * Math.PI) / 180)}
                    cy={400 + r * Math.sin((angle * Math.PI) / 180)}
                    r={size}
                    fill="#d4a843"
                    opacity={op}
                  />
                );
              })}
            </g>
          </g>

          {/* 4. TAIJI / ÂM DƯƠNG (Centerpiece Zoomed to 1.85x, 30% faster spin: 80s) */}
          <g style={{ transform: 'scale(1.85)', transformOrigin: '400px 400px' }}>
            {/* Core background aura */}
            <circle cx="400" cy="400" r="72" fill={`url(#${goldGradId})`} opacity="0.12" />

            {/* Rotating Taiji Symbol (synchronized with Bagua at 60s) */}
            <g
              style={{
                animation: 'spin 60s linear infinite',
                transformBox: 'view-box',
                transformOrigin: '400px 400px',
                willChange: 'transform',
              }}
            >
              <circle cx="400" cy="400" r="54" stroke={`url(#${goldGradId})`} strokeWidth="3" fill="none" opacity="0.95" />

              {/* S-curve path representing the Yin/Yang split */}
              <path
                d="M 400,346 
                   A 27,27 0 0,0 400,400 
                   A 27,27 0 0,1 400,454 
                   A 54,54 0 0,1 400,346 Z"
                fill={`url(#${goldGradId})`}
                opacity="0.88"
              />

              {/* The two 'eyes' */}
              <circle cx="400" cy="373" r="7" fill="none" stroke={`url(#${goldGradId})`} strokeWidth="2.2" opacity="0.95" />
              <circle cx="400" cy="427" r="7" fill={`url(#${goldGradId})`} opacity="0.88" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
