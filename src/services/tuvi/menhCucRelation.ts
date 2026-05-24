/**
 * Mệnh-Cục Relation Analysis
 *
 * Pure TypeScript module for determining the Ngũ Hành relationship
 * between Mệnh (Life) and Cục (Bureau) in a Tử Vi chart.
 *
 * Zero React dependencies.
 */

import type { MenhCucRelation } from '../../types/tuvi';
import { NGU_HANH_SINH, NGU_HANH_KHAC, getNapAmIndex, NAP_AM_NAMES, NAP_AM_HANH, NGU_HANH_CUC } from './constants';

// ── Public API ──────────────────────────────────────────────────

/**
 * Determines the Ngũ Hành relationship between Mệnh and Cục.
 *
 * Uses the generation (sinh) and control (khắc) cycles to decide
 * whether Cục supports or restrains Mệnh, or if they are neutral.
 *
 * @param menhHanh — Ngũ Hành element of Mệnh
 * @param cucHanh  — Ngũ Hành element of Cục
 * @returns `MenhCucRelation` with relation type and description
 */
export function calculateMenhCucRelation(menhHanh: string, cucHanh: string): MenhCucRelation {
  if (menhHanh === cucHanh) {
    return {
      relation: 'bình hòa',
      description: 'Mệnh Cục bình hòa',
      menhHanh,
      cucHanh,
    };
  }

  // Cục sinh Mệnh
  if (NGU_HANH_SINH[cucHanh] === menhHanh) {
    return {
      relation: 'sinh',
      description: 'Cục sinh Mệnh',
      menhHanh,
      cucHanh,
    };
  }

  // Mệnh sinh Cục
  if (NGU_HANH_SINH[menhHanh] === cucHanh) {
    return {
      relation: 'sinh',
      description: 'Mệnh sinh Cục',
      menhHanh,
      cucHanh,
    };
  }

  // Cục khắc Mệnh
  if (NGU_HANH_KHAC[cucHanh] === menhHanh) {
    return {
      relation: 'khắc',
      description: 'Cục khắc Mệnh',
      menhHanh,
      cucHanh,
    };
  }

  // Mệnh khắc Cục
  if (NGU_HANH_KHAC[menhHanh] === cucHanh) {
    return {
      relation: 'khắc',
      description: 'Mệnh khắc Cục',
      menhHanh,
      cucHanh,
    };
  }

  // Neither sinh nor khắc
  return {
    relation: 'bình hòa',
    description: 'Mệnh Cục bình hòa',
    menhHanh,
    cucHanh,
  };
}

/**
 * Gets the Ngũ Hành element of Mệnh from its palace Can-Chi Nạp Âm.
 *
 * @param menhChiIndex — Địa Chi index of Mệnh palace (0–11)
 * @param menhCanIndex — Thiên Can index of Mệnh palace (0–9)
 * @returns Ngũ Hành element string, e.g. "Kim", "Mộc"
 */
export function getMenhHanh(menhChiIndex: number, menhCanIndex: number): string {
  const napAmIdx = getNapAmIndex(menhCanIndex, menhChiIndex);
  const napAmName = NAP_AM_NAMES[napAmIdx];
  return NAP_AM_HANH[napAmName] ?? '';
}

/**
 * Gets the Ngũ Hành element of the Cục from its name.
 *
 * @param cucName — Cục name, e.g. "Thủy Nhị Cục"
 * @returns Ngũ Hành element string, e.g. "Thủy"
 */
export function getCucHanh(cucName: string): string {
  return NGU_HANH_CUC[cucName]?.hanh ?? '';
}
