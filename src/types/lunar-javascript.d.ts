declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    static fromJulianDay(julianDay: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    toYmd(): string;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number, isLeap?: boolean): Lunar;
    getSolar(): Solar;
    getDayInGanZhi(): string;
    getDayInGanZhiExact(): string;
    getYearInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getMonthInGanZhiExact(): string;
    toString(): string;
    _p: {
      year: number;
      month: number;
      day: number;
    };
  }
}
