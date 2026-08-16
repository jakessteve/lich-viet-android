import { judgeHoraryChart, HORARY_TOPICS } from '@omce/core-logic';
import { calculateWesternChart } from './westernCalculator';
import type { WesternChartInput } from '../../types/astrology';

export { HORARY_TOPICS };

export interface HoraryServiceResult {
  questionTime: Date;
  dateLabel: string;
  topicId: string;
  topicLabel: string;
  judgment: ReturnType<typeof judgeHoraryChart>;
  chart: ReturnType<typeof calculateWesternChart>;
}

export function calculateHoraryQuestion(
  topicId: string,
  latitude: number,
  longitude: number,
  questionTime: Date = new Date(),
  timezone: number = 7,
): HoraryServiceResult {
  const input: WesternChartInput = {
    birthDate: questionTime,
    birthHour: questionTime.getHours(),
    birthMinute: questionTime.getMinutes(),
    latitude,
    longitude,
    timezone,
  };

  const chart = calculateWesternChart(input);
  const houseCusps = chart.houses.map((h) => h.longitude);
  const planets = chart.planets.map((p) => ({
    body: p.body,
    tropicalLongitude: p.tropicalLongitude,
    house: p.house,
  }));

  const judgment = judgeHoraryChart({
    topicId,
    houseCusps,
    planets,
    ascendantLongitude: chart.ascendant,
  });

  const topicObj = HORARY_TOPICS.find((t) => t.id === topicId) || HORARY_TOPICS[0];

  return {
    questionTime,
    dateLabel: questionTime.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    topicId,
    topicLabel: topicObj.nameVi,
    judgment,
    chart,
  };
}
