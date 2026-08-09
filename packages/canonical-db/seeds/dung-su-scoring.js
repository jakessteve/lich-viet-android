import { DUNG_SU_EVENTS } from "./dung-su-events.js";

const COMPLETE_PROFILE = Object.freeze({
  accuracy_tier: "complete",
  source_coverage_percent: 100,
  generic_weight: 0.7,
  cross_system_weight: 0.3,
  specialist_weight: 0,
  hard_cap_missing_specialist: null,
  specialist_ref: null
});

const SPECIALIST_PROFILES = Object.freeze({
  marriage_synastry: Object.freeze({
    accuracy_tier: "bounded_specialist_ready",
    source_coverage_percent: 60,
    generic_weight: 0.3,
    cross_system_weight: 0.3,
    specialist_weight: 0.4,
    hard_cap_missing_specialist: null,
    specialist_ref: "synastry_tuvi_western_vedic"
  }),
  burial_form_school: Object.freeze({
    accuracy_tier: "bounded_specialist_ready",
    source_coverage_percent: 55,
    generic_weight: 0.35,
    cross_system_weight: 0.15,
    specialist_weight: 0.5,
    hard_cap_missing_specialist: null,
    specialist_ref: "zangshu_burial_form_school"
  }),
  construction_fengshui: Object.freeze({
    accuracy_tier: "bounded_specialist_ready",
    source_coverage_percent: 60,
    generic_weight: 0.35,
    cross_system_weight: 0.2,
    specialist_weight: 0.45,
    hard_cap_missing_specialist: null,
    specialist_ref: "fengshui_site_orientation"
  }),
  medical_timing: Object.freeze({
    accuracy_tier: "bounded_specialist_ready",
    source_coverage_percent: 65,
    generic_weight: 0.5,
    cross_system_weight: 0.2,
    specialist_weight: 0.3,
    hard_cap_missing_specialist: null,
    specialist_ref: "medical_timing_context"
  })
});

const MARRIAGE_EVENT_IDS = new Set([
  "ds_jie_hun_yin",
  "ds_na_cai_li",
  "ds_wen_ming",
  "ds_jia_qu"
]);

const BURIAL_EVENT_IDS = new Set([
  "ds_po_tu",
  "ds_an_zang",
  "ds_qi_zan",
  "ds_he_shou_mu",
  "ds_jin_jing_xia_zhuan"
]);

const CONSTRUCTION_FENGSHUI_EVENT_IDS = new Set([
  "ds_ying_jian_gong_shi",
  "ds_xiu_gong_shi",
  "ds_shan_cheng_guo",
  "ds_zhu_di_fang",
  "ds_xing_zao",
  "ds_dong_tu",
  "ds_shu_zhu",
  "ds_shang_liang",
  "ds_xiu_cang_ku",
  "ds_xiu_zhi_chan_shi",
  "ds_an_dui_wei",
  "ds_xiu_fang",
  "ds_ru_zhai",
  "ds_fang_shui",
  "ds_chuan_jing",
  "ds_kai_qu"
]);

const MEDICAL_EVENT_IDS = new Set([
  "ds_qiu_yi",
  "ds_liao_bing"
]);

function resolveSpecialistProfile(eventId) {
  if (MARRIAGE_EVENT_IDS.has(eventId)) {
    return SPECIALIST_PROFILES.marriage_synastry;
  }

  if (BURIAL_EVENT_IDS.has(eventId)) {
    return SPECIALIST_PROFILES.burial_form_school;
  }

  if (CONSTRUCTION_FENGSHUI_EVENT_IDS.has(eventId)) {
    return SPECIALIST_PROFILES.construction_fengshui;
  }

  if (MEDICAL_EVENT_IDS.has(eventId)) {
    return SPECIALIST_PROFILES.medical_timing;
  }

  return COMPLETE_PROFILE;
}

export const DUNG_SU_SCORING_PROFILES = Object.freeze(
  DUNG_SU_EVENTS.map((event) => {
    const profile = resolveSpecialistProfile(event.event_id);

    return Object.freeze({
      event_id: event.event_id,
      scoring_profile_id: `${event.event_id}_scoring`,
      category: event.category,
      source_ref: event.source_ref,
      ...profile
    });
  })
);
