import React, { useState, useMemo } from 'react';
import type { SwissNatalChartResult, SwissNatalObject, SwissNatalAspect } from '@/services/astrology/swissNatalChart';
import { synthesizeWesternNatalChart } from '@/services/astrology/westernSynthesisEngine';
import {
  getPlanetInSignInterpretation,
  getSignInterpretation,
  getHouseInterpretation,
  getPlanetInHouseInterpretation,
} from '@/services/astrology/interpretations';

type TabKey = 'big-three' | 'personal' | 'growth-karma' | 'houses';

export interface WesternSimplifiedExplanationProps {
  result: SwissNatalChartResult;
  mode?: 'simple' | 'advanced';
}

const TABS: Array<{ id: TabKey; label: string; shortLabel: string }> = [
  { id: 'big-three', label: 'Tam Trụ Bản Mệnh', shortLabel: 'Tam Trụ' },
  { id: 'personal', label: 'Tư Duy & Tình Cảm', shortLabel: 'Cá Nhân' },
  { id: 'growth-karma', label: 'Vận Hội & Nghiệp Lực', shortLabel: 'Nghiệp Lực' },
  { id: 'houses', label: 'Trọng Tâm Cuộc Đời', shortLabel: 'Lĩnh Vực' },
];

const ASPECT_META: Record<string, { labelVi: string; symbol: string }> = {
  conjunction: { labelVi: 'Trùng tụ', symbol: '☌' },
  opposition: { labelVi: 'Đối đỉnh', symbol: '☍' },
  trine: { labelVi: 'Tam hợp', symbol: '△' },
  square: { labelVi: 'Vuông góc', symbol: '□' },
  sextile: { labelVi: 'Lục hợp', symbol: '⚹' },
  quincunx: { labelVi: 'Bất điều hòa', symbol: '⚻' },
  'semi-sextile': { labelVi: 'Bán lục hợp', symbol: '⚺' },
  'semi-square': { labelVi: 'Bán vuông', symbol: '∠' },
  sesquiquadrate: { labelVi: 'Một góc rưỡi', symbol: '⚼' },
  quintile: { labelVi: 'Ngũ hợp', symbol: 'Q' },
  'bi-quintile': { labelVi: 'Song ngũ hợp', symbol: 'bQ' },
};

const SIGN_FALLBACKS: Record<string, string> = {
  'Bạch Dương': 'Năng động, tiên phong, dũng cảm và quyết đoán.',
  'Kim Ngưu': 'Kiên định, thực tế, bền bỉ và yêu thích sự ổn định.',
  'Song Tử': 'Linh hoạt, thông minh, tò mò và tài giao tiếp.',
  'Cự Giải': 'Nhạy cảm, giàu tình cảm, bao bọc và trực giác cao.',
  'Sư Tử': 'Tự tin, hào phóng, có tố chất lãnh đạo và tỏa sáng.',
  'Xử Nữ': 'Cẩn trọng, chu đáo, tư duy phân tích và cầu toàn.',
  'Thiên Bình': 'Hòa nhã, duyên dáng, công bằng và yêu cái đẹp.',
  'Bọ Cạp': 'Sâu sắc, mãnh liệt, quyết tâm và khả năng chuyển hóa lớn.',
  'Nhân Mã': 'Lạc quan, ưa tự do, triết lý và thích khám phá.',
  'Ma Kết': 'Kỷ luật, tham vọng, trách nhiệm và kiên nhẫn.',
  'Bảo Bình': 'Độc đáo, đổi mới, tư duy cấp tiến và hướng về cộng đồng.',
  'Song Ngư': 'Trực giác, giàu lòng trắc ẩn, nghệ thuật và thấu cảm.',
};

