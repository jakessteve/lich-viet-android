declare module 'lunar-javascript' {
  export const Solar: {
    fromDate: (date: Date) => {
      getLunar: () => {
        getDayYi: () => string[];
        getDayJi: () => string[];
        getYearInGanZhi: () => string;
        getMonthInGanZhi: () => string;
        getDayInGanZhi: () => string;
      };
    };
  };
  export const Lunar: {
    fromDate: (date: Date) => unknown;
  };
}
