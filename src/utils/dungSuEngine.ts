/**
 * Dụng Sự Engine — Activity Suitability Logic
 * Determines which activities are suitable (Nghi) or unsuitable (Kỵ)
 * for a given day based on Trực rules and star interactions.
 */

import { ModifyingLayerResult, DungSuData, StarData } from '../types/calendar';
import dungSuData from '../data/phase_1/dung_su.json';
import vtMappingData from '../data/phase_1/vtMapping.json';
import {
  MAJOR_HUNG_STARS,
  SAT_SU_NHAT_NAME,
  CUU_KHO_BAT_CUNG_NAME,
  BACH_SU_NGHI_STARS,
  BACH_SU_HUNG_LABEL,
  GLOBAL_GOOD_LABELS,
  GLOBAL_BAD_LABELS,
} from './constants';
import lunarJs from 'lunar-javascript';

const vtMapping: Record<string, string> = vtMappingData;
const { Solar } = lunarJs as unknown as { Solar: { fromDate: (date: Date) => { getLunar: () => unknown } } };

const ORACLE_ACTIVITY_MAP: Record<string, string> = {
  '嫁娶': 'Cưới hỏi',
  '结婚': 'Cưới hỏi',
  '开市': 'Khai trương',
  '开业': 'Khai trương',
  '开张': 'Khai trương',
  '交易': 'Giao dịch',
  '立券': 'Ký hợp đồng',
  '出行': 'Xuất hành',
  '入宅': 'Chuyển nhà',
  '移徙': 'Chuyển nhà',
  '安葬': 'Chôn cất',
  '启钻': 'Chôn cất',
  '动土': 'Động thổ',
  '破土': 'Động thổ',
  '祭祀': 'Cúng lễ',
  '求医': 'Chữa bệnh',
  '治病': 'Chữa bệnh',
  '解除': 'Giải hạn',
  '开光': 'Khai quang',
  '安床': 'Kê giường',
  '修造': 'Sửa chữa',
  '拆卸': 'Phá dỡ nhà',
  '坏垣': 'Xây tường/Lấp vá',
  '纳财': 'Cầu tài',
  '纳采': 'Dạm ngõ',
  '订盟': 'Lễ ăn hỏi',
};

function mapOracleActivities(raw: string): string[] {
  const mapped: string[] = [];
  raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((token) => {
      for (const [needle, activity] of Object.entries(ORACLE_ACTIVITY_MAP)) {
        if (token.includes(needle)) mapped.push(activity);
      }
    });
  return Array.from(new Set(mapped));
}

