export { scoreActivity, scoreAllActivities } from '@/utils/activityScorer';
export type { ActivityScoreResult, ScoreBreakdownItem, HourScoreEntry } from '@/utils/activityScorer';
export {
  getActivityById,
  findActivityByName,
  getActivitiesByCategory,
  searchActivities,
  mapDungSuToActivityIds,
  getMaxSearchDaysForActivity,
  CATEGORIES,
  ACTIVITY_CATALOG,
} from '@/utils/activityCatalog';
export type { ActivityEntry, ActivityCategory, CategoryInfo } from '@/utils/activityCatalog';
export { generateDungSu } from '@/utils/dungSuEngine';
