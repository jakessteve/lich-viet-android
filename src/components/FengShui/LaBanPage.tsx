import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCompassSensor } from '@/hooks/useCompassSensor';
import { useIsPhone } from '@/hooks/useIsPhone';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useTuViStore } from '@/stores/tuviStore';
import { useShallow } from 'zustand/react/shallow';
import { generateChart } from '@/services/tuvi';
import { getUserBirthProfile } from '@/utils/userBirthProfile';
import {
  COMPASS_DIRECTIONS,
  calculateAnnualStar,
  calculateMonthlyStar,
  getBatTrachProfileFromBirthYearAndGender,
  generateLouPanChart,
  getActiveVanForYear,
  getMountainForHeading,
  normalizeHeading,
  type FlyingStarChart,
} from '@lich-viet/core/fengshui';
import { ActionButton } from '../shared';
import type { Mountain24 } from '@/types/fengshui';
import type { TuViGender, TuViInput } from '@/types/tuvi';

const PERIOD_OPTIONS = [
  { value: '', label: 'Tự động' },
  ...Array.from({ length: 9 }, (_, index) => ({ value: String(index + 1), label: `Vận ${index + 1}` })),
];

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function polarToCartesian(angleDeg: number, radius: number, center = 500): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

function getShortestHeadingDelta(fromDeg: number, toDeg: number): number {
  return ((normalizeHeading(toDeg) - normalizeHeading(fromDeg) + 540) % 360) - 180;
}

function useContinuousHeading(headingDeg: number): number {
  const initialHeadingRef = useRef(normalizeHeading(headingDeg));
  const [continuousHeading, setContinuousHeading] = useState(initialHeadingRef.current);

  useEffect(() => {
    const targetHeading = normalizeHeading(headingDeg);
    setContinuousHeading((currentHeading) => currentHeading + getShortestHeadingDelta(currentHeading, targetHeading));
  }, [headingDeg]);

  return continuousHeading;
}

function getChiHourFromClockHour(hour: number): number {
  return hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
}

function toTuViGender(gender?: 'male' | 'female'): TuViGender | null {
  if (gender === 'male') return 'nam';
  if (gender === 'female') return 'nữ';
  return null;
}