export function generateDungSu(modifying: ModifyingLayerResult, _dayCanNguHanh: string, date?: Date) {
  const suitable: string[] = [];
  const unsuitable: string[] = [];
  const oracleSuitable: string[] = [];
  const oracleUnsuitable: string[] = [];
  let oracleGlobalVeto = false;

  const starNames = modifying.stars.map((s) => s.name);
  const trucName = modifying.trucDetail.name;
  const trucRules = (dungSuData as unknown as DungSuData).truc_rules || {};
  const dayTrucRule = trucRules[trucName] || { nghi: [], ky: [] };

  const solar = Solar.fromDate(date || new Date());
  const lunar = solar.getLunar() as { getDayYi: (sect?: number) => { toString: () => string }; getDayJi: (sect?: number) => { toString: () => string } };
  const oracleYiRaw = lunar.getDayYi(1).toString();
  const oracleJiRaw = lunar.getDayJi(1).toString();
  const oracleYi = mapOracleActivities(oracleYiRaw);
  const oracleJi = mapOracleActivities(oracleJiRaw);
  oracleGlobalVeto = oracleJiRaw.includes('诸事不宜');

  // 1. Activities from Trực
  suitable.push(...(dayTrucRule.nghi || []));
  unsuitable.push(...(dayTrucRule.ky || []));

  // 2. Activities from Stars (Both Good and Bad can have recommendations/prohibitions)
  modifying.stars.forEach((star) => {
    const s = star.name === 'long Hội' ? { ...star, name: 'Long Hội' } : star;
    if (s.suitable) suitable.push(...s.suitable);
    if (s.unsuitable) unsuitable.push(...s.unsuitable);
  });

  oracleSuitable.push(...oracleYi);
  oracleUnsuitable.push(...oracleJi);

  // 3. Special Global Override & Bách Sự Hung
  const bachKyList = (dungSuData as unknown as DungSuData).bach_ky_list || [];
  const matchesBachSuHung = (s: StarData) =>
    s.name === CUU_KHO_BAT_CUNG_NAME ||
    (s.unsuitable && s.unsuitable.some((u: string) => u.toLowerCase().includes('bách sự hung'))) ||
    (s.description && s.description.toLowerCase().includes('bách sự hung'));

  const isBachSuHung = modifying.stars.some(matchesBachSuHung);

  if (isBachSuHung) {
    unsuitable.push(...bachKyList);
    unsuitable.unshift(BACH_SU_HUNG_LABEL);
  }

  // 4. Sát Sư Nhật handling
  const hasSatSu = modifying.stars.some((s) => s.name === SAT_SU_NHAT_NAME);
  if (hasSatSu) {
    const satSuUnsuitable = (dungSuData as unknown as DungSuData).sat_su_unsuitable || [];
    unsuitable.push(...satSuUnsuitable);
  }

  // 5. General block for major harmful stars
  if (modifying.stars.some((s) => (MAJOR_HUNG_STARS as readonly string[]).includes(s.name))) {
    const majorHungUnsuitable = (dungSuData as unknown as DungSuData).major_hung_unsuitable || [];
    unsuitable.push(...majorHungUnsuitable);
  }

  // 6. Handle "Bách sự nghi dụng"
  if ((BACH_SU_NGHI_STARS as readonly string[]).some((star) => starNames.includes(star))) {
    if (!isBachSuHung) {
      suitable.unshift('Tốt cho mọi việc (Bách sự nghi dụng)');
    }
  }

  // ── Translation & Unification ───────────────────────────────

  const translateAct = (text: string): string => {
    let t = text.trim();
    if (!t) return '';

    // First try to catch the "Main (Explanation)" pattern so commas inside are protected
    const parenMatch = t.match(/^(.+?)\s*\((.+?)\)$/);
    if (parenMatch) {
      const main = parenMatch[1].trim();
      const inner = parenMatch[2].trim();

      const transMain = translateAct(main);
      const transInner = translateAct(inner);

      if (transMain.toLowerCase() === transInner.toLowerCase()) return transMain;
      if (transMain.toLowerCase().includes(transInner.toLowerCase())) return transMain;
      if (transInner.toLowerCase().includes(transMain.toLowerCase())) return transInner;

      return `${transMain} (${transInner})`;
    }

    // Handle nested translation if comma separated
    if (t.includes(',')) {
      const parts = t
        .split(',')
        .map((part) => translateAct(part.trim()))
        .filter((p) => !!p);
      return Array.from(new Set(parts)).join(', ');
    }

    // Strip accidental trailing marks and standardize lower for matching
    t = t.replace(/[)\s,]+$/, '').trim();
    const lower = t.toLowerCase();

    if (vtMapping[lower]) return vtMapping[lower];

    // Prefix match
    for (const key of Object.keys(vtMapping)) {
      if (lower.startsWith(key)) return vtMapping[key];
    }

    // Capitalize sentence case if all caps
    if (t === t.toUpperCase() && t.length > 2) {
      t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    }

    // Capitalize first letter to be safe
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const consolidateActivities = (list: string[]): string[] => {
    const groups = new Map<string, Set<string>>();

    list.forEach((item) => {
      const parts = item
        .split(/,\s*(?![^()]*\))/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) return;
      const base = parts[0];

      let cBase = base;
      if (cBase.length > 0) cBase = cBase.charAt(0).toUpperCase() + cBase.slice(1);

      if (!groups.has(cBase)) groups.set(cBase, new Set());
      parts.slice(1).forEach((p) => groups.get(cBase)!.add(p));
    });

    const result: string[] = [];
    for (const [base, extensions] of groups.entries()) {
      if (extensions.size > 0) {
        result.push(`${base}, ${Array.from(extensions).join(', ')}`);
      } else {
        result.push(base);
      }
    }
    return result.sort();
  };

  // Deduplicate, translate, and consolidate
  const translatedSuitable = Array.from(new Set(suitable.filter((s) => s && s.length > 1).map((s) => translateAct(s))));
  const translatedUnsuitable = Array.from(
    new Set(unsuitable.filter((s) => s && s.length > 1).map((s) => translateAct(s))),
  );

  let finalSuitable = consolidateActivities(translatedSuitable);
  let finalUnsuitable = consolidateActivities(translatedUnsuitable);

  // Priority ranking for Global statements
  const hasGlobalBad = finalUnsuitable.some((s) =>
    GLOBAL_BAD_LABELS.some((b) => s.toLowerCase().includes(b.toLowerCase())),
  );
  const hasGlobalGood = finalSuitable.some((s) =>
    GLOBAL_GOOD_LABELS.some((g) => s.toLowerCase().includes(g.toLowerCase())),
  );

  if (hasGlobalBad) {
    finalSuitable = finalSuitable.filter(
      (s) => !GLOBAL_GOOD_LABELS.some((g) => s.toLowerCase().includes(g.toLowerCase())),
    );
  }
  if (hasGlobalGood && !hasGlobalBad) {
    finalUnsuitable = finalUnsuitable.filter(
      (s) => !GLOBAL_BAD_LABELS.some((b) => s.toLowerCase().includes(b.toLowerCase())),
    );
  }

  [...GLOBAL_GOOD_LABELS].reverse().forEach((g) => {
    const matchMatch = finalSuitable.find((s) => s.toLowerCase().includes(g.toLowerCase()));
    if (matchMatch) {
      finalSuitable = [matchMatch, ...finalSuitable.filter((s) => s !== matchMatch)];
    }
  });

  [...GLOBAL_BAD_LABELS].reverse().forEach((b) => {
    const matchMatch = finalUnsuitable.find((s) => s.toLowerCase().includes(b.toLowerCase()));
    if (matchMatch) {
      finalUnsuitable = [matchMatch, ...finalUnsuitable.filter((s) => s !== matchMatch)];
    }
  });

  return { suitable: finalSuitable, unsuitable: finalUnsuitable, oracleSuitable, oracleUnsuitable, oracleGlobalVeto };
}
