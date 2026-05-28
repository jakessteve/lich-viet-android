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
export {
  generateFlyingStarChart,
  generateLouPanChart,
  calculateAnnualStar,
  calculateMonthlyStar,
  normalizeHeading,
  getMountainForHeading,
  getSittingMountain,
  getActiveVanForYear,
  COMPASS_DIRECTIONS,
  buildSpatialTemporalPayload,
} from './fengshui';
export type {
  FlyingStarChart,
  PalaceInfo,
  FlyingStar,
  LouPanChartInput,
  CompassCalibrationState,
  CompassHeadingSource,
  CompassHeadingState,
  CompassPermissionState,
  FengShuiChartGridCell,
  FengShuiDirectionGroup,
  FengShuiElement,
  FengShuiPolarity,
  Mountain24,
  SpatialContext,
  AstrologicalMasks,
  TimestampContext,
  VietnameseSpatialTemporalPayload,
  BuildSpatialTemporalPayloadInput,
} from './fengshui';