function describeRingSector(startDeg: number, endDeg: number, innerRadius: number, outerRadius: number): string {
  const start = polarToCartesian(startDeg, outerRadius);
  const end = polarToCartesian(endDeg, outerRadius);
  const innerEnd = polarToCartesian(endDeg, innerRadius);
  const innerStart = polarToCartesian(startDeg, innerRadius);
  const largeArc = ((endDeg - startDeg + 360) % 360) > 180 ? 1 : 0;

  return [
    `M ${start.x} ${start.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function getSectorStyle(active: boolean, sitting: boolean, menh: boolean, auspicious: boolean): string {
  return cx(
    'rounded-2xl border p-3 transition-all duration-200',
    active
      ? 'border-gold-light bg-gold/10 text-text-primary-light shadow-[0_0_0_1px_rgba(212,174,96,0.25)] dark:border-gold-dark dark:bg-gold-dark/10 dark:text-white'
      : sitting
        ? 'border-blue-300/70 bg-blue-50/60 dark:border-blue-400/40 dark:bg-blue-400/10'
        : menh
          ? 'border-emerald-300/70 bg-emerald-50/60 dark:border-emerald-400/40 dark:bg-emerald-400/10'
          : auspicious
            ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-400/20 dark:bg-emerald-400/6'
            : 'border-border-light/70 bg-white/70 dark:border-white/8 dark:bg-white/[0.03]',
  );
}

const PALACE_ANGLES = [
  { label: 'Bắc', angle: 0, sublabel: '坎' },
  { label: 'Đông Bắc', angle: 45, sublabel: '艮' },
  { label: 'Đông', angle: 90, sublabel: '震' },
  { label: 'Đông Nam', angle: 135, sublabel: '巽' },
  { label: 'Nam', angle: 180, sublabel: '离' },
  { label: 'Tây Nam', angle: 225, sublabel: '坤' },
  { label: 'Tây', angle: 270, sublabel: '兑' },
  { label: 'Tây Bắc', angle: 315, sublabel: '乾' },
] as const;

const HEAVENLY_STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
const EARTHLY_BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
const JIA_ZI_RING = Array.from({ length: 60 }, (_, index) => `${HEAVENLY_STEMS[index % 10]} ${EARTHLY_BRANCHES[index % 12]}`);
const LONG_72_RING = Array.from({ length: 72 }, (_, index) => index + 1);
const PHAN_KIM_RING = Array.from({ length: 120 }, (_, index) => index + 1);

function LuopanDial({
  chart,
  headingDeg,
  activeMountain,
  sittingMountain,
  menhLabels,
}: {
  chart: FlyingStarChart;
  headingDeg: number;
  activeMountain: Mountain24;
  sittingMountain: Mountain24;
  menhLabels: Set<string>;
}) {
  const visualHeading = useContinuousHeading(headingDeg);
  const dialRotation = -visualHeading;
  const palaceMap = new Map(chart.palaces.map((palace) => [palace.positionVi, palace]));

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[760px] items-center justify-center overflow-hidden rounded-full">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.98)_0%,_rgba(252,249,241,0.98)_38%,_rgba(232,219,188,0.98)_78%,_rgba(110,78,28,0.85)_100%)] shadow-[0_28px_90px_rgba(0,0,0,0.16)] dark:bg-[radial-gradient(circle_at_center,_rgba(30,32,38,0.98)_0%,_rgba(23,24,29,0.98)_40%,_rgba(35,29,18,0.98)_78%,_rgba(102,72,23,0.9)_100%)]" />
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="luopan-metal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="55%" stopColor="rgba(212,174,96,0.14)" />
            <stop offset="100%" stopColor="rgba(101,75,24,0.65)" />
          </radialGradient>
          <filter id="luopan-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.22)" />
          </filter>
          <marker id="needle-tip" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
          </marker>
        </defs>

        <g data-testid="luopan-dial-plate" transform={`rotate(${dialRotation} 500 500)`}>
          <circle cx="500" cy="500" r="496" fill="none" stroke="rgba(95,65,20,0.7)" strokeWidth="10" />
          <circle cx="500" cy="500" r="478" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
          <circle cx="500" cy="500" r="454" fill="none" stroke="rgba(212,174,96,0.42)" strokeWidth="2" />
          <circle cx="500" cy="500" r="420" fill="none" stroke="rgba(95,65,20,0.35)" strokeWidth="1.5" />
          <circle cx="500" cy="500" r="382" fill="none" stroke="rgba(212,174,96,0.45)" strokeWidth="2" />
          <circle cx="500" cy="500" r="340" fill="none" stroke="rgba(95,65,20,0.35)" strokeWidth="1.5" />
          <circle cx="500" cy="500" r="292" fill="none" stroke="rgba(212,174,96,0.45)" strokeWidth="2" />
          <circle cx="500" cy="500" r="238" fill="none" stroke="rgba(95,65,20,0.18)" strokeWidth="1" />
          <circle cx="500" cy="500" r="172" fill="none" stroke="rgba(212,174,96,0.45)" strokeWidth="2" />

          {PHAN_KIM_RING.map((mark) => {
            const angle = (mark - 1) * 3;
            const major = (mark - 1) % 5 === 0;
            const start = polarToCartesian(angle, 492);
            const end = polarToCartesian(angle, major ? 458 : 468);
            const label = polarToCartesian(angle + 1.5, 472);
            return (
              <g key={`phan-kim-${mark}`}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(92,64,22,0.48)" strokeWidth={major ? 2 : 0.8} />
                {mark % 10 === 1 && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(74,51,18,0.78)"
                    style={{ fontSize: '9px', fontWeight: 700 }}
                  >
                    {mark}
                  </text>
                )}
              </g>
            );
          })}

          {LONG_72_RING.map((mark) => {
            const angle = (mark - 1) * 5;
            const start = polarToCartesian(angle, 454);
            const end = polarToCartesian(angle, mark % 3 === 1 ? 424 : 434);
            const label = polarToCartesian(angle + 2.5, 444);
            return (
              <g key={`long-72-${mark}`}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(126,94,38,0.42)" strokeWidth={mark % 3 === 1 ? 1.6 : 0.8} />
                {mark % 6 === 1 && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(74,51,18,0.72)"
                    style={{ fontSize: '10px', fontWeight: 700 }}
                  >
                    {mark}
                  </text>
                )}
              </g>
            );
          })}

          {JIA_ZI_RING.map((label, index) => {
            const angle = index * 6 + 3;
            const point = polarToCartesian(angle, index % 2 === 0 ? 428 : 440);
            return (
              <g key={`jia-zi-${label}-${index}`} transform={`translate(${point.x} ${point.y}) rotate(${angle - 90})`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={index % 2 === 0 ? 'rgba(35,31,24,0.92)' : 'rgba(120,38,22,0.88)'}
                  style={{ fontSize: '13px', fontWeight: 700, letterSpacing: 0 }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {PALACE_ANGLES.map((palace) => {
            const point = polarToCartesian(palace.angle, 226);
            const palaceStars = palaceMap.get(palace.label);
            return (
              <g key={palace.label} transform={`translate(${point.x} ${point.y})`}>
                <text textAnchor="middle" dominantBaseline="middle" fill="rgba(35,31,24,0.96)" style={{ fontSize: '22px', fontWeight: 800 }}>
                  {palace.label}
                </text>
                <text y="26" textAnchor="middle" dominantBaseline="middle" fill="rgba(120,38,22,0.88)" style={{ fontSize: '13px', fontWeight: 700 }}>
                  {palace.sublabel} · {palaceStars ? `${palaceStars.mountainStar}${palaceStars.periodStar}${palaceStars.waterStar}` : '---'}
                </text>
              </g>
            );
          })}

          {COMPASS_DIRECTIONS.map((mountain) => {
            const active = mountain.nameVi === activeMountain.nameVi;
            const sitting = mountain.nameVi === sittingMountain.nameVi;
            const menh = menhLabels.has(mountain.nameVi);
            const auspicious = chart.payload?.astrologicalMasks.auspiciousSectors.includes(mountain.palace) ?? false;
            const centerAngle = mountain.degreeStart + 7.5;
            const labelPoint = polarToCartesian(centerAngle, 334);
            const sectorFill = active
              ? 'rgba(212,174,96,0.42)'
              : sitting
                ? 'rgba(96,165,250,0.22)'
                : menh
                  ? 'rgba(16,185,129,0.16)'
                  : auspicious
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(255,255,255,0.06)';

            return (
              <g key={mountain.id}>
                <path d={describeRingSector(mountain.degreeStart, mountain.degreeEnd, 292, 382)} fill={sectorFill} stroke="rgba(96,72,26,0.18)" strokeWidth="1" />
                <path d={describeRingSector(mountain.degreeStart, mountain.degreeEnd, 340, 382)} fill="rgba(255,255,255,0.08)" stroke="rgba(96,72,26,0.1)" strokeWidth="0.6" />
                <g transform={`translate(${labelPoint.x} ${labelPoint.y})`}>
                  <text textAnchor="middle" dominantBaseline="middle" fill={active || sitting ? '#111827' : 'rgba(31,41,55,0.98)'} style={{ fontSize: '17px', fontWeight: 700 }}>
                    {mountain.nameVi}
                  </text>
                  <text y="19" textAnchor="middle" dominantBaseline="middle" fill="rgba(111,92,54,0.85)" style={{ fontSize: '11px', fontWeight: 700 }}>
                    {mountain.nameHan} · {Math.round(normalizeHeading(mountain.degreeStart))}°
                  </text>
                </g>
              </g>
            );
          })}

          <circle cx="500" cy="500" r="238" fill="transparent" stroke="rgba(212,174,96,0.18)" strokeWidth="1.25" />
          <path d="M500 310 L530 500 L500 690 L470 500 Z" fill="rgba(151,104,31,0.16)" stroke="rgba(151,104,31,0.26)" strokeWidth="1" />
          <circle cx="500" cy="500" r="92" fill="url(#luopan-metal)" stroke="rgba(212,174,96,0.7)" strokeWidth="4" />
          <circle cx="500" cy="500" r="46" fill="rgba(17,24,39,0.95)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
          <text x="500" y="508" textAnchor="middle" fill="rgba(255,255,255,0.9)" style={{ fontSize: '13px', fontWeight: 700 }}>
            {chart?.facingDirection || 'La kinh'}
          </text>
        </g>

        <line x1="500" y1="500" x2="500" y2="118" stroke="rgb(212,174,96)" strokeWidth="7" strokeLinecap="round" markerEnd="url(#needle-tip)" filter="url(#luopan-soft-shadow)" />
        <g data-testid="luopan-needle-heading-label" transform="translate(500 104)">
          <rect x="-78" y="-28" width="156" height="46" rx="14" fill="rgba(17,24,39,0.92)" stroke="rgba(255,255,255,0.82)" strokeWidth="1.5" />
          <text x="0" y="-7" textAnchor="middle" fill="rgba(255,255,255,0.96)" style={{ fontSize: '18px', fontWeight: 800 }}>
            {activeMountain.nameVi}
          </text>
          <text x="0" y="11" textAnchor="middle" fill="rgba(255,255,255,0.78)" style={{ fontSize: '11px', fontWeight: 700 }}>
            {Math.round(normalizeHeading(headingDeg))}° tại đầu máy
          </text>
        </g>
      </svg>

    </div>
  );
}

function StarCell({
  label,
  cell,
  active,
  sitting,
}: {
  label: string;
  cell: FlyingStarChart['palaces'][number];
  active: boolean;
  sitting: boolean;
}) {
  return (
    <div className={getSectorStyle(active, sitting, false, [1, 6, 8].includes(cell.periodStar) || [1, 6, 8].includes(cell.mountainStar) || [1, 6, 8].includes(cell.waterStar))}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-secondary-light dark:text-text-secondary-dark">
            {label}
          </p>
          <p className="mt-1 text-[12px] font-bold leading-tight text-text-primary-light dark:text-text-primary-dark">{cell.positionVi}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border-light/60 px-1.5 py-0.5 text-[10px] font-bold text-text-secondary-light dark:border-white/10 dark:text-text-secondary-dark">
          {cell.position}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
        <div className="min-w-0 rounded-lg border border-border-light/50 px-1.5 py-1 dark:border-white/10">
          <span className="block text-[10px] uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">Vận</span>
          <span className="block text-[12px] font-bold leading-none">{cell.periodStar}</span>
        </div>
        <div className="min-w-0 rounded-lg border border-border-light/50 px-1.5 py-1 dark:border-white/10">
          <span className="block text-[10px] uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">Sơn</span>
          <span className="block text-[12px] font-bold leading-none">{cell.mountainStar}</span>
        </div>
        <div className="min-w-0 rounded-lg border border-border-light/50 px-1.5 py-1 dark:border-white/10">
          <span className="block text-[10px] uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">Hướng</span>
          <span className="block text-[12px] font-bold leading-none">{cell.waterStar}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
        <span>Niên {cell.annualStar ?? '—'}</span>
        <span>Nguyệt {cell.monthlyStar ?? '—'}</span>
      </div>
    </div>
  );
}

export const LaBanPage: React.FC = () => {
  usePageTitle('La bàn');
  const navigate = useNavigate();
  const isPhone = useIsPhone();
  const sensor = useCompassSensor();
  const { user } = useAuthStore();
  const { selectedDate, dayData, viewerLocation } = useAppStore(
    useShallow((state) => ({
      selectedDate: state.selectedDate,
      dayData: state.dayData,
      viewerLocation: state.viewerLocation,
    })),
  );
  const tuViChart = useTuViStore((state) => state.chart);
  const userBirthProfile = useMemo(() => getUserBirthProfile(user), [user]);

  const [constructionYear, setConstructionYear] = useState(selectedDate.getFullYear());
  const [manualPeriod, setManualPeriod] = useState('');
  const [manualHeading, setManualHeading] = useState(0);
  const [lockedHeading, setLockedHeading] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const sensorSupported = sensor.supported;
  const sensorListening = sensor.listening;
  const sensorPermissionState = sensor.permissionState;
  const sensorStart = sensor.start;
  const supportsCompassPermissionRequest =
    typeof window !== 'undefined' &&
    typeof (window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    })?.requestPermission === 'function';

  const liveHeading = sensor.headingDeg ?? manualHeading;
  const effectiveHeading = isLocked && lockedHeading !== null ? lockedHeading : liveHeading;
  const activeMountain = useMemo(() => getMountainForHeading(effectiveHeading), [effectiveHeading]);
  const sittingMountain = useMemo(() => getMountainForHeading(normalizeHeading(effectiveHeading + 180)), [effectiveHeading]);
  const settingsBatTrachProfile = useMemo(() => {
    const birthYear = userBirthProfile?.birthYear;
    if (birthYear == null) return null;
    const birthProfile = userBirthProfile;
    const gender = toTuViGender(birthProfile?.gender);
    if (!gender) return null;
    return getBatTrachProfileFromBirthYearAndGender(birthYear, gender);
  }, [userBirthProfile]);
  const derivedTuViChart = useMemo(() => {
    if (
      userBirthProfile?.birthYear == null ||
      userBirthProfile?.birthMonth == null ||
      userBirthProfile?.birthDay == null ||
      userBirthProfile?.birthHour == null
    ) {
      return null;
    }

    const birthProfile = userBirthProfile;
    const birthYear = birthProfile.birthYear;
    const birthMonth = birthProfile.birthMonth;
    const birthDay = birthProfile.birthDay;
    const birthHour = birthProfile.birthHour;
    const gender = toTuViGender(birthProfile.gender);
    if (birthYear == null || birthMonth == null || birthDay == null || birthHour == null || gender == null) {
      return null;
    }

    const input: TuViInput = {
      name: user?.displayName ?? '',
      solarDate: new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthProfile.birthMinute ?? 0),
      birthHour: getChiHourFromClockHour(birthHour),
      birthClockHour: birthHour,
      birthMinute: birthProfile.birthMinute ?? 0,
      gender,
      timezone: 'Asia/Ho_Chi_Minh',
      birthLocation: birthProfile.birthLocation,
    };

    try {
      return generateChart(input);
    } catch {
      return null;
    }
  }, [user?.displayName, userBirthProfile]);
  const effectiveTuViChart = tuViChart ?? derivedTuViChart;
  const chart = useMemo(
    () =>
      generateLouPanChart({
        headingDeg: effectiveHeading,
        constructionYear,
        selectedDate,
        manualPeriod: manualPeriod ? Number(manualPeriod) : undefined,
        trueHeadingDeg: sensor.trueHeadingDeg,
        magneticHeadingDeg: sensor.magneticHeadingDeg,
        dayData,
        tuViChart: effectiveTuViChart,
        batTrachProfile: settingsBatTrachProfile,
      }),
    [
      constructionYear,
      dayData,
      effectiveHeading,
      effectiveTuViChart,
      manualPeriod,
      selectedDate,
      sensor.magneticHeadingDeg,
      sensor.trueHeadingDeg,
      settingsBatTrachProfile,
    ],
  );

  const annualStar = useMemo(() => calculateAnnualStar(selectedDate.getFullYear()), [selectedDate]);
  const monthlyStar = useMemo(() => calculateMonthlyStar(selectedDate.getFullYear(), dayData.lunarDate.month), [dayData.lunarDate.month, selectedDate]);
  const menhLabels = useMemo(
    () => new Set(effectiveTuViChart?.palaces.filter((palace) => palace.isMenh || palace.isThan).map((palace) => palace.chi) ?? []),
    [effectiveTuViChart],
  );
  const activeVan = chart.activeVan ?? getActiveVanForYear(constructionYear);
  const batTrachProfile = chart.payload?.astrologicalMasks.batTrachProfile ?? settingsBatTrachProfile ?? null;
  const batTrachAlignment = chart.payload?.astrologicalMasks.batTrachAlignment ?? null;
  const batTrachRoomRecommendation = chart.payload?.astrologicalMasks.batTrachRoomRecommendation ?? null;
  const batTrachSourceLabel = tuViChart ? 'Tử Vi' : settingsBatTrachProfile ? 'Cài đặt' : null;

  const handleStartSensor = async () => {
    await sensor.start();
  };

  const handleLock = () => {
    setLockedHeading(effectiveHeading);
    setIsLocked(true);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setLockedHeading(null);
  };

  const handleMaiHoaHandoff = () => {
    navigate('/app/gieo-que');
  };

  const handleOpenTuVi = () => {
    navigate('/app/tu-vi');
  };

  useEffect(() => {
    if (!isPhone || !sensorSupported || sensorListening || sensorPermissionState !== 'prompt' || supportsCompassPermissionRequest) {
      return;
    }

    void sensorStart();
  }, [isPhone, sensorListening, sensorPermissionState, sensorStart, sensorSupported, supportsCompassPermissionRequest]);

  const showSensorPrompt = isPhone && sensorSupported && sensorPermissionState !== 'granted';

  return (
    <div className="space-y-6">
      <div className="surface-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
            La bàn Phong Thủy
          </p>
          <p className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">
            {sensorPermissionState === 'granted' && sensorListening
              ? 'Đang đọc cảm biến điện thoại'
              : isPhone
                ? 'Cho phép cảm biến điện thoại để la bàn tự xoay theo hướng bạn cầm máy.'
                : 'Nhập tay để điều hướng la bàn; cảm biến chỉ được bật trên điện thoại.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={isLocked ? handleUnlock : handleLock} icon={isLocked ? 'lock_open' : 'lock'}>
            {isLocked ? 'Mở khóa' : 'Khóa hướng'}
          </ActionButton>
        </div>
      </div>

      {showSensorPrompt && (
        <div className="surface-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
              Cảm biến điện thoại
            </p>
            <p className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">
              {sensorPermissionState === 'denied'
                ? 'Quyền cảm biến đã bị từ chối. Chạm để thử lại nếu bạn muốn dùng la bàn trên điện thoại.'
                : 'Chạm để cho phép cảm biến điện thoại và tự xoay la bàn theo hướng bạn cầm máy.'}
            </p>
          </div>
          <ActionButton onClick={handleStartSensor} icon="explore" variant="primary" disabled={!sensorSupported}>
            {sensorPermissionState === 'denied' ? 'Thử lại' : 'Cho phép cảm biến'}
          </ActionButton>
        </div>
      )}

      {sensor.message && (
        <div className="surface-panel border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          {sensor.message}
        </div>
      )}

      <section className="surface-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light/40 pb-4 dark:border-border-dark/40">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
              Hướng hiện tại
            </p>
            <p className="mt-1 text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {Math.round(normalizeHeading(effectiveHeading))}° · {activeMountain.nameVi}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="rounded-xl border border-border-light/50 bg-black/5 px-3 py-2 dark:border-white/8 dark:bg-white/[0.04]">
              <span className="block text-text-secondary-light dark:text-text-secondary-dark">Tín hiệu</span>
              <span className="block mt-0.5">{sensor.source}</span>
            </div>
            <div className="rounded-xl border border-border-light/50 bg-black/5 px-3 py-2 dark:border-white/8 dark:bg-white/[0.04]">
              <span className="block text-text-secondary-light dark:text-text-secondary-dark">Độ chính xác</span>
              <span className="block mt-0.5">{sensor.accuracyDeg ?? '—'}°</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
          <span className="rounded-full border border-border-light/60 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/[0.05]">La kinh 24 Sơn</span>
          <span className="rounded-full border border-border-light/60 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/[0.05]">60 Hoa Giáp</span>
          <span className="rounded-full border border-border-light/60 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/[0.05]">72 Long</span>
          <span className="rounded-full border border-border-light/60 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/[0.05]">120 Phân Kim</span>
          <span className="rounded-full border border-border-light/60 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/[0.05]">Phi tinh</span>
        </div>

        <div className="mt-5">
          <LuopanDial chart={chart} headingDeg={effectiveHeading} activeMountain={activeMountain} sittingMountain={sittingMountain} menhLabels={menhLabels} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="surface-control flex min-h-11 items-center gap-2 px-3 py-2">
            <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">straighten</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
              Hướng nhập
            </span>
            <input
              type="number"
              min={0}
              max={360}
              step="0.1"
              value={manualHeading}
              onChange={(event) => setManualHeading(Number(event.target.value) || 0)}
              className="ml-auto w-24 bg-transparent text-right text-sm font-semibold outline-none"
              aria-label="Hướng thủ công"
            />
          </label>

          <label className="surface-control flex min-h-11 items-center gap-2 px-3 py-2">
            <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">home</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
              Năm xây
            </span>
            <input
              type="number"
              min={1800}
              max={2100}
              step={1}
              value={constructionYear}
              onChange={(event) => setConstructionYear(Number(event.target.value) || selectedDate.getFullYear())}
              className="ml-auto w-24 bg-transparent text-right text-sm font-semibold outline-none"
              aria-label="Năm xây công trình"
            />
          </label>

          <label className="surface-control flex min-h-11 items-center gap-2 px-3 py-2 sm:col-span-2">
            <span className="material-icons-round text-base text-gold-light dark:text-gold-dark">filter_alt</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
              Vận thủ công
            </span>
            <select
              value={manualPeriod}
              onChange={(event) => setManualPeriod(event.target.value)}
              className="ml-auto bg-transparent text-sm font-semibold outline-none"
              aria-label="Chọn vận thủ công"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value || 'auto'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        <section className="surface-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
                Bối cảnh
              </p>
              <p className="mt-1 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                Âm lịch + Tử Vi + La bàn
              </p>
            </div>
            <span className="rounded-full border border-border-light/60 px-3 py-1 text-xs font-semibold dark:border-white/10">
              Vận {activeVan}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-border-light/60 bg-black/5 px-3 py-2 dark:border-white/8 dark:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">Ngày hiện tại</p>
              <p className="mt-1 font-semibold">
                {dayData.dayOfWeek} · {dayData.lunarDate.day}/{dayData.lunarDate.month}/{dayData.lunarDate.year}
              </p>
            </div>
            <div className="rounded-xl border border-border-light/60 bg-black/5 px-3 py-2 dark:border-white/8 dark:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">Can Chi</p>
              <p className="mt-1 font-semibold">
                {dayData.canChi.day.can} {dayData.canChi.day.chi} · {dayData.canChi.month.can} {dayData.canChi.month.chi} · {dayData.canChi.year.can} {dayData.canChi.year.chi}
              </p>
            </div>
            <div className="rounded-xl border border-border-light/60 bg-black/5 px-3 py-2 dark:border-white/8 dark:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">Tử Vi</p>
              <p className="mt-1 font-semibold">
                {tuViChart ? `${tuViChart.centerInfo.menhCung} · ${tuViChart.centerInfo.thanCungLabel}` : 'Chưa có lá số'}
              </p>
            </div>
          </div>

          {viewerLocation && (
            <p className="mt-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Vị trí xem: {viewerLocation.longitude.toFixed(2)}° · múi giờ {viewerLocation.timezoneOffsetHours}
            </p>
          )}
        </section>

        <details className="surface-panel group p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
                Phi tinh
              </p>
              <p className="mt-1 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                3x3 theo vận, hướng và thời gian
              </p>
            </div>
            <div className="flex items-center gap-3 text-right text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              <div>
                <p>Niên {annualStar.centerStar}</p>
                <p>Nguyệt {monthlyStar.centerStar}</p>
              </div>
              <span className="material-icons-round text-xl text-text-secondary-light transition-transform duration-200 group-open:rotate-180 dark:text-text-secondary-dark">
                expand_more
              </span>
            </div>
          </summary>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {chart.palaces.map((cell) => (
              <StarCell
                key={cell.position}
                label={cell.positionVi}
                cell={cell}
                active={cell.positionVi === chart.facingDirection}
                sitting={chart.sittingMountain?.directionGroup === cell.positionVi}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">Vận {chart.activeVan ?? activeVan}</span>
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">
              Hướng {chart.facingMountain?.nameVi} · {chart.sittingMountain?.nameVi}
            </span>
          </div>
        </details>

        <section className="surface-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
                Kết nối
              </p>
              <p className="mt-1 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                Tử Vi và Gieo Quẻ
              </p>
            </div>
            <span className="rounded-full border border-border-light/60 px-3 py-1 text-xs font-semibold dark:border-white/10">
              {tuViChart ? 'Có lá số' : 'Chưa có lá số'}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Dùng hướng đã khóa để tạo một quy chiếu ổn định cho quẻ Mai Hoa, đồng thời giữ nguyên dòng nhập thời gian/số của Gieo Quẻ hiện có.
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={handleMaiHoaHandoff} icon="casino" variant="primary">
                Mở Gieo quẻ
              </ActionButton>
              <ActionButton
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(String(Math.round(normalizeHeading(effectiveHeading))));
                  } catch {
                    // Ignore clipboard failures in restricted contexts.
                  }
                }}
                icon="content_copy"
                variant="secondary"
              >
                Sao chép số hướng
              </ActionButton>
            </div>
          </div>
        </section>

        <section className="surface-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light dark:text-text-secondary-dark">
                Bát trạch cá nhân
              </p>
              <p className="mt-1 text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                Hướng nhà, bàn, giường và cửa theo Tử Vi
              </p>
            </div>
            <span className="rounded-full border border-border-light/60 px-3 py-1 text-xs font-semibold dark:border-white/10">
              {batTrachProfile ? `${batTrachProfile.cungName} · ${batTrachProfile.houseGroup}` : 'Chưa có lá số'}
            </span>
          </div>

          {batTrachSourceLabel && (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
              <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">Nguồn {batTrachSourceLabel}</span>
              {userBirthProfile?.birthLocation?.locationName && (
                <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">
                  {userBirthProfile.birthLocation.locationName}
                </span>
              )}
            </div>
          )}

          {!batTrachProfile ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/5 px-3 py-3 dark:bg-white/[0.04]">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Lập lá số Tử Vi để tự động tính cung phi, nhóm mệnh và các hướng hợp cho nhà, bàn làm việc, giường ngủ.
              </p>
              <ActionButton onClick={handleOpenTuVi} icon="person_search" variant="secondary">
                Lập lá số Tử Vi
              </ActionButton>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {batTrachProfile.summary}
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                    Hướng hợp
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {batTrachProfile.favorableDirections.map((rule) => (
                      <span
                        key={`${rule.direction}-${rule.star}`}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200"
                      >
                        {rule.direction} · {rule.star}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">
                    Hướng cần tránh
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {batTrachProfile.unfavorableDirections.map((rule) => (
                      <span
                        key={`${rule.direction}-${rule.star}`}
                        className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-400/10 dark:text-rose-200"
                      >
                        {rule.direction} · {rule.star}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-black/5 px-3 py-3 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
                      Hướng đang xét
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {batTrachAlignment?.direction ?? '—'} · {batTrachAlignment?.star ?? '—'}
                    </p>
                  </div>
                  <span
                    className={cx(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      batTrachAlignment?.isAuspicious
                        ? 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200'
                        : 'bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200',
                    )}
                  >
                    {batTrachAlignment?.score ?? 0}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {batTrachAlignment?.note ?? 'Chưa có hướng để đối chiếu.'}
                </p>
                {batTrachRoomRecommendation && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">
                      Gợi ý cho không gian
                    </p>
                    <p className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">
                      {batTrachRoomRecommendation.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {batTrachRoomRecommendation.preferredDirections.map((rule) => (
                        <span
                          key={`room-${rule.direction}-${rule.star}`}
                          className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-text-primary-light dark:bg-white/5 dark:text-text-primary-dark"
                        >
                          {rule.direction} · {rule.star}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LaBanPage;
