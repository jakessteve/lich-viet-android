import React from 'react';

type MysticBackgroundVariant = 'compass' | 'luoshu' | 'dipper' | 'four-symbols';

interface MysticBackgroundPatternProps {
  variant: MysticBackgroundVariant;
  className?: string;
}

export default function MysticBackgroundPattern({ variant, className = '' }: MysticBackgroundPatternProps) {
  // Common gradients
  const defs = (
    <defs>
      <linearGradient id="mysticGold" x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d4a843" stopOpacity="0.8" />
        <stop offset="0.5" stopColor="#8c6a1d" stopOpacity="0.3" />
        <stop offset="1" stopColor="#d4a843" stopOpacity="0.8" />
      </linearGradient>

      <linearGradient id="softGold" x1="0" y1="800" x2="800" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d4a843" stopOpacity="0.4" />
        <stop offset="1" stopColor="#d4a843" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  );

  const renderCompass = () => {
    // 24 Sơn Hướng / Navigation Compass
    return (
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        {defs}
        <g style={{ animation: 'spin 160s linear infinite', transformOrigin: 'center' }}>
          {/* Concentric Base Rings */}
          {[380, 360, 320, 270, 210, 160, 100, 60].map((r, i) => (
            <circle
              key={r}
              cx="400"
              cy="400"
              r={r}
              stroke="url(#mysticGold)"
              strokeWidth={i % 2 === 0 ? '1.5' : '0.5'}
              strokeDasharray={i === 2 ? '3 10' : i === 4 ? '5 5' : 'none'}
              opacity={0.3 + (8 - i) * 0.05}
            />
          ))}

          {/* 24 Mountains radial lines */}
          <g opacity="0.5">
            {[...Array(24)].map((_, i) => (
              <line
                key={`rad-24-${i}`}
                x1="400"
                y1="40"
                x2="400"
                y2="340"
                stroke="url(#mysticGold)"
                strokeWidth="0.75"
                transform={`rotate(${i * 15} 400 400)`}
              />
            ))}
          </g>
          {/* 64 Hexagrams outer tick marks */}
          <g opacity="0.3">
            {[...Array(64)].map((_, i) => (
              <line
                key={`rad-64-${i}`}
                x1="400"
                y1="80"
                x2="400"
                y2="130"
                stroke="url(#mysticGold)"
                strokeWidth="0.5"
                transform={`rotate(${i * (360 / 64)} 400 400)`}
              />
            ))}
          </g>
          {/* Inner core */}
          <circle cx="400" cy="400" r="20" stroke="url(#mysticGold)" strokeWidth="2" opacity="0.8" />
          <circle cx="400" cy="400" r="5" fill="#d4a843" opacity="0.9" />
        </g>
      </svg>
    );
  };

  const renderLuoshu = () => {
    // Lạc Thư / Magic Square - perfect symmetric 3x3 network
    const offset = 160;
    const nodes = [
      [400 - offset, 400 - offset],
      [400, 400 - offset],
      [400 + offset, 400 - offset],
      [400 - offset, 400],
      [400, 400],
      [400 + offset, 400],
      [400 - offset, 400 + offset],
      [400, 400 + offset],
      [400 + offset, 400 + offset],
    ];
    return (
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        {defs}
        <g style={{ animation: 'spin 200s linear infinite reverse', transformOrigin: 'center' }}>
          {/* Celestial bounding frames */}
          <circle
            cx="400"
            cy="400"
            r="340"
            stroke="url(#mysticGold)"
            strokeWidth="0.5"
            strokeDasharray="5 15"
            opacity="0.3"
          />
          <circle cx="400" cy="400" r="320" stroke="url(#mysticGold)" strokeWidth="1" opacity="0.2" />
          <circle cx="400" cy="400" r="226" stroke="url(#mysticGold)" strokeWidth="1" opacity="0.1" />

          {/* Symmetrical Web Connections */}
          <g stroke="url(#mysticGold)" strokeWidth="1.5" opacity="0.4">
            {/* Horizontals */}
            <line x1={400 - offset} y1={400 - offset} x2={400 + offset} y2={400 - offset} />
            <line x1={400 - offset} y1={400} x2={400 + offset} y2={400} />
            <line x1={400 - offset} y1={400 + offset} x2={400 + offset} y2={400 + offset} />
            {/* Verticals */}
            <line x1={400 - offset} y1={400 - offset} x2={400 - offset} y2={400 + offset} />
            <line x1={400} y1={400 - offset} x2={400} y2={400 + offset} />
            <line x1={400 + offset} y1={400 - offset} x2={400 + offset} y2={400 + offset} />
            {/* Diagonals */}
            <line x1={400 - offset} y1={400 - offset} x2={400 + offset} y2={400 + offset} />
            <line x1={400 - offset} y1={400 + offset} x2={400 + offset} y2={400 - offset} />
          </g>

          {/* Luoshu Nodes */}
          {nodes.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="32" fill="url(#mysticGold)" opacity="0.05" />
              <circle cx={x} cy={y} r="24" stroke="url(#mysticGold)" strokeWidth="1" opacity="0.4" />
              <circle cx={x} cy={y} r="6" fill="#d4a843" opacity="0.9" />
            </g>
          ))}
        </g>
      </svg>
    );
  };

  const renderDipper = () => {
    // Thất Tinh Bắc Đẩu - Highly stylized Big Dipper wrapping the pole star
    // Centered and balanced so rotation is hypnotic and symmetrical relative to the box
    return (
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        {defs}
        {/* Ambient celestial frame */}
        <circle
          cx="400"
          cy="400"
          r="360"
          stroke="url(#mysticGold)"
          strokeWidth="1"
          strokeDasharray="3 9"
          opacity="0.3"
        />
        <circle cx="400" cy="400" r="200" stroke="url(#mysticGold)" strokeWidth="0.5" opacity="0.15" />

        {/* The Pole Star (Tử Vi) - Fixed or counter-rotating */}
        <circle cx="400" cy="400" r="6" fill="#ffffff" opacity="0.8" />
        <circle cx="400" cy="400" r="30" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />

        {/* Big Dipper Constellation */}
        <g style={{ animation: 'spin 180s linear infinite', transformOrigin: 'center' }}>
          {/* Thick connecting light beams */}
          <path
            d="M 240 280 L 320 220 L 380 260 L 410 340 L 490 420 L 570 460 L 650 430"
            stroke="url(#mysticGold)"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
            strokeLinejoin="round"
          />
          <path
            d="M 410 340 L 240 280"
            stroke="url(#mysticGold)"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
            strokeLinejoin="round"
          />

          {/* Specific offset stars */}
          {[
            [240, 280],
            [320, 220],
            [380, 260],
            [410, 340],
            [490, 420],
            [570, 460],
            [650, 430],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="45" fill="url(#mysticGold)" opacity="0.04" />
              <circle cx={x} cy={y} r="14" fill="url(#mysticGold)" opacity="0.2" />
              <circle cx={x} cy={y} r="5" fill="#d4a843" opacity="0.9" />
            </g>
          ))}

          {/* Distant background stars moving with the constellation */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={400 + 260 * Math.cos(i * 12)}
              cy={400 + 260 * Math.sin(i * 12)}
              r={1.5}
              fill="#d4a843"
              opacity={0.1 + (i % 5) * 0.1}
            />
          ))}
        </g>
      </svg>
    );
  };

  const renderFourSymbols = () => {
    // Tứ Tượng - 4 Guardians mapping the four directions symmetrically
    return (
      <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        {defs}
        <g style={{ animation: 'spin 140s linear infinite reverse', transformOrigin: 'center' }}>
          {/* Massive boundary rings representing Earth and Heaven */}
          <circle cx="400" cy="400" r="370" stroke="url(#mysticGold)" strokeWidth="2" opacity="0.4" />
          <circle
            cx="400"
            cy="400"
            r="350"
            stroke="url(#mysticGold)"
            strokeWidth="1"
            strokeDasharray="10 10"
            opacity="0.3"
          />
          <circle cx="400" cy="400" r="140" stroke="url(#mysticGold)" strokeWidth="3" opacity="0.5" />

          {/* Inner Taiji representation Aura */}
          <circle cx="400" cy="400" r="80" fill="url(#mysticGold)" opacity="0.05" />
          <path
            d="M 400 320 A 40 40 0 0 0 400 400 A 40 40 0 0 1 400 480 A 80 80 0 0 1 400 320"
            fill="url(#mysticGold)"
            opacity="0.1"
          />

          {/* 4 Guardian Crests */}
          {[0, 90, 180, 270].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 400 400)`}>
              {/* Sacred Temple / Crest geometry for each guardian */}
              <path
                d="M 370 60 L 430 60 L 450 110 L 400 130 L 350 110 Z"
                fill="none"
                stroke="url(#mysticGold)"
                strokeWidth="2"
                opacity="0.7"
              />
              <path
                d="M 350 140 Q 400 170 450 140"
                fill="none"
                stroke="url(#mysticGold)"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <circle cx="400" cy="95" r="8" fill="#d4a843" opacity="0.9" />
              <circle cx="400" cy="95" r="20" stroke="url(#mysticGold)" strokeWidth="1" fill="none" opacity="0.3" />

              {/* Connecting energy lines to center */}
              <line
                x1="400"
                y1="140"
                x2="400"
                y2="260"
                stroke="url(#mysticGold)"
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="3 6"
              />
            </g>
          ))}

          {/* Intersecting diagonal compass points */}
          <g opacity="0.2">
            {[45, 135, 225, 315].map((angle) => (
              <line
                key={angle}
                x1="400"
                y1="150"
                x2="400"
                y2="350"
                stroke="url(#mysticGold)"
                strokeWidth="0.5"
                transform={`rotate(${angle} 400 400)`}
              />
            ))}
          </g>
        </g>
      </svg>
    );
  };

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {variant === 'compass' && renderCompass()}
      {variant === 'luoshu' && renderLuoshu()}
      {variant === 'dipper' && renderDipper()}
      {variant === 'four-symbols' && renderFourSymbols()}
    </div>
  );
}
