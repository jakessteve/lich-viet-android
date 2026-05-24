// ── TheoryCard.tsx ────────────────────────────────────────────
// A comprehensive academic analysis card that provides:
// 1. Full hexagram theory (Tượng + Ý nghĩa)
// 2. Per-hào analysis for all 6 lines
// 3. Academic impact assessment for the user's query topic

import React, { useState } from 'react';
import type {
  Hexagram,
  Trigram,
  HaoDetail,
  DivinationContext,
  DivineReadingSummary,
  HexagramCategoryPredictions,
  HaoText,
} from '../../types/maiHoa';

// ── Types ──────────────────────────────────────────────────────

interface TheoryCardProps {
  readonly mainHexagram: Hexagram;
  readonly mutualHexagram: Hexagram;
  readonly changedHexagram: Hexagram;
  readonly movingLine: number;
  readonly mainHaoDetails?: readonly HaoDetail[];
  readonly mutualHaoDetails?: readonly HaoDetail[];
  readonly changedHaoDetails?: readonly HaoDetail[];
  readonly trigramDataMap: ReadonlyMap<number, Trigram>;
  readonly context?: DivinationContext;
  readonly summary: DivineReadingSummary;
  readonly theLabel: string;
  readonly dungLabel: string;
}

// ── Constants ──────────────────────────────────────────────────

const HAO_POSITION_NAMES: Readonly<Record<number, string>> = {
  1: 'Sơ (Hào 1)',
  2: 'Nhị (Hào 2)',
  3: 'Tam (Hào 3)',
  4: 'Tứ (Hào 4)',
  5: 'Ngũ (Hào 5)',
  6: 'Thượng (Hào 6)',
};

const LUC_THAN_MEANINGS: Readonly<Record<string, string>> = {
  'HUYNH ĐỆ': 'Anh em, đồng liêu — cạnh tranh, hao tốn, hoặc bạn bè giúp đỡ.',
  'PHỤ MẪU': 'Cha mẹ, văn thư — giấy tờ, hợp đồng, học vấn, bảo hộ.',
  'THÊ TÀI': 'Vợ, tiền tài — tài lộc, vợ/chồng, lợi nhuận kinh doanh.',
  'QUAN QUỶ': 'Quan chức, bệnh tật — công danh, cấp trên, bệnh tật, kiện tụng.',
  'TỬ TÔN': 'Con cháu, phúc đức — phúc lộc, vui vẻ, khắc chế quan chức.',
};

const THE_UNG_MEANINGS = {
  the: 'Thế — đại diện bản thân, chủ thể trong sự việc.',
  ung: 'Ứng — đại diện ngoại cảnh, người khác, khách thể.',
};

const CATEGORY_LABELS: readonly {
  readonly key: keyof HexagramCategoryPredictions;
  readonly label: string;
  readonly icon: string;
}[] = [
  { key: 'theVan', label: 'Thế vận', icon: 'trending_up' },
  { key: 'hyVong', label: 'Hy vọng', icon: 'lightbulb' },
  { key: 'taiLoc', label: 'Tài lộc', icon: 'payments' },
  { key: 'suNghiep', label: 'Sự nghiệp', icon: 'work' },
  { key: 'nhamChuc', label: 'Nhậm chức', icon: 'military_tech' },
  { key: 'ngheNghiep', label: 'Nghề nghiệp', icon: 'engineering' },
  { key: 'tinhYeu', label: 'Tình yêu', icon: 'favorite' },
  { key: 'honNhan', label: 'Hôn nhân', icon: 'diversity_1' },
  { key: 'doiNguoi', label: 'Đợi người', icon: 'schedule' },
  { key: 'diXa', label: 'Đi xa', icon: 'flight' },
  { key: 'phapLy', label: 'Pháp lý', icon: 'gavel' },
  { key: 'suViec', label: 'Sự việc', icon: 'event_note' },
  { key: 'benhTat', label: 'Bệnh tật', icon: 'health_and_safety' },
  { key: 'thiCu', label: 'Thi cử', icon: 'school' },
  { key: 'matCua', label: 'Mất của', icon: 'search' },
  { key: 'nguoiRaDi', label: 'Người ra đi', icon: 'directions_walk' },
];

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  accentClass = 'text-blue-600 dark:text-blue-400',
  children,
}: {
  readonly title: string;
  readonly icon: string;
  readonly defaultOpen?: boolean;
  readonly accentClass?: string;
  readonly children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-light/50 dark:border-border-dark/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition-colors cursor-pointer"
      >
        <span className={`material-icons-round text-lg ${accentClass}`}>{icon}</span>
        <h4 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark flex-1">{title}</h4>
        <span
          className="material-icons-round text-base text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border-light/30 dark:border-border-dark/30 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
}

