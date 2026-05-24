import { describe, it, expect } from 'vitest';
import { getDetailedDayData } from '@/utils/calendarEngine';
import { scoreActivity } from '@/utils/activityScorer';
import { CLASSICAL_AUSPICIOUSNESS } from '@/config/scoring';

type OracleCase = {
  date: string;
  tianShenLuck: '吉' | '凶';
  note: string;
  expectations: Array<{
    activityId: string;
    min?: number;
    max?: number;
  }>;
};

const CALIBRATION_CASES: OracleCase[] = [
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2024-02-09 -> 天神凶, 宜: 出行/开市/交易/入宅/移徙/安葬/动土/嫁娶
    date: '2024-02-09',
    tianShenLuck: '凶',
    note: 'Pre-Tet day that still supports several explicit activities.',
    expectations: [
      { activityId: 'xuat-hanh', min: CLASSICAL_AUSPICIOUSNESS.preferredFloor },
      { activityId: 'khai-truong', min: CLASSICAL_AUSPICIOUSNESS.preferredFloor },
    ],
  },
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2024-02-10 -> 天神吉, 宜: 嫁娶/开光/会亲友/安床/开市 absent, 忌: 入宅/移徙/开市/动土
    date: '2024-02-10',
    tianShenLuck: '吉',
    note: 'Tet day with mixed commercial and house-moving restrictions.',
    expectations: [
      { activityId: 'cuoi-hoi', min: CLASSICAL_AUSPICIOUSNESS.preferredFloor },
      { activityId: 'khai-truong', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
    ],
  },
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2024-04-03 -> 天神吉, 宜: 破屋/坏垣/求医/治病, 忌: 开光/嫁娶
    date: '2024-04-03',
    tianShenLuck: '吉',
    note: 'Oracle says marriage is blocked here even though the day is otherwise usable.',
    expectations: [
      { activityId: 'cuoi-hoi', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
    ],
  },
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2024-04-04 -> 天神凶, 宜: 祭祀/求医/治病/解除, 忌: 诸事不宜
    date: '2024-04-04',
    tianShenLuck: '凶',
    note: 'Severe day where the scorer should stay low across the board.',
    expectations: [
      { activityId: 'khai-truong', max: CLASSICAL_AUSPICIOUSNESS.severeCap },
      { activityId: 'dong-tho', max: CLASSICAL_AUSPICIOUSNESS.severeCap },
    ],
  },
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2024-08-07 -> 天神凶, 宜: 嫁娶/订盟/纳采/出行/开市/移徙/入宅/启钻/安葬
    // 忌: 动土/破土
    date: '2024-08-07',
    tianShenLuck: '凶',
    note: 'A broad-yes day that still blocks earthwork.',
    expectations: [
      { activityId: 'cuoi-hoi', min: CLASSICAL_AUSPICIOUSNESS.preferredFloor },
      { activityId: 'xuat-hanh', min: CLASSICAL_AUSPICIOUSNESS.preferredFloor },
      { activityId: 'dong-tho', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
    ],
  },
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2024-11-07 -> 天神吉, 宜: 出行/开市/祭祀, 忌: 嫁娶/动土/安葬/作灶
    date: '2024-11-07',
    tianShenLuck: '吉',
    note: 'This is the important regression: Bách Sự Hung should not flatten direct support.',
    expectations: [
      { activityId: 'xuat-hanh', min: CLASSICAL_AUSPICIOUSNESS.preferredFloor },
      { activityId: 'khai-truong', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
      { activityId: 'cuoi-hoi', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
    ],
  },
  {
    // Reference snapshot from lunar-javascript 1.7.7:
    // 2025-01-29 -> 天神吉, 宜: 祭祀/斋醮/纳财/捕捉/畋猎, 忌: 嫁娶/开市/入宅/安床/破土/安葬
    date: '2025-01-29',
    tianShenLuck: '吉',
    note: 'New Year day still blocks commerce and burial tasks.',
    expectations: [
      { activityId: 'khai-truong', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
      { activityId: 'chon-cat', max: CLASSICAL_AUSPICIOUSNESS.forbiddenCap },
    ],
  },
];

function toExpectedDeityStatus(luck: OracleCase['tianShenLuck']): string {
  return luck === '吉' ? 'Ngày Hoàng Đạo' : 'Ngày Hắc Đạo';
}

describe('trach nhat calibration corpus', () => {
  it.each(CALIBRATION_CASES)('$date aligns with the oracle-backed day signal', ({ date, tianShenLuck }) => {
    const [year, month, day] = date.split('-').map(Number);
    const dayData = getDetailedDayData(new Date(year, month - 1, day));

    expect(dayData.deityStatus).toBe(toExpectedDeityStatus(tianShenLuck));
  });

  it.each(
    CALIBRATION_CASES.flatMap((item) =>
      item.expectations.map((expectation) => ({
        ...item,
        ...expectation,
      })),
    ),
  )('$date keeps $activityId within the oracle band', ({ date, activityId, min, max }) => {
    const [year, month, day] = date.split('-').map(Number);
    const dayData = getDetailedDayData(new Date(year, month - 1, day));
    const result = scoreActivity(activityId, dayData);

    if (typeof min === 'number') {
      expect(result.percentage).toBeGreaterThanOrEqual(min);
    }
    if (typeof max === 'number') {
      expect(result.percentage).toBeLessThanOrEqual(max);
    }
  });
});
