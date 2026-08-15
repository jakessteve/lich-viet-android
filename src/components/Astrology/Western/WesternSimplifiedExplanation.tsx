import React, { useState } from 'react';
import type { SwissNatalChartResult, SwissNatalObject } from '@/services/astrology/swissNatalChart';
import {
  getPlanetInSignInterpretation,
  getSignInterpretation,
  getHouseInterpretation,
  getPlanetInHouseInterpretation,
} from '@/services/astrology/interpretations';

type TabKey = 'big-three' | 'personal' | 'growth-karma' | 'houses';

const TABS: Array<{ id: TabKey; label: string; icon: string; shortLabel: string }> = [
  { id: 'big-three', label: 'Tam Trụ Bản Mệnh', icon: 'auto_awesome', shortLabel: 'Tam Trụ' },
  { id: 'personal', label: 'Tư Duy & Tình Cảm', icon: 'psychology', shortLabel: 'Cá Nhân' },
  { id: 'growth-karma', label: 'Vận Hội & Nghiệp Lực', icon: 'military_tech', shortLabel: 'Nghiệp Lực' },
  { id: 'houses', label: 'Trọng Tâm Cuộc Đời', icon: 'account_balance', shortLabel: 'Lĩnh Vực' },
];

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
    description: 'La Hầu chỉ ra hướng đi giúp bạn thoát khỏi vùng an toàn quá khứ để trưởng thành và khai phá tiềm năng trọn vẹn nhất.',
  },
  'derived:true-south-node': {
    signRole: 'Vùng an toàn và nghiệp quả quá khứ',
    description: 'Kế Đô là tài năng và thói quen bản năng từ quá khứ, nhưng nếu bám chấp vào đó bạn sẽ bị trì trệ.',
  },
  'centaur:chiron': {
    signRole: 'Vết thương tâm hồn & Năng lực chữa lành',
    description: 'Chiron đại diện cho điểm dễ tổn thương nhất nhưng cũng chính là nơi bạn tìm ra sự thấu cảm vĩ đại để chữa lành cho bản thân và người khác.',
  },
  'derived:part-of-fortune': {
    signRole: 'Điểm May Mắn & Tài lộc thịnh vượng',
    description: 'Nơi hội tụ sự hòa hợp giữa Thân (Mọc), Tâm (Trăng) và Trí (Trời), mở ra nguồn năng lượng dồi dào và niềm vui sống đích thực.',
  },
};