function HaoAnalysisRow({
  detail,
  isMoving,
  trigramDataMap: _trigramDataMap,
  haoText,
}: {
  readonly detail: HaoDetail;
  readonly isMoving: boolean;
  readonly trigramDataMap: ReadonlyMap<number, Trigram>;
  readonly haoText?: HaoText;
}) {
  const posName = HAO_POSITION_NAMES[detail.position] ?? `Hào ${detail.position}`;
  const lucThanMeaning = LUC_THAN_MEANINGS[detail.lucThan] ?? '';
  const isInnerTrigram = detail.position <= 3;
  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${isMoving ? 'border-amber-300 bg-amber-50/60 dark:border-amber-700/80 dark:bg-amber-900/20 shadow-sm' : 'border-border-light/30 bg-gray-50/30 dark:border-border-dark/30 dark:bg-white/[0.02]'}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={`text-sm font-bold ${isMoving ? 'text-amber-800 dark:text-amber-200' : 'text-text-primary-light dark:text-text-primary-dark'}`}
        >
          {posName}
        </span>
        {isMoving && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
            Hào Động
          </span>
        )}
        {detail.isTh && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
            Thế
          </span>
        )}
        {detail.isUng && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
            Ứng
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
        <span>
          <span className="font-medium">Nạp Giáp:</span>{' '}
          <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
            {detail.can} {detail.chi}
          </span>
        </span>
        <span>
          <span className="font-medium">Hành:</span>{' '}
          <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{detail.element}</span>
        </span>
        <span>
          <span className="font-medium">Vị trí:</span>{' '}
          <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
            {isInnerTrigram ? 'Nội quái' : 'Ngoại quái'}
          </span>
        </span>
        <span>
          <span className="font-medium">Hào {detail.isSolid ? 'Dương' : 'Âm'}:</span>{' '}
          <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
            {detail.isSolid ? '⚊ (Cương)' : '⚋ (Nhu)'}
          </span>
        </span>
      </div>
      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
        <span className="font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
          {detail.lucThan}
        </span>
        {lucThanMeaning && <span className="ml-1">— {lucThanMeaning}</span>}
      </div>
      {detail.isTh && (
        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1 italic">{THE_UNG_MEANINGS.the}</p>
      )}
      {detail.isUng && (
        <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1 italic">{THE_UNG_MEANINGS.ung}</p>
      )}

      {haoText && (
        <div
          className={`mt-2.5 pt-2.5 border-t space-y-1.5 ${isMoving ? 'border-amber-200 dark:border-amber-800' : 'border-border-light/20 dark:border-border-dark/20'}`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${isMoving ? 'text-amber-700 dark:text-amber-400' : 'text-text-secondary-light'}`}
          >
            Ý Nghĩa Hào
          </span>
          <p
            className={`text-sm ${isMoving ? 'font-bold text-amber-900 dark:text-amber-100' : 'font-medium text-text-primary-light dark:text-text-primary-dark'}`}
          >
            {haoText.meaning}
          </p>
          {haoText.commentary && (
            <p
              className={`text-xs leading-relaxed ${isMoving ? 'text-amber-800/90 dark:text-amber-200/90' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
            >
              {haoText.commentary}
            </p>
          )}
        </div>
      )}

      {isMoving && !haoText && (
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-medium">
          ⚡ Hào này đang động — là trọng tâm biến hóa. {detail.isSolid ? 'Dương biến Âm' : 'Âm biến Dương'}.
        </p>
      )}
    </div>
  );
}