const EXTRA_INTERPRETATIONS: Record<string, Record<string, string>> = {
  'lunar-point:true-north-node': {
    signRole: 'Bài học phát triển linh hồn kiếp này',
    description:
      'La Hầu chỉ ra hướng đi giúp bạn thoát khỏi vùng an toàn quá khứ để trưởng thành và khai phá tiềm năng trọn vẹn nhất.',
  },
  'derived:true-south-node': {
    signRole: 'Vùng an toàn và nghiệp quả quá khứ',
    description: 'Kế Đô là tài năng và thói quen bản năng từ quá khứ, nhưng nếu bám chấp vào đó bạn sẽ bị trì trệ.',
  },
  'centaur:chiron': {
    signRole: 'Vết thương tâm hồn & Năng lực chữa lành',
    description:
      'Chiron đại diện cho điểm dễ tổn thương nhất nhưng cũng chính là nơi bạn tìm ra sự thấu cảm vĩ đại để chữa lành cho bản thân và người khác.',
  },
  'derived:part-of-fortune': {
    signRole: 'Điểm May Mắn & Tài lộc thịnh vượng',
    description:
      'Nơi hội tụ sự hòa hợp giữa Thân (Mọc), Tâm (Trăng) và Trí (Trời), mở ra nguồn năng lượng dồi dào và niềm vui sống đích thực.',
  },
  'planet:uranus': {
    signRole: 'Sức mạnh đột phá, thức tỉnh & cách mạng cá nhân',
    description:
      'Thiên Vương tinh kích hoạt tư duy cấp tiến, phá vỡ khuôn mẫu cũ và mang đến những đột phá mang tính cách mạng.',
  },
  'planet:neptune': {
    signRole: 'Trực giác tâm linh, cảm thụ nghệ thuật & lòng trắc ẩn vô điều kiện',
    description:
      'Hải Vương tinh kết nối bạn với chiều sâu vô thức, khát vọng lý tưởng hóa và khả năng thấu cảm siêu hình.',
  },
  'planet:pluto': {
    signRole: 'Quyền năng chuyển hóa, tái sinh & nội lực sâu thẳm',
    description:
      'Diêm Vương tinh đại diện cho sức mạnh lột xác, đối diện bóng tối nội tâm để tái sinh mạnh mẽ hơn từ tro tàn.',
  },
};