export const WesternSimplifiedExplanation: React.FC<{ result: SwissNatalChartResult }> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('big-three');

  const sun = result.objects.find((o) => o.id === 'planet:sun');
  const moon = result.objects.find((o) => o.id === 'planet:moon');
  const mercury = result.objects.find((o) => o.id === 'planet:mercury');
  const venus = result.objects.find((o) => o.id === 'planet:venus');
  const mars = result.objects.find((o) => o.id === 'planet:mars');
  const jupiter = result.objects.find((o) => o.id === 'planet:jupiter');
  const saturn = result.objects.find((o) => o.id === 'planet:saturn');
  const northNode = result.objects.find((o) => o.id === 'lunar-point:true-north-node');
  const southNode = result.objects.find((o) => o.id === 'derived:true-south-node');
  const chiron = result.objects.find((o) => o.id === 'centaur:chiron');
  const fortune = result.objects.find((o) => o.id === 'derived:part-of-fortune');

  const asc = result.angles.Ascendant;
  const mc = result.angles.Midheaven;

  const renderPlanetCard = (
    obj: SwissNatalObject | undefined,
    roleTitle: string,
    colorClass: string,
    bgClass: string,
    icon: string,
    customDesc?: string
  ) => {
    if (!obj) return null;

    const legacyKey = obj.id.replace('planet:', '');
    const signDesc =
      getPlanetInSignInterpretation(legacyKey, obj.signVi) ??
      SIGN_FALLBACKS[obj.signVi] ??
      '';
    const houseMeaning = getHouseInterpretation(obj.house);
    const planetInHouse = getPlanetInHouseInterpretation(legacyKey, obj.house);

    return (
      <div className="surface-card rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bgClass} ${colorClass} text-xl font-bold shadow-inner`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                  {obj.nameVi} ở {obj.signVi}
                </h4>
                {obj.retrograde && (
                  <span className="rounded-md bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    Rx
                  </span>
                )}
                {obj.dignity && obj.dignity.type !== 'peregrine' && (
                  <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${obj.dignity.badgeClass}`}>
                    {obj.dignity.symbol} {obj.dignity.labelVi}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
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
                  <strong className="font-semibold text-text-primary-light dark:text-text-primary-dark">Khí chất:</strong> {signDesc}
                </p>
              )}
              {planetInHouse && (
                <p>
                  <strong className="font-semibold text-text-primary-light dark:text-text-primary-dark">Lĩnh vực phát huy (Nhà {obj.house}):</strong> {planetInHouse}
                </p>
              )}
              {!planetInHouse && houseMeaning && (
                <p>
                  <strong className="font-semibold text-text-primary-light dark:text-text-primary-dark">Trọng tâm Nhà {obj.house}:</strong> {houseMeaning}
                </p>
              )}
            </>
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
    desc: string
  ) => (
    <div className="surface-card rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-2">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bgClass} ${colorClass} text-sm font-bold shadow-inner`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            {title} ở {signVi} ({degree}°{minute.toString().padStart(2, '0')}′)
          </h4>
          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">{roleTitle}</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">{desc}</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in-up" data-western-simplified-explanation>
      {/* Tab Navigation */}
      <div className="flex rounded-xl bg-surface-container p-1 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 min-w-[100px] items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-indigo-600 shadow-sm dark:text-indigo-400 font-bold'
                : 'text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-text-primary-dark'
            }`}
          >
            <span className="material-icons-round text-sm" aria-hidden="true">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content: The Big Three & Angles */}
      {activeTab === 'big-three' && (
        <div className="space-y-3">
          {/* Holistic Core Triad Dynamic Synthesis Card */}
          {sun && moon && asc && (
            <div className="surface-card rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-surface-container-lowest to-purple-500/5 p-4 sm:p-5 dark:border-indigo-500/20 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-border-light/40 pb-2.5 dark:border-border-dark/40">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-lg text-indigo-500">psychology</span>
                  <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    Bức Tranh Tổng Hợp Tam Trụ Bản Mệnh (Core Triad Dynamic)
                  </h4>
                </div>
                <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  Tổng Hợp Cá Nhân Hóa
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                <p>
                  <strong className="font-semibold text-indigo-600 dark:text-indigo-400">Sự hòa hợp Thân - Tâm - Trí:</strong> Ý chí và cái tôi cốt lõi của bạn mang khí chất <span className="font-bold">{sun.signVi}</span> (Nhà {sun.house}), được nuôi dưỡng bởi thế giới cảm xúc tiềm thức <span className="font-bold">{moon.signVi}</span> (Nhà {moon.house}), và thể hiện ra thế giới bên ngoài qua lăng kính phong thái <span className="font-bold">{asc.signVi}</span>.
                </p>

                {(() => {
                  const chartRuler = result.houseRulers?.find((r) => r.houseNumber === 1);
                  if (!chartRuler) return null;
                  return (
                    <div className="rounded-xl bg-surface-container-low/70 p-2.5 border border-border-light/30 dark:border-border-dark/30 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">✦ Chủ Tinh Cung Mọc (Chart Ruler):</span>{' '}
                      <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {chartRuler.traditionalRulerVi} ({chartRuler.traditionalRulerSymbol})
                      </span>
                      {chartRuler.rulerHouse && (
                        <span> tọa thủ tại <strong className="text-text-primary-light dark:text-text-primary-dark">Nhà {chartRuler.rulerHouse}</strong> ({chartRuler.rulerSignVi ?? ''})</span>
                      )}. Đây chính là "kim chỉ nam" dẫn lối cho hành trình phát triển cá nhân và các bước ngoặt lớn trong cuộc đời bạn.
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {renderPlanetCard(
            sun,
            'Cái Tôi, Bản Sắc & Mục Tiêu Cốt Lõi',
            'text-amber-600 dark:text-amber-400',
            'bg-amber-500/10 dark:bg-amber-500/20',
            '☉'
          )}
          {renderPlanetCard(
            moon,
            'Thế Giới Nội Tâm, Cảm Xúc & Nhu Cầu An Toàn',
            'text-slate-600 dark:text-slate-300',
            'bg-slate-500/10 dark:bg-slate-500/20',
            '☽'
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
              `Cung Mọc tại ${asc.signVi} mang lại cho bạn phong thái ${SIGN_FALLBACKS[asc.signVi]?.toLowerCase() ?? 'đặc trưng'} khi tiếp cận thế giới bên ngoài.`
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
            `Thiên Đỉnh tại ${mc.signVi} định hình con đường sự nghiệp và hình ảnh công chúng lý tưởng của bạn: hướng tới sự ${SIGN_FALLBACKS[mc.signVi]?.toLowerCase() ?? 'thành công bền vững'}.`
          )}
        </div>
      )}

      {/* Tab Content: Personal Drivers */}
      {activeTab === 'personal' && (
        <div className="space-y-3">
          {renderPlanetCard(
            mercury,
            'Tư Duy Logic, Giao Tiếp & Tiếp Nhận Thông Tin',
            'text-emerald-600 dark:text-emerald-400',
            'bg-emerald-500/10 dark:bg-emerald-500/20',
            '☿'
          )}
          {renderPlanetCard(
            venus,
            'Ngôn Ngữ Tình Yêu, Thẩm Mỹ & Giá Trị Bản Thân',
            'text-rose-600 dark:text-rose-400',
            'bg-rose-500/10 dark:bg-rose-500/20',
            '♀'
          )}
          {renderPlanetCard(
            mars,
            'Năng Lượng Hành Động, Quyết Đoán & Dũng Khí',
            'text-red-600 dark:text-red-400',
            'bg-red-500/10 dark:bg-red-500/20',
            '♂'
          )}
        </div>
      )}

      {/* Tab Content: Growth & Karma */}
      {activeTab === 'growth-karma' && (
        <div className="space-y-3">
          {renderPlanetCard(
            jupiter,
            'Vận May, Sự Mở Rộng & Phước Lành',
            'text-purple-600 dark:text-purple-400',
            'bg-purple-500/10 dark:bg-purple-500/20',
            '♃'
          )}
          {renderPlanetCard(
            saturn,
            'Thử Thách, Trách Nhiệm & Bài Học Cuộc Đời',
            'text-amber-700 dark:text-amber-500',
            'bg-amber-700/10 dark:bg-amber-700/20',
            '♄'
          )}
          {northNode &&
            renderPlanetCard(
              northNode,
              'La Hầu: Sứ Mệnh Phát Triển Linh Hồn',
              'text-indigo-600 dark:text-indigo-400',
              'bg-indigo-500/10 dark:bg-indigo-500/20',
              '☊',
              `${EXTRA_INTERPRETATIONS['lunar-point:true-north-node'].description} Khi La Hầu ngự tại ${northNode.signVi} (Nhà ${northNode.house}), bạn được thôi thúc phát triển phẩm chất ${SIGN_FALLBACKS[northNode.signVi]?.toLowerCase() ?? ''}.`
            )}
          {southNode &&
            renderPlanetCard(
              southNode,
              'Kế Đô: Nghiệp Quả & Vùng An Toàn Quá Khứ',
              'text-orange-600 dark:text-orange-400',
              'bg-orange-500/10 dark:bg-orange-500/20',
              '☋',
              `${EXTRA_INTERPRETATIONS['derived:true-south-node'].description} Tọa độ Kế Đô ở ${southNode.signVi} (Nhà ${southNode.house}) cho thấy những thói quen cũ cần chuyển hóa để không bị vướng mắc.`
            )}
          {chiron &&
            renderPlanetCard(
              chiron,
              'Chiron: Vết Thương Tâm Hồn & Tự Chữa Lành',
              'text-teal-600 dark:text-teal-400',
              'bg-teal-500/10 dark:bg-teal-500/20',
              '⚷',
              `${EXTRA_INTERPRETATIONS['centaur:chiron'].description} Chiron tại ${chiron.signVi} (Nhà ${chiron.house}) là nơi bạn học cách vượt qua sự tự ti để trở thành nguồn cảm hứng chữa lành.`
            )}
          {fortune &&
            renderPlanetCard(
              fortune,
              'Điểm May Mắn (Part of Fortune): Dòng Chảy Tài Lộc',
              'text-yellow-600 dark:text-yellow-400',
              'bg-yellow-500/10 dark:bg-yellow-500/20',
              '⊗',
              `${EXTRA_INTERPRETATIONS['derived:part-of-fortune'].description} Tọa độ tại ${fortune.signVi} (Nhà ${fortune.house}) mang lại cơ hội tài lộc và sự thịnh vượng khi bạn sống đúng với giá trị của mình.`
            )}
        </div>
      )}

      {/* Tab Content: Dominant Houses */}
      {activeTab === 'houses' && (
        <div className="space-y-3">
          <div className="surface-card rounded-2xl border border-border-light/60 p-4 sm:p-5 dark:border-border-dark/60 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
              <span className="material-icons-round text-base text-indigo-500">pie_chart</span>
              Phân Bổ Hành Tinh Trong 12 Nhà
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {result.houses.map((h) => {
                const planetsInHouse = result.objects.filter((o) => o.house === h.number && o.category === 'planet');
                const ruler = result.houseRulers?.find((r) => r.houseNumber === h.number);
                return (
                  <div
                    key={h.number}
                    className={`rounded-xl border p-3 flex flex-col justify-between ${
                      planetsInHouse.length >= 2
                        ? 'border-indigo-500/40 bg-indigo-500/5 dark:border-indigo-500/30'
                        : 'border-border-light/40 bg-surface-container-lowest/50 dark:border-border-dark/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                          Nhà {h.number} · {h.signVi}
                        </span>
                        {planetsInHouse.length >= 2 && (
                          <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                            Trọng tâm ({planetsInHouse.length})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
                        {getHouseInterpretation(h.number)}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border-light/30 dark:border-border-dark/30 text-[10px] text-text-secondary-light dark:text-text-secondary-dark space-y-1">
                      {ruler && (
                        <div>
                          Chủ tinh: <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{ruler.traditionalRulerVi} {ruler.traditionalRulerSymbol}</span>
                          {ruler.rulerHouse && <span> (ở Nhà {ruler.rulerHouse})</span>}
                        </div>
                      )}
                      {planetsInHouse.length > 0 && (
                        <div className="flex items-center gap-1 font-medium text-text-primary-light dark:text-text-primary-dark">
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