export default function TheoryCard({
  mainHexagram,
  mutualHexagram,
  changedHexagram,
  movingLine,
  mainHaoDetails,
  mutualHaoDetails,
  changedHaoDetails,
  trigramDataMap,
  context,
  summary,
  theLabel: _theLabel,
  dungLabel: _dungLabel,
}: TheoryCardProps) {
  const um = trigramDataMap.get(mainHexagram.upper);
  const lm = trigramDataMap.get(mainHexagram.lower);
  const uh = trigramDataMap.get(mutualHexagram.upper);
  const lh = trigramDataMap.get(mutualHexagram.lower);
  const uc = trigramDataMap.get(changedHexagram.upper);
  const lc = trigramDataMap.get(changedHexagram.lower);

  const sMain = mainHaoDetails ? [...mainHaoDetails].sort((a, b) => a.position - b.position) : [];
  const sMutual = mutualHaoDetails ? [...mutualHaoDetails].sort((a, b) => a.position - b.position) : [];
  const sChanged = changedHaoDetails ? [...changedHaoDetails].sort((a, b) => a.position - b.position) : [];

  return (
    <div className="card-surface animate-fade-in-up animate-delay-4">
      <div className="card-header">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Luận giải chi tiết
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-snug">
            Phân tích lý thuyết Dịch học sâu cho các quẻ và từng hào
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* 1. Ảnh hưởng việc hỏi */}
        <CollapsibleSection
          title="Ảnh hưởng đến việc hỏi"
          icon="psychology"
          defaultOpen={false}
          accentClass="text-accent-mutual dark:text-accent-mutual-dark"
        >
          <div className="space-y-4 pt-1">
            {summary.prophecy && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-900/20 p-4 border border-amber-200/60 dark:border-amber-700/40">
                <span className="label-standard text-accent-moving dark:text-accent-moving-dark block mb-1">
                  Lời Triệu
                </span>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200 tracking-tight">
                  {summary.prophecy}
                </p>
              </div>
            )}
            {context?.query && (
              <div className="card-subtle">
                <span className="label-standard">Việc hỏi:</span>
                <span className="text-sm font-bold ml-2">"{context.query}"</span>
              </div>
            )}
            <div>
              <span className="label-standard block mb-1">Phân tích Ngũ Hành</span>
              <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                Từ Thể ({summary.elementBreakdown.theElement}) và Dụng ({summary.elementBreakdown.dungElement}):{' '}
                <span className="font-bold text-accent-main dark:text-accent-main-dark">
                  {summary.theDungAssessment.relationship}
                </span>
                . {summary.theDungAssessment.meaning}
              </p>
            </div>
            <div>
              <span className="label-standard block mb-1">Ảnh hưởng thời gian</span>
              <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                {summary.temporalInfluence.description}
              </p>
              <p className="text-xs text-text-secondary-light mt-1">
                Lực thời gian: <span className="font-bold">{summary.temporalInfluence.strength}</span>.
              </p>
            </div>
            <div className="card-subtle">
              <span className="label-standard block mb-2">Kết luận tổng hợp</span>
              <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark whitespace-pre-line">
                {summary.detailedExplanation}
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. Category Predictions */}
        {summary.categoryPredictions && (
          <CollapsibleSection
            title="Luận đoán theo sự việc"
            icon="category"
            defaultOpen={false}
            accentClass="text-good dark:text-good-dark"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {CATEGORY_LABELS.map(({ key, label, icon }) => {
                const val = summary.categoryPredictions?.[key];
                if (!val) return null;
                return (
                  <div key={key} className="card-subtle-sm">
                    <span className="material-icons-round text-sm text-good dark:text-good-dark mt-0.5 shrink-0">
                      {icon}
                    </span>
                    <div>
                      <span className="label-standard block">{label}</span>
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">{val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* 3. Phân tích Quẻ Chủ (Combined with Giải nghĩa Kinh Dịch) */}
        <CollapsibleSection
          title={`Phân tích Quẻ Chủ — ${mainHexagram.name}`}
          icon="menu_book"
          defaultOpen={false}
          accentClass="text-accent-main dark:text-accent-main-dark"
        >
          <div className="space-y-5 pt-1">
            {/* 3.1 Cấu trúc Quẻ */}
            <div className="flex flex-col items-center pb-4 border-b border-border-light/30 dark:border-border-dark/30">
              {mainHexagram.diagram && (
                <div className="text-2xl tracking-[0.25em] font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
                  {mainHexagram.diagram}
                </div>
              )}
              <div className="flex justify-center gap-4 text-center w-full">
                <div className="card-subtle-sm">
                  <span className="label-standard text-accent-main dark:text-accent-main-dark block mb-0.5">
                    Ngoại Quái ({um?.name})
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {um?.element} · {um?.nature}
                  </span>
                </div>
                <div className="card-subtle-sm">
                  <span className="label-standard text-accent-main dark:text-accent-main-dark block mb-0.5">
                    Nội Quái ({lm?.name})
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {lm?.element} · {lm?.nature}
                  </span>
                </div>
              </div>
            </div>

            {/* 3.2 Ý nghĩa & Bình Giảng */}
            <div className="space-y-4">
              <div>
                <span className="label-standard flex items-center gap-1.5 mb-1.5">
                  <span className="material-icons-round text-sm">psychology</span> Tượng quẻ & Cốt lõi
                </span>
                {summary.briefExplanation && (
                  <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
                    {summary.briefExplanation}
                  </p>
                )}
                <p className="text-sm italic text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  "{summary.hexagramMeaning.image}"
                </p>
                <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                  {summary.hexagramMeaning.meaning}
                </p>
                {summary.deepMeaning && (
                  <p className="text-xs leading-relaxed text-text-secondary-light mt-2">{summary.deepMeaning}</p>
                )}
              </div>

              {summary.thoanTu && (
                <div className="card-quote">
                  <span className="label-standard text-accent-moving dark:text-accent-moving-dark block mb-1.5">
                    Thoán Từ (Văn Vương)
                  </span>
                  <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                    &ldquo;{summary.thoanTu.meaning}&rdquo;
                  </p>
                </div>
              )}

              {summary.commentary && (
                <div className="card-subtle">
                  <span className="label-standard block mb-2 flex items-center gap-1.5">
                    <span className="material-icons-round text-sm">format_quote</span> Bình Giảng Tổng Quát
                  </span>
                  <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark">
                    {summary.commentary}
                  </p>
                </div>
              )}
            </div>

            {/* 3.3 Chi tiết Hào Động (Focus summary if exists) */}
            {summary.movingLineText && (
              <div className="card-highlight">
                <div className="absolute top-0 right-0 p-2 opacity-10 dark:opacity-20 pointer-events-none">
                  <span className="material-icons-round text-6xl text-accent-moving">bolt</span>
                </div>
                <span className="label-standard text-accent-moving dark:text-accent-moving-dark block mb-2 relative z-10 flex items-center gap-1.5">
                  <span className="material-icons-round text-base">priority_high</span> Tâm Điểm (Hào {movingLine} Động)
                </span>
                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark relative z-10">
                  {summary.movingLineText.meaning}
                </p>
                {summary.movingLinePrediction && (
                  <p className="text-xs mt-2 italic text-accent-moving dark:text-accent-moving-dark relative z-10">
                    {summary.movingLinePrediction.meaning}
                  </p>
                )}
              </div>
            )}

            {/* 3.4 Chi tiết 6 Hào (Loop with HaoAnalysisRow) */}
            <div className="mt-6 pt-5 border-t border-border-light/30 dark:border-border-dark/30">
              <span className="label-standard block mb-4 flex items-center gap-1.5">
                <span className="material-icons-round text-sm">toc</span> Mổ xẻ 6 Hào Quẻ Chủ
              </span>
              <div className="space-y-3">
                {sMain.map((d) => {
                  const haoText = summary.allHaoTexts?.find((h) => h.position === d.position);
                  return (
                    <HaoAnalysisRow
                      key={d.position}
                      detail={d}
                      isMoving={d.position === movingLine}
                      trigramDataMap={trigramDataMap}
                      haoText={haoText}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 4. Quẻ Hỗ */}
        <CollapsibleSection
          title={`Phân tích Quẻ Hỗ — ${mutualHexagram.name}`}
          icon="change_history"
          defaultOpen={false}
          accentClass="text-accent-mutual dark:text-accent-mutual-dark"
        >
          <div className="space-y-4 pt-1">
            <div className="flex justify-center gap-4 text-center w-full">
              <div className="card-subtle-sm">
                <span className="label-standard text-accent-mutual dark:text-accent-mutual-dark block mb-0.5">
                  Ngoại Quái ({uh?.name})
                </span>
                <span className="text-xs text-text-secondary-light">
                  {uh?.element} · {uh?.nature}
                </span>
              </div>
              <div className="card-subtle-sm">
                <span className="label-standard text-accent-mutual dark:text-accent-mutual-dark block mb-0.5">
                  Nội Quái ({lh?.name})
                </span>
                <span className="text-xs text-text-secondary-light">
                  {lh?.element} · {lh?.nature}
                </span>
              </div>
            </div>
            <div>
              <span className="label-standard">Ý nghĩa Quẻ Hỗ</span>
              <p className="text-sm mt-1 italic text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Diễn biến, quá trình trung gian của sự việc.
              </p>
              <p className="text-sm mt-1 text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                {mutualHexagram.meaning}
              </p>
            </div>
            <div className="space-y-3 mt-4 pt-4 border-t border-border-light/20 dark:border-border-dark/20">
              <span className="label-standard block mb-2">Chi tiết 6 Hào (Quẻ Hỗ)</span>
              {sMutual.map((d) => {
                const haoText = mutualHexagram.haoTexts?.find((h) => h.position === d.position);
                return (
                  <HaoAnalysisRow
                    key={d.position}
                    detail={d}
                    isMoving={false}
                    trigramDataMap={trigramDataMap}
                    haoText={haoText}
                  />
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        {/* 5. Quẻ Biến */}
        <CollapsibleSection
          title={`Phân tích Quẻ Biến — ${changedHexagram.name}`}
          icon="swap_horiz"
          defaultOpen={false}
          accentClass="text-accent-changed dark:text-accent-changed-dark"
        >
          <div className="space-y-4 pt-1">
            <div className="flex justify-center gap-4 text-center w-full">
              <div className="card-subtle-sm">
                <span className="label-standard text-accent-changed dark:text-accent-changed-dark block mb-0.5">
                  Ngoại Quái ({uc?.name})
                </span>
                <span className="text-xs text-text-secondary-light">
                  {uc?.element} · {uc?.nature}
                </span>
              </div>
              <div className="card-subtle-sm">
                <span className="label-standard text-accent-changed dark:text-accent-changed-dark block mb-0.5">
                  Nội Quái ({lc?.name})
                </span>
                <span className="text-xs text-text-secondary-light">
                  {lc?.element} · {lc?.nature}
                </span>
              </div>
            </div>
            <div>
              <span className="label-standard">Ý nghĩa Quẻ Biến</span>
              <p className="text-sm mt-1 italic text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Kết quả cuối cùng, hậu vận của sự việc.
              </p>
              <p className="text-sm mt-1 text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                {changedHexagram.meaning}
              </p>
            </div>
            <div className="space-y-3 mt-4 pt-4 border-t border-border-light/20 dark:border-border-dark/20">
              <span className="label-standard block mb-2">Chi tiết 6 Hào (Quẻ Biến)</span>
              {sChanged.map((d) => {
                const haoText = changedHexagram.haoTexts?.find((h) => h.position === d.position);
                return (
                  <HaoAnalysisRow
                    key={d.position}
                    detail={d}
                    isMoving={false}
                    trigramDataMap={trigramDataMap}
                    haoText={haoText}
                  />
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