export const WesternSimplifiedExplanation: React.FC<WesternSimplifiedExplanationProps> = ({
  result,
  mode = 'simple',
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('big-three');
  const synthesized = useMemo(() => synthesizeWesternNatalChart(result), [result]);

  const sun = result.objects.find((o) => o.id === 'planet:sun');
  const moon = result.objects.find((o) => o.id === 'planet:moon');
  const mercury = result.objects.find((o) => o.id === 'planet:mercury');
  const venus = result.objects.find((o) => o.id === 'planet:venus');
  const mars = result.objects.find((o) => o.id === 'planet:mars');
  const jupiter = result.objects.find((o) => o.id === 'planet:jupiter');
  const saturn = result.objects.find((o) => o.id === 'planet:saturn');
  const uranus = result.objects.find((o) => o.id === 'planet:uranus');
  const neptune = result.objects.find((o) => o.id === 'planet:neptune');
  const pluto = result.objects.find((o) => o.id === 'planet:pluto');
  const northNode = result.objects.find((o) => o.id === 'lunar-point:true-north-node');
  const southNode = result.objects.find((o) => o.id === 'derived:true-south-node');
  const chiron = result.objects.find((o) => o.id === 'centaur:chiron');
  const fortune = result.objects.find((o) => o.id === 'derived:part-of-fortune');

  const asc = result.angles.Ascendant;
  const mc = result.angles.Midheaven;

  // Helper: Find all aspects connected to an object
  const getObjectAspects = (objectId: string): SwissNatalAspect[] => {
    if (!result?.aspects || !Array.isArray(result.aspects)) return [];
    return result.aspects
      .filter((a) => a?.objectAId === objectId || a?.objectBId === objectId)
      .sort((a, b) => (a.orbDifference ?? 0) - (b.orbDifference ?? 0));
  };

  // Helper: Find which houses a planet rules in this natal chart
  const getRuledHouses = (objectId: string): number[] => {
    if (!result.houseRulers) return [];
    return result.houseRulers.filter((hr) => hr.traditionalRulerId === objectId).map((hr) => hr.houseNumber);
  };

  // Render planet card with simple vs advanced depth
  const renderPlanetCard = (
    obj: SwissNatalObject | undefined,
    roleTitle: string,
    colorClass: string,
    bgClass: string,
    icon: string,
    customDesc?: string,
  ) => {
    if (!obj) return null;

    const legacyKey = obj.id.replace('planet:', '');
    const signDesc = getPlanetInSignInterpretation(legacyKey, obj.signVi) ?? SIGN_FALLBACKS[obj.signVi] ?? '';
    const planetInHouse = getPlanetInHouseInterpretation(legacyKey, obj.house);
    const aspects = getObjectAspects(obj.id);
    const ruledHouses = getRuledHouses(obj.id);
    const objSynth = synthesized.objectSyntheses[obj.id];

    return (
      <div className="surface-card rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center text-center leading-none select-none rounded-2xl ${bgClass} ${colorClass} text-xl font-bold shadow-inner`}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                  {obj.nameVi} ở {obj.signVi}
                </h4>
                {obj.retrograde && (
                  <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                    Rx (Nghịch hành)
                  </span>
                )}
                {mode === 'advanced' && obj.dignity && obj.dignity.type !== 'peregrine' && (
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 leading-none ${obj.dignity.badgeClass}`}>
                    <span className="shrink-0">{obj.dignity.symbol}</span>
                    <span>{obj.dignity.labelVi}</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-astral-primary dark:text-astral-primary-dark mt-0.5">
                {roleTitle} · Tọa độ Nhà {obj.house} ({obj.degree}°{obj.minute.toString().padStart(2, '0')}′)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
          {customDesc ? (
            <p>{customDesc}</p>
          ) : (
            <>
              {signDesc && (
                <p>
                  <strong className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Khí chất:
                  </strong>{' '}
                  {signDesc}
                </p>
              )}
              {planetInHouse && (
                <p>
                  <strong className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Địa hạt:
                  </strong>{' '}
                  {planetInHouse}
                </p>
              )}
              {mode === 'advanced' && objSynth?.dignitySummaryVi && (
                <p className="text-[11px] text-astral-primary dark:text-astral-primary-dark font-medium">
                  ✦ {objSynth.dignitySummaryVi}
                </p>
              )}
            </>
          )}

          {mode === 'advanced' && (
            <div className="mt-3 pt-3 border-t border-border-light/40 dark:border-border-dark/40 space-y-2">
              {ruledHouses.length > 0 && (
                <div className="rounded-lg bg-surface-container-low/60 p-2 border border-border-light/30 dark:border-border-dark/30 text-xs">
                  <span className="font-bold text-astral-primary dark:text-astral-primary-dark">
                    ✦ Cai Quản Cung Địa Bàn:
                  </span>{' '}
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    Làm chủ Nhà {ruledHouses.join(' & Nhà ')}.
                  </span>{' '}
                  <span>
                    Dòng chảy năng lượng từ các nhà này được hướng tâm và điều phối trực tiếp tại vị trí Nhà {obj.house}
                    .
                  </span>
                </div>
              )}

              {aspects.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-micro font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Các Góc Chiếu Nổi Bật ({aspects.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aspects.slice(0, 5).map((asp, idx) => {
                      const otherName = asp.objectAId === obj.id ? asp.objectBName : asp.objectAName;
                      const meta = ASPECT_META[asp.name.toLowerCase()] ?? { labelVi: asp.name, symbol: '•' };
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1 text-[11px] font-medium border border-border-light/40 dark:border-border-dark/40 leading-none shrink-0"
                          title={`${meta.labelVi} với ${otherName} (Sai số ${(asp.orbDifference ?? 0).toFixed(1)}°)`}
                        >
                          <span className="text-astral-primary dark:text-astral-primary-dark font-bold shrink-0">
                            {meta.symbol}
                          </span>
                          <span className="shrink-0">
                            {meta.labelVi} {otherName}
                          </span>
                          <span className="text-text-secondary-light/80 dark:text-text-secondary-dark/80 text-[10px] shrink-0">
                            ({(asp.orbDifference ?? 0).toFixed(1)}°)
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAngleCard = (
    title: string,
    signVi: string,
    degree: number,
    minute: number,
    roleTitle: string,
    colorClass: string,
    bgClass: string,
    icon: string,
    desc: string,
    advancedDetails?: React.ReactNode,
  ) => (
    <div className="surface-card rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3.5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center text-center leading-none select-none rounded-2xl ${bgClass} ${colorClass} text-sm font-bold shadow-inner`}
        >
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            {title} ở {signVi} ({degree}°{minute.toString().padStart(2, '0')}′)
          </h4>
          <p className="text-xs font-medium text-astral-primary dark:text-astral-primary-dark">{roleTitle}</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">{desc}</p>
      {mode === 'advanced' && advancedDetails}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Subtabs with generous gap and clean styling */}
      <div className="flex gap-1.5 sm:gap-2 rounded-2xl bg-surface-container-lowest p-1.5 border border-border-light/40 dark:border-border-dark/40">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-astral-primary shadow-sm dark:text-astral-primary-dark font-bold ring-1 ring-astral-primary/30'
                : 'text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-text-primary-dark'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content: The Big Three & Angles */}
      {activeTab === 'big-three' && (
        <div className="space-y-4 sm:space-y-5">
          {sun && moon && asc && (
            <div className="astral-card p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b border-border-light/40 pb-2.5 dark:border-border-dark/40">
                <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                  Bức Tranh Tổng Hợp Tam Trụ Bản Mệnh (Core Triad Dynamic)
                </h4>
                <span className="badge-astral">{synthesized.sect.isDiurnal ? '☀️ Ban Ngày' : '🌙 Ban Đêm'}</span>
              </div>

              {/* Sect & Moon Phase Highlights */}
              <div className="p-2.5 rounded-xl bg-surface-container-low/80 border border-border-light/30 dark:border-border-dark/30 text-xs space-y-1">
                <p className="text-text-primary-light dark:text-text-primary-dark">
                  <strong className="text-astral-primary dark:text-astral-primary-dark font-semibold">
                    ✦ Cấu Trúc Khí Vận:
                  </strong>{' '}
                  {synthesized.sect.descriptionVi}
                </p>
                {synthesized.moonPhaseReadingVi && (
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    <strong className="text-astral-primary dark:text-astral-primary-dark font-semibold">
                      ✦ Pha Mặt Trăng:
                    </strong>{' '}
                    {synthesized.moonPhaseReadingVi}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                <p>
                  <strong className="font-semibold text-astral-primary dark:text-astral-primary-dark">
                    Sự hòa hợp Thân - Tâm - Trí:
                  </strong>{' '}
                  Ý chí và cái tôi cốt lõi mang khí chất <span className="font-bold">{sun.signVi}</span> (Nhà{' '}
                  {sun.house}), được nuôi dưỡng bởi thế giới cảm xúc tiềm thức{' '}
                  <span className="font-bold">{moon.signVi}</span> (Nhà {moon.house}), và thể hiện ra thế giới bên ngoài
                  qua lăng kính phong thái <span className="font-bold">{asc.signVi}</span>.
                </p>

                {(() => {
                  const chartRuler = result.houseRulers?.find((r) => r.houseNumber === 1);
                  if (!chartRuler) return null;
                  return (
                    <div className="rounded-xl bg-surface-container-low/70 p-2.5 border border-border-light/30 dark:border-border-dark/30 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      <span className="font-bold text-astral-primary dark:text-astral-primary-dark">
                        ✦ Chủ Tinh Cung Mọc (Chart Ruler):
                      </span>{' '}
                      <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {chartRuler.traditionalRulerVi} ({chartRuler.traditionalRulerSymbol})
                      </span>
                      {chartRuler.rulerHouse && (
                        <span>
                          {' '}
                          tọa thủ tại{' '}
                          <strong className="text-text-primary-light dark:text-text-primary-dark">
                            Nhà {chartRuler.rulerHouse}
                          </strong>{' '}
                          ({chartRuler.rulerSignVi ?? ''})
                        </span>
                      )}
                      . Đây là kim chỉ nam dẫn lối cho hành trình phát triển cá nhân và các bước ngoặt lớn trong cuộc
                      đời bạn.
                    </div>
                  );
                })()}

                {/* ADVANCED SOLILUNAR ASPECT BLEND */}
                {mode === 'advanced' &&
                  (() => {
                    const sunMoonAspect = result?.aspects?.find(
                      (a) =>
                        (a?.objectAId === 'planet:sun' && a?.objectBId === 'planet:moon') ||
                        (a?.objectAId === 'planet:moon' && a?.objectBId === 'planet:sun'),
                    );
                    if (!sunMoonAspect) return null;
                    const aspectKey = sunMoonAspect.name.toLowerCase();
                    const meta = ASPECT_META[aspectKey] ?? { labelVi: sunMoonAspect.name, symbol: '•' };
                    return (
                      <div className="rounded-xl bg-amber-500/5 p-2.5 border border-amber-500/20 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="font-bold text-amber-800 dark:text-amber-300">
                          ✦ Tương Tác Nhật - Nguyệt ({meta.labelVi}):
                        </span>{' '}
                        {aspectKey === 'conjunction' &&
                          'Tâm trí và ý chí đồng nhất mạnh mẽ (Thời điểm Trăng Mới), định hướng rõ ràng nhưng đôi khi quá chủ quan.'}
                        {aspectKey === 'opposition' &&
                          'Thế đối cực Trăng Tròn: Khát vọng ý thức và nhu cầu cảm xúc luôn cần sự thỏa hiệp và cân bằng hài hòa.'}
                        {(aspectKey === 'trine' || aspectKey === 'sextile') &&
                          'Dòng chảy thuận hòa tự nhiên giữa mong muốn bên ngoài và sự bình an nội tâm.'}
                        {aspectKey === 'square' &&
                          'Sự căng thẳng tích cực: Nội tâm giằng xé giữa bổn phận và khao khát cá nhân, tạo ra động lực bứt phá vĩ đại.'}
                        <span className="text-text-secondary-light/70 text-[10px] ml-1">
                          (Sai số: {(sunMoonAspect.orbDifference ?? 0).toFixed(1)}°)
                        </span>
                      </div>
                    );
                  })()}

                {/* Actionable Guidance Wrap */}
                <div className="rounded-xl bg-astral-primary/10 p-2.5 border border-astral-primary/20 text-xs text-astral-primary dark:text-astral-primary-dark font-medium">
                  <span className="font-bold">✦ Kim Chỉ Nam Tổng Quát: </span>
                  {synthesized.actionableGuidanceVi}
                </div>
              </div>
            </div>
          )}

          {renderPlanetCard(
            sun,
            'Cái Tôi, Bản Sắc & Mục Tiêu Cốt Lõi',
            'text-amber-800 dark:text-amber-300',
            'bg-amber-500/10 dark:bg-amber-500/20',
            '☉',
          )}
          {renderPlanetCard(
            moon,
            'Thế Giới Nội Tâm, Cảm Xúc & Nhu Cầu An Toàn',
            'text-slate-600 dark:text-slate-300',
            'bg-slate-500/10 dark:bg-slate-500/20',
            '☽',
          )}
          {renderAngleCard(
            'Cung Mọc (Ascendant / Rising)',
            asc.signVi,
            asc.degree,
            asc.minute,
            'Ngoại Hình, Phong Thái & Ấn Tượng Ban Đầu',
            'text-emerald-600 dark:text-emerald-400',
            'bg-emerald-500/10 dark:bg-emerald-500/20',
            'ASC',
            getSignInterpretation(asc.signVi) ??
              `Cung Mọc tại ${asc.signVi} mang lại cho bạn phong thái ${SIGN_FALLBACKS[asc.signVi]?.toLowerCase() ?? 'đặc trưng'} khi tiếp cận thế giới bên ngoài.`,
            mode === 'advanced' && (
              <div className="mt-2 pt-2 border-t border-border-light/30 dark:border-border-dark/30 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                <strong className="text-text-primary-light dark:text-text-primary-dark">Trục Đối Cực AC-DC:</strong>{' '}
                Cung Mọc {asc.signVi} đối xứng với Cung Lặn (Descendant) tại{' '}
                {result.angles.Descendant?.signVi ?? 'Cung Đối'}. Trong khi bạn khẳng định cá tính độc lập qua{' '}
                {asc.signVi}, bạn bị thu hút và tìm kiếm sự bổ trợ từ đối tác mang tính chất{' '}
                {result.angles.Descendant?.signVi ?? 'đối diện'}.
              </div>
            ),
          )}
          {renderAngleCard(
            'Thiên Đỉnh (Midheaven / MC)',
            mc.signVi,
            mc.degree,
            mc.minute,
            'Đỉnh Cao Sự Nghiệp, Danh Tiếng & Sứ Mệnh Xã Hội',
            'text-sky-600 dark:text-sky-400',
            'bg-sky-500/10 dark:bg-sky-500/20',
            'MC',
            `Thiên Đỉnh tại ${mc.signVi} định hình con đường sự nghiệp và hình ảnh công chúng lý tưởng của bạn: hướng tới sự ${SIGN_FALLBACKS[mc.signVi]?.toLowerCase() ?? 'thành công bền vững'}.`,
            mode === 'advanced' && (
              <div className="mt-2 pt-2 border-t border-border-light/30 dark:border-border-dark/30 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                <strong className="text-text-primary-light dark:text-text-primary-dark">
                  Trục MC-IC (Sự Nghiệp & Nguồn Cội):
                </strong>{' '}
                Thiên Đỉnh {mc.signVi} phản ánh đỉnh cao công danh bên ngoài, trong khi Thiên Đế (IC) tại{' '}
                {result.angles['Imum Coeli']?.signVi ?? 'đối diện'} phản ánh nền tảng gia đình và điểm tựa gốc rễ tâm lý
                để bạn vươn mình ra thế giới.
              </div>
            ),
          )}
        </div>
      )}

      {/* Tab Content: Personal Drivers */}
      {activeTab === 'personal' && (
        <div className="space-y-4 sm:space-y-5">
          {renderPlanetCard(
            mercury,
            'Tư Duy Logic, Giao Tiếp & Tiếp Nhận Thông Tin',
            'text-emerald-600 dark:text-emerald-400',
            'bg-emerald-500/10 dark:bg-emerald-500/20',
            '☿',
          )}
          {renderPlanetCard(
            venus,
            'Ngôn Ngữ Tình Yêu, Thẩm Mỹ & Giá Trị Bản Thân',
            'text-rose-600 dark:text-rose-400',
            'bg-rose-500/10 dark:bg-rose-500/20',
            '♀',
          )}
          {renderPlanetCard(
            mars,
            'Năng Lượng Hành Động, Quyết Đoán & Dũng Khí',
            'text-red-600 dark:text-red-400',
            'bg-red-500/10 dark:bg-red-500/20',
            '♂',
          )}
        </div>
      )}

      {/* Tab Content: Growth & Karma */}
      {activeTab === 'growth-karma' && (
        <div className="space-y-4 sm:space-y-5">
          {renderPlanetCard(
            jupiter,
            'Vận May, Sự Mở Rộng & Phước Lành',
            'text-purple-600 dark:text-purple-400',
            'bg-purple-500/10 dark:bg-purple-500/20',
            '♃',
          )}
          {renderPlanetCard(
            saturn,
            'Thử Thách, Trách Nhiệm & Bài Học Cuộc Đời',
            'text-amber-700 dark:text-amber-500',
            'bg-amber-700/10 dark:bg-amber-700/20',
            '♄',
          )}

          {/* ADVANCED MODE OUTER PLANETS */}
          {mode === 'advanced' && (
            <>
              {uranus &&
                renderPlanetCard(
                  uranus,
                  'Thiên Vương Tinh: Đột Phá & Thức Tỉnh Tư Duy',
                  'text-cyan-600 dark:text-cyan-400',
                  'bg-cyan-500/10 dark:bg-cyan-500/20',
                  '♅',
                  `${EXTRA_INTERPRETATIONS['planet:uranus'].description} Tại ${uranus.signVi} (Nhà ${uranus.house}), bạn có nhu cầu mãnh liệt về sự tự do cá nhân và đổi mới cách tiếp cận truyền thống.`,
                )}
              {neptune &&
                renderPlanetCard(
                  neptune,
                  'Hải Vương Tinh: Trực Giác & Lý Tưởng Hóa',
                  'text-blue-600 dark:text-blue-400',
                  'bg-blue-500/10 dark:bg-blue-500/20',
                  '♆',
                  `${EXTRA_INTERPRETATIONS['planet:neptune'].description} Tại ${neptune.signVi} (Nhà ${neptune.house}), mang lại năng lực cảm thụ nghệ thuật phong phú nhưng cần giữ sự tỉnh táo trước ảo vọng.`,
                )}
              {pluto &&
                renderPlanetCard(
                  pluto,
                  'Diêm Vương Tinh: Quyền Lực & Chuyển Hóa Tái Sinh',
                  'text-purple-900 dark:text-purple-300',
                  'bg-purple-900/10 dark:bg-purple-900/20',
                  '♇',
                  `${EXTRA_INTERPRETATIONS['planet:pluto'].description} Tọa độ tại ${pluto.signVi} (Nhà ${pluto.house}) chỉ ra địa hạt bạn sẽ trải qua những cuộc cách mạng nội tâm sâu sắc nhất.`,
                )}
            </>
          )}

          {northNode &&
            renderPlanetCard(
              northNode,
              'La Hầu: Sứ Mệnh Phát Triển Linh Hồn',
              'text-indigo-600 dark:text-indigo-400',
              'bg-indigo-500/10 dark:bg-indigo-500/20',
              '☊',
              `${EXTRA_INTERPRETATIONS['lunar-point:true-north-node'].description} Khi La Hầu ngự tại ${northNode.signVi} (Nhà ${northNode.house}), bạn được thôi thúc phát triển phẩm chất ${SIGN_FALLBACKS[northNode.signVi]?.toLowerCase() ?? ''}.`,
            )}
          {southNode &&
            renderPlanetCard(
              southNode,
              'Kế Đô: Nghiệp Quả & Vùng An Toàn Quá Khứ',
              'text-orange-600 dark:text-orange-400',
              'bg-orange-500/10 dark:bg-orange-500/20',
              '☋',
              `${EXTRA_INTERPRETATIONS['derived:true-south-node'].description} Tọa độ Kế Đô ở ${southNode.signVi} (Nhà ${southNode.house}) cho thấy những thói quen cũ cần chuyển hóa để không bị vướng mắc.`,
            )}
          {chiron &&
            renderPlanetCard(
              chiron,
              'Chiron: Vết Thương Tâm Hồn & Tự Chữa Lành',
              'text-teal-600 dark:text-teal-400',
              'bg-teal-500/10 dark:bg-teal-500/20',
              '⚷',
              `${EXTRA_INTERPRETATIONS['centaur:chiron'].description} Chiron tại ${chiron.signVi} (Nhà ${chiron.house}) là nơi bạn học cách vượt qua sự tự ti để trở thành nguồn cảm hứng chữa lành.`,
            )}
          {fortune &&
            renderPlanetCard(
              fortune,
              'Điểm May Mắn (Part of Fortune): Dòng Chảy Tài Lộc',
              'text-yellow-600 dark:text-yellow-400',
              'bg-yellow-500/10 dark:bg-yellow-500/20',
              '⊗',
              `${EXTRA_INTERPRETATIONS['derived:part-of-fortune'].description} Tọa độ tại ${fortune.signVi} (Nhà ${fortune.house}) mang lại cơ hội tài lộc và sự thịnh vượng khi bạn sống đúng với giá trị của mình.`,
            )}
        </div>
      )}

      {/* Tab Content: Dominant Houses */}
      {activeTab === 'houses' && (
        <div className="space-y-4">
          <div className="surface-card rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                Phân Bổ Hành Tinh Trong 12 Cung Địa Bàn
              </h4>
              {mode === 'advanced' && <span className="badge-astral">Phân Tích Cấu Trúc Nhà</span>}
            </div>

            {mode === 'advanced' && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs pb-1">
                <div className="rounded-xl bg-surface-container-low p-2 border border-border-light/40 dark:border-border-dark/40">
                  <strong className="block text-astral-primary dark:text-astral-primary-dark text-xs">
                    Cung Góc (1, 4, 7, 10)
                  </strong>
                  <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                    Hành động & Khởi phát
                  </span>
                </div>
                <div className="rounded-xl bg-surface-container-low p-2 border border-border-light/40 dark:border-border-dark/40">
                  <strong className="block text-emerald-600 dark:text-emerald-400 text-xs">
                    Tiếp Nối (2, 5, 8, 11)
                  </strong>
                  <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                    Tài nguyên & Ổn định
                  </span>
                </div>
                <div className="rounded-xl bg-surface-container-low p-2 border border-border-light/40 dark:border-border-dark/40">
                  <strong className="block text-amber-800 dark:text-amber-300 text-xs">Biến Đổi (3, 6, 9, 12)</strong>
                  <span className="text-micro text-text-secondary-light dark:text-text-secondary-dark">
                    Học hỏi & Thích nghi
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {result.houses.map((h) => {
                const planetsInHouse = result.objects.filter((o) => o.house === h.number && o.category === 'planet');
                const ruler = result.houseRulers?.find((r) => r.houseNumber === h.number);
                const isStellium = planetsInHouse.length >= 3;
                const isFocused = planetsInHouse.length === 2;

                return (
                  <div
                    key={h.number}
                    className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                      isStellium
                        ? 'border-amber-500/50 bg-amber-500/5 dark:border-amber-500/40 shadow-sm'
                        : isFocused
                          ? 'border-astral-border-light bg-astral-surface-light/40 dark:border-astral-border-dark dark:bg-astral-surface-dark/30'
                          : 'border-border-light/40 bg-surface-container-lowest/50 dark:border-border-dark/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs sm:text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                          Nhà {h.number} · {h.signVi}
                          {mode === 'advanced' && (
                            <span className="ml-1 text-[10px] font-normal text-text-secondary-light dark:text-text-secondary-dark">
                              ({h.degree}°{h.minute.toString().padStart(2, '0')}′)
                            </span>
                          )}
                        </span>
                        {isStellium ? (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-micro font-bold text-amber-800 dark:text-amber-300">
                            Stellium ({planetsInHouse.length})
                          </span>
                        ) : isFocused ? (
                          <span className="badge-astral">Trọng tâm ({planetsInHouse.length})</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        {getHouseInterpretation(h.number)}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border-light/30 dark:border-border-dark/30 text-micro text-text-secondary-light dark:text-text-secondary-dark space-y-1">
                      {ruler && (
                        <div>
                          Chủ tinh:{' '}
                          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                            {ruler.traditionalRulerVi} {ruler.traditionalRulerSymbol}
                          </span>
                          {ruler.rulerHouse && (
                            <span>
                              {' '}
                              (tọa thủ Nhà {ruler.rulerHouse}
                              {ruler.rulerSignVi ? ` - ${ruler.rulerSignVi}` : ''})
                            </span>
                          )}
                        </div>
                      )}
                      {planetsInHouse.length > 0 && (
                        <div className="flex items-center gap-1 font-medium text-text-primary-light dark:text-text-primary-dark flex-wrap">
                          Hành tinh: {planetsInHouse.map((p) => `${p.symbol} ${p.nameVi}`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WesternSimplifiedExplanation;
