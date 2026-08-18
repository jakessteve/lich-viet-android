// Constants & Catalogs
export { CAN, CHI, NAP_AM_MAPPING, HOANG_DAO_MAPPING } from '@/utils/constants';
export { SOURCE_CATALOG } from '@/data/sources';
export type { SourceConfidence, SourceRecord, SourceRef } from '@/data/sources';
export {
  GIEOQUE_SOURCE_REFS,
  TRIGRAMS,
  HEXAGRAMS,
  HEXAGRAM_LOOKUP,
  getTrigramByLines,
  getHexagram,
} from '@/data/gieoque';
export { castHoaMai, castGieoQue, getGieoQueFixturesCount } from '@/utils/gieoQueEngine';
export type {
  GieoQueCastResult,
  GieoQueHaoDetail,
  GieoQueInput,
  GieoQueMethod,
  GieoQueRelationship,
  GieoQueWarning,
} from '@/utils/gieoQueEngine';

// Lunar Engine (Meeus / Hồ Ngọc Đức algorithm)
export * from './lunar-engine/index.js';

// Astrology Rules (Can Chi, Hoàng Đạo, 12 Trực, 28 Tú, Dụng Sự)
export * from './astrology-rules/index.js';

// Prayer & Festival Catalogs
export * from './prayer-catalog/index.js';
