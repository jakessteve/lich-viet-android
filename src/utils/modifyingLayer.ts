/**
 * Modifying Layer — "Ngọc hạp thông thư"
 * Overlays additional stars (Cát Thần, Hung Thần), Trực, and Tú
 * onto the foundational assessment from the Hiệp Kỷ layer.
 */

import { CanChi, Chi, StarData, ModifyingLayerResult } from '../types/calendar';
import catThanData from '../data/phase_1/cat_than.json';
import hungThanData from '../data/phase_1/hung_than.json';
import thapNhiTrucData from '../data/phase_1/thap_nhi_truc.json';
import nhiThapBatTuData from '../data/phase_1/nhi_thap_bat_tu.json';
import { CHI, SEASONS, getSeasonIndex, TU_JD_OFFSET } from './constants';
import { getJDN, getSolarTerm } from './foundationalLayer';

export function calculateModifyingLayer(
  date: Date,
  lunar: { day: number; month: number; year: number; isLeap: boolean },
  dayCanChi: CanChi,
  solarMonth: number,
): ModifyingLayerResult {
  const stars: StarData[] = [];

  const catThan = (catThanData.stars as StarData[]) || [];
  const hungThan = (hungThanData.stars as StarData[]) || [];
  const thapNhiTruc = thapNhiTrucData.thap_nhi_truc || [];
  const nhiThapBatTu = nhiThapBatTuData.nhi_thap_bat_tu || [];

  const allStars = [...catThan, ...hungThan];

  allStars.forEach((s) => {
    let matches = false;
    const c = s.criteria;
    if (!c) return;

    const monthKey = solarMonth.toString();
    const lunarMonthKey = lunar.month.toString();

    if (c.lunar_days && c.lunar_days.includes(lunar.day)) matches = true;
    if (c.month_can_chi && c.month_can_chi[solarMonth - 1] === dayCanChi.can) matches = true;

    const valMonthDayChi = c.month_day_chi?.[monthKey];
    if (
      valMonthDayChi &&
      (Array.isArray(valMonthDayChi) ? valMonthDayChi.includes(dayCanChi.chi) : valMonthDayChi === dayCanChi.chi)
    )
      matches = true;

    if (c.month_day_can?.[monthKey] === dayCanChi.can) matches = true;
    if (c.day_can_chi?.includes(`${dayCanChi.can} ${dayCanChi.chi}`)) matches = true;

    // Season mapping follows the solar-term month ladder (Dần->Sửu).
    const seasonIdx = getSeasonIndex(solarMonth);
    const season = SEASONS[seasonIdx];

    if (c.season_day_can_chi?.[season] === `${dayCanChi.can} ${dayCanChi.chi}`) matches = true;

    const valMonthCan = c.month_can?.[monthKey];
    if (
      valMonthCan &&
      (Array.isArray(valMonthCan) ? valMonthCan.includes(dayCanChi.can) : valMonthCan === dayCanChi.can)
    )
      matches = true;

    const valSeasonCan = c.season_day_can?.[season];
    if (
      valSeasonCan &&
      (Array.isArray(valSeasonCan) ? valSeasonCan.includes(dayCanChi.can) : valSeasonCan === dayCanChi.can)
    )
      matches = true;

    const valSeasonChi = c.season_day_chi?.[season];
    if (
      valSeasonChi &&
      (Array.isArray(valSeasonChi) ? valSeasonChi.includes(dayCanChi.chi) : valSeasonChi === dayCanChi.chi)
    )
      matches = true;

    if (c.sequence_days?.includes(`${dayCanChi.can} ${dayCanChi.chi}`)) matches = true;

    // New criteria: solar_terms_eve (Day before specific solar terms)
    if (c.solar_terms_eve) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const jdTomorrow = getJDN(tomorrow.getDate(), tomorrow.getMonth() + 1, tomorrow.getFullYear());
      const termTomorrow = getSolarTerm(jdTomorrow);
      const jdToday = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
      const termToday = getSolarTerm(jdToday);

      if (termTomorrow !== termToday && c.solar_terms_eve.includes(termTomorrow)) {
        matches = true;
      }
    }

    // Trực check
    const trucIndex = (CHI.indexOf(dayCanChi.chi as Chi) - ((solarMonth + 1) % 12) + 12) % 12;
    if (c.day_truc?.includes(thapNhiTruc[trucIndex].name)) matches = true;

    if (c.month_group_day_chi) {
      const monthChiName = CHI[(solarMonth + 1) % 12];
      for (const group of Object.keys(c.month_group_day_chi)) {
        if (group.includes(monthChiName) && c.month_group_day_chi[group] === dayCanChi.chi) {
          matches = true;
        }
      }
    }

    const valLunarMonthDay = c.lunar_month_day?.[lunarMonthKey];
    if (valLunarMonthDay) {
      if (Array.isArray(valLunarMonthDay)) {
        if (valLunarMonthDay.includes(lunar.day)) matches = true;
      } else {
        if (valLunarMonthDay === lunar.day) matches = true;
      }
    }

    if (c.solar_terms_before) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const jdTomorrow = getJDN(tomorrow.getDate(), tomorrow.getMonth() + 1, tomorrow.getFullYear());
      const jdToday = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
      const termTomorrow = getSolarTerm(jdTomorrow);
      const termToday = getSolarTerm(jdToday);
      if (
        termTomorrow !== termToday &&
        c.solar_terms_before.some((t: string) => termTomorrow.includes(t) || t.includes(termTomorrow))
      ) {
        matches = true;
      }
    }

    if (matches) {
      stars.push(s);
    }
  });

  // Calculate Trực & Tú for the return object
  const chiIndex = CHI.indexOf(dayCanChi.chi as Chi);
  const monthChiIndex = (solarMonth + 1) % 12;
  const trucIndex = (chiIndex - monthChiIndex + 12) % 12;
  const trucDetail = thapNhiTruc[trucIndex] || { name: 'N/A', quality: 'Neutral', description: '' };

  const jd = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const tuIndex = (jd + TU_JD_OFFSET) % 28;
  const tuDetail = nhiThapBatTu[tuIndex] || { name: 'N/A', quality: 'Neutral', description: '' };

  return { stars, trucDetail, tuDetail };
}
