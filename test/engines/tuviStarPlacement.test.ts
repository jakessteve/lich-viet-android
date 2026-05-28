import { describe, it, expect } from 'vitest';
import {
  calculateMenhCungPosition,
  calculateThanCungPosition,
  calculateMenhCan,
  calculateCuc,
  calculateHanContext,
  placeTuViStar,
  placeChinhTinh,
  placePhuTinh,
  calculateTuHoa,
  calculatePalaceCans,
  generateChart,
} from '../../src/services/tuvi/starPlacement';
import starBrightnessData from '../../src/data/tuvi/starBrightness.json';

const TAN_BIEN_MAIN_STAR_BRIGHTNESS = {
  'Tử Vi': ['Bình', 'Đắc', 'Miếu', 'Bình', 'Vượng', 'Miếu', 'Miếu', 'Đắc', 'Miếu', 'Bình', 'Vượng', 'Bình'],
  'Liêm Trinh': ['Vượng', 'Đắc', 'Vượng', 'Hãm', 'Miếu', 'Hãm', 'Vượng', 'Đắc', 'Vượng', 'Hãm', 'Miếu', 'Hãm'],
  'Thái Dương': ['Hãm', 'Đắc', 'Vượng', 'Vượng', 'Vượng', 'Miếu', 'Miếu', 'Đắc', 'Hãm', 'Hãm', 'Hãm', 'Hãm'],
  'Thiên Phủ': ['Miếu', 'Bình', 'Miếu', 'Bình', 'Vượng', 'Đắc', 'Miếu', 'Đắc', 'Miếu', 'Bình', 'Vượng', 'Đắc'],
  'Thái Âm': ['Vượng', 'Đắc', 'Hãm', 'Hãm', 'Hãm', 'Hãm', 'Hãm', 'Đắc', 'Vượng', 'Miếu', 'Miếu', 'Miếu'],
  'Thất Sát': ['Miếu', 'Đắc', 'Miếu', 'Hãm', 'Hãm', 'Vượng', 'Miếu', 'Đắc', 'Miếu', 'Hãm', 'Hãm', 'Vượng'],
  'Phá Quân': ['Miếu', 'Vượng', 'Hãm', 'Hãm', 'Đắc', 'Hãm', 'Miếu', 'Vượng', 'Hãm', 'Hãm', 'Đắc', 'Hãm'],
} as const;

describe('Star Placement Engine', () => {
  describe('calculateMenhCungPosition', () => {
    it('should return correct position for month 1, hour Tý', () => {
      // Month 1, hour Tý (0): (2 + 1 - 1 - 0) % 12 = 2 (Dần)
      expect(calculateMenhCungPosition(1, 0)).toBe(2);
    });

    it('should return correct position for month 5, hour Ngọ', () => {
      // Month 5, hour Ngọ (6): (2 + 5 - 1 - 6 + 12) % 12 = 0 (Tý)
      expect(calculateMenhCungPosition(5, 6)).toBe(0);
    });

    it('should return correct position for month 12, hour Hợi', () => {
      // Month 12, hour Hợi (11): (2 + 12 - 1 - 11 + 12) % 12 = 2 (Dần)
      expect(calculateMenhCungPosition(12, 11)).toBe(2);
    });

    it('should handle all 12 hour branches for month 1', () => {
      for (let h = 0; h < 12; h++) {
        const pos = calculateMenhCungPosition(1, h);
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      }
    });
  });

  describe('calculateThanCungPosition', () => {
    it('should return correct position for menh at Dần, month 1', () => {
      // Thân = (2 + 1 - 1) % 12 = 2 (Dần) — same as Mệnh
      expect(calculateThanCungPosition(2, 1, 0)).toBe(2);
    });

    it('should count Thân from Dần forward by month and hour', () => {
      // Month 5, hour Thìn: Dần + 4 + 4 = Tuất
      expect(calculateThanCungPosition(2, 5, 4)).toBe(10);
    });
  });

  describe('calculateCuc', () => {
    it('should return Kim Tứ Cục for Giáp Tý by Thiên Lương cục arithmetic', () => {
      const result = calculateCuc(0, 0);
      expect(result.name).toBe('Kim Tứ Cục');
      expect(result.number).toBe(4);
    });

    it('should return Thủy Nhị Cục for Bính Ngọ', () => {
      const result = calculateCuc(2, 6);
      expect(result.name).toBe('Thủy Nhị Cục');
      expect(result.number).toBe(2);
    });

    it('matches the Thiên Lương sample Mậu Dần Mệnh as Thổ Ngũ Cục', () => {
      const result = calculateCuc(4, 2);
      expect(result.name).toBe('Thổ Ngũ Cục');
      expect(result.number).toBe(5);
    });
  });

  describe('placeTuViStar', () => {
    it('should place Tử Vi at Sửu for Cục 2, day 1', () => {
      expect(placeTuViStar(2, 1)).toBe(1);
    });

    it('should place Tử Vi at Dần for Cục 2, day 3', () => {
      // Day 3 needs one borrowed count, so it returns to Dần in the Thiên Lương table.
      expect(placeTuViStar(2, 3)).toBe(2);
    });

    it('should place Tử Vi by quotient plus odd/even borrowed count', () => {
      expect(placeTuViStar(3, 1)).toBe(4);
      expect(placeTuViStar(3, 2)).toBe(1);
      expect(placeTuViStar(3, 3)).toBe(2);
      expect(placeTuViStar(3, 4)).toBe(5);
    });

    it('matches the Thiên Lương sample Thổ Ngũ Cục day 25 at Ngọ', () => {
      expect(placeTuViStar(5, 25)).toBe(6);
    });
  });

  describe('placeChinhTinh', () => {
    it('should place all 14 Chính Tinh', () => {
      const positions = placeChinhTinh(2); // Tử Vi at Dần
      const allStars = Object.keys(positions);
      expect(allStars).toHaveLength(14);
      // Tử Vi group
      expect(positions['Tử Vi']).toBeDefined();
      expect(positions['Tử Vi']![0]).toBe(2);
      expect(positions['Thiên Cơ']).toBeDefined();
      expect(positions['Thái Dương']).toBeDefined();
      expect(positions['Vũ Khúc']).toBeDefined();
      expect(positions['Thiên Đồng']).toBeDefined();
      expect(positions['Liêm Trinh']).toBeDefined();
      // Thiên Phủ group
      expect(positions['Thiên Phủ']).toBeDefined();
      expect(positions['Thái Âm']).toBeDefined();
      expect(positions['Tham Lang']).toBeDefined();
      expect(positions['Cự Môn']).toBeDefined();
      expect(positions['Thiên Tướng']).toBeDefined();
      expect(positions['Thiên Lương']).toBeDefined();
      expect(positions['Thất Sát']).toBeDefined();
      expect(positions['Phá Quân']).toBeDefined();
    });

    it('should mirror Thiên Phủ correctly across Dần-Thân axis', () => {
      // When Tử Vi is at Dần (2), Thiên Phủ is also at Dần in this table.
      const positions = placeChinhTinh(2);
      expect(positions['Thiên Phủ']![0]).toBe(2);
    });

    it('should mirror Thiên Phủ correctly when Tử Vi is at Ngọ', () => {
      // When Tử Vi is at Ngọ (6), Thiên Phủ should be at Tuất (10)
      const positions = placeChinhTinh(6);
      expect(positions['Thiên Phủ']![0]).toBe(10);
      expect(positions['Thái Dương']![0]).toBe(3);
      expect(positions['Vũ Khúc']![0]).toBe(2);
      expect(positions['Thiên Đồng']![0]).toBe(1);
    });
  });

  describe('calculatePalaceCans', () => {
    it('should assign correct Cans for Giáp year', () => {
      // Giáp year: Dần starts with Bính (2)
      const cans = calculatePalaceCans(0); // Giáp
      expect(cans[2]).toBe(2); // Dần = Bính
      expect(cans[3]).toBe(3); // Mão = Đinh
      expect(cans[4]).toBe(4); // Thìn = Mậu
    });

    it('should assign correct Cans for Ất year', () => {
      // Ất year: Dần starts with Mậu (4)
      const cans = calculatePalaceCans(1); // Ất
      expect(cans[2]).toBe(4); // Dần = Mậu
      expect(cans[3]).toBe(5); // Mão = Kỷ
    });
  });

  describe('star brightness table', () => {
    it('keeps key main-star rows aligned to Tử Vi Đẩu Số Tân Biên', () => {
      for (const [starName, expectedBrightness] of Object.entries(TAN_BIEN_MAIN_STAR_BRIGHTNESS)) {
        expect(starBrightnessData.brightness[starName as keyof typeof starBrightnessData.brightness]).toEqual(
          expectedBrightness,
        );
      }
    });
  });

  describe('placePhuTinh Thiên Lương Kình Đà', () => {
    it('places Hỏa Tinh and Linh Tinh from the classical year-branch and hour tables', () => {
      const positions = placePhuTinh(9, 11, 11, 13, 9, 0, 0, 'Thuận');

      expect(positions['Hỏa Tinh']).toBe(6); // Ngọ
      expect(positions['Linh Tinh']).toBe(7); // Mùi
    });

    it('places Lưu Hà by the classical year-can table', () => {
      const expectations: Array<[number, number]> = [
        [0, 9], // Giáp → Dậu
        [1, 10], // Ất → Tuất
        [2, 7], // Bính → Mùi
        [3, 4], // Đinh → Thìn
        [4, 5], // Mậu → Tỵ
        [5, 6], // Kỷ → Ngọ
        [6, 8], // Canh → Thân
        [7, 3], // Tân → Mão
        [8, 11], // Nhâm → Hợi
        [9, 2], // Quý → Dần
      ];

      for (const [yearCanIndex, expectedPosition] of expectations) {
        const positions = placePhuTinh(yearCanIndex, 0, 1, 1, 0, 0, 0, 'Thuận');
        expect(positions['Lưu Hà']).toBe(expectedPosition);
      }
    });

    it('places Kình Đà by the Lộc Tồn direction for Thuận charts', () => {
      const positions = placePhuTinh(6, 8, 6, 25, 4, 2, 10, 'Thuận');

      expect(positions['Lộc Tồn']).toBe(8); // Canh: Thân
      expect(positions['Kình Dương']).toBe(9); // Dậu
      expect(positions['Đà La']).toBe(7); // Mùi
    });

    it('reverses Kình Đà for Nghịch charts in the Thiên Lương school', () => {
      const positions = placePhuTinh(6, 8, 6, 25, 4, 2, 10, 'Nghịch');

      expect(positions['Lộc Tồn']).toBe(8); // Canh: Thân
      expect(positions['Kình Dương']).toBe(7); // Mùi
      expect(positions['Đà La']).toBe(9); // Dậu
    });

    it('keeps Kình Đà fixed for traditional Nam phái', () => {
      const positions = placePhuTinh(6, 8, 6, 25, 4, 2, 10, 'Nghịch', 'nam-phai');

      expect(positions['Lộc Tồn']).toBe(8);
      expect(positions['Kình Dương']).toBe(9);
      expect(positions['Đà La']).toBe(7);
    });

    it('uses Bắc phái Khôi Việt anchors for Canh year', () => {
      const positions = placePhuTinh(6, 8, 6, 25, 4, 2, 10, 'Thuận', 'bac-phai');

      expect(positions['Thiên Khôi']).toBe(1);
      expect(positions['Thiên Việt']).toBe(7);
    });
  });

  describe('school-specific Tứ Hóa', () => {
    it('keeps Toàn Thư Tứ Hóa for Nam phái and Thiên Lương', () => {
      expect(calculateTuHoa(6, 'nam-phai').Khoa.starName).toBe('Thái Âm');
      expect(calculateTuHoa(6, 'thien-luong').Khoa.starName).toBe('Thái Âm');
    });

    it('uses Trung Châu disputed stems for Bắc phái', () => {
      expect(calculateTuHoa(4, 'bac-phai').Khoa.starName).toBe('Thái Dương');
      expect(calculateTuHoa(6, 'bac-phai').Khoa.starName).toBe('Thiên Phủ');
      expect(calculateTuHoa(8, 'bac-phai').Khoa.starName).toBe('Thiên Phủ');
    });
  });

  describe('generateChart Thiên Lương regression', () => {
    it('matches the thienluong.net sample anchors for 1980-07-07 07:07 male', () => {
      const chart = generateChart({
        name: 'Nguyen Van A',
        solarDate: new Date(1980, 6, 7, 7, 7),
        birthHour: 4,
        birthClockHour: 7,
        birthMinute: 7,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      expect(chart.centerInfo.canChiYear).toBe('Canh Thân');
      expect(chart.centerInfo.canChiMonth).toBe('Nhâm Ngọ');
      expect(chart.centerInfo.canChiDay).toBe('Tân Tỵ');
      expect(chart.centerInfo.canChiHour).toBe('Nhâm Thìn');
      expect(chart.centerInfo.menhNapAm).toBe('Thạch Lựu Mộc');
      expect(chart.centerInfo.cuc).toBe('Thổ Ngũ Cục');
      expect(chart.centerInfo.schoolLabel).toBe('Thiên Lương');
      expect(chart.centerInfo.thanCungLabel).toBe('Thân cư Tài Bạch');

      const byChi = new Map(chart.palaces.map((palace) => [palace.chi, palace]));
      expect(byChi.get('Dần')?.name).toBe('Mệnh');
      expect(byChi.get('Dần')?.canChi).toBe('Mậu Dần');
      expect(byChi.get('Dần')?.chinhTinh.map((star) => star.name)).toEqual(['Vũ Khúc', 'Thiên Tướng']);
      expect(byChi.get('Dần')?.brightness['Vũ Khúc']).toBe('Vượng');
      expect(byChi.get('Dần')?.brightness['Thiên Tướng']).toBe('Miếu');
      expect(byChi.get('Ngọ')?.name).toBe('Quan Lộc');
      expect(byChi.get('Ngọ')?.chinhTinh.map((star) => star.name)).toEqual(['Tử Vi']);
      expect(byChi.get('Ngọ')?.chinhTinh.find((star) => star.name === 'Tử Vi')?.nguHanh).toBe('Dương Thổ');
      expect(byChi.get('Ngọ')?.brightness['Tử Vi']).toBe('Miếu');
      expect(byChi.get('Ngọ')?.brightness['Hỏa Tinh']).toBe('Đắc');
      expect(byChi.get('Ngọ')?.brightness['Văn Xương']).toBe('Bình');
      expect(
        chart.palaces.flatMap((palace) => palace.chinhTinh).find((star) => star.name === 'Cự Môn')?.nguHanh,
      ).toBe('Âm Thủy');
      expect(
        chart.palaces.flatMap((palace) => palace.chinhTinh).find((star) => star.name === 'Thiên Lương')?.nguHanh,
      ).toBe('Âm Mộc');
      expect(byChi.get('Dậu')?.brightness['Kình Dương']).toBe('Hãm');
      expect(byChi.get('Mùi')?.brightness['Đà La']).toBe('Đắc');
      expect(byChi.get('Tý')?.hasTuan).toBe(true);
      expect(byChi.get('Sửu')?.hasTuan).toBe(true);
      expect(byChi.get('Ngọ')?.hasTriet).toBe(true);
      expect(byChi.get('Mùi')?.hasTriet).toBe(true);
      expect(byChi.get('Tuất')?.isThan).toBe(true);
      expect(byChi.get('Tuất')?.chinhTinh.map((star) => star.name)).toEqual(['Liêm Trinh', 'Thiên Phủ']);
    });

    it('starts Đại Hạn from Mệnh for female charts as well', () => {
      const chart = generateChart({
        name: 'Nguyen Van B',
        solarDate: new Date(1980, 6, 7, 7, 7),
        birthHour: 4,
        birthClockHour: 7,
        birthMinute: 7,
        gender: 'nữ',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      expect(chart.palaces.find((palace) => palace.isMenh)?.daiHanAgeRange).toBe('5–14');
      expect(chart.palaces.find((palace) => palace.isThan)?.daiHanAgeRange).not.toBe('5–14');

      const byChi = new Map(chart.palaces.map((palace) => [palace.chi, palace]));
      expect(byChi.get('Mùi')?.satTinh.map((star) => star.name)).toContain('Kình Dương');
      expect(byChi.get('Dậu')?.satTinh.map((star) => star.name)).toContain('Đà La');
    });

    it('derives the active hạn context from the selected year and month', () => {
      const chart = generateChart({
        name: 'Nguyen Van A',
        solarDate: new Date(1980, 6, 7, 7, 7),
        birthHour: 4,
        birthClockHour: 7,
        birthMinute: 7,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      const han = calculateHanContext(chart, 2026, 5);

      expect(han.viewYear).toBe(2026);
      expect(han.viewMonth).toBe(5);
      expect(han.viewAge).toBe(47);
      expect(han.daiHanPalaceIndex).toBe(chart.palaces.find((palace) => palace.name === 'Quan Lộc')?.id ?? null);
      expect(han.daiHanPalaceName).toBe('Quan Lộc');
      expect(han.daiHanAgeRange).toBe('45–54');
    });

    it('places Nguyệt Hạn months across all 12 palaces from Tiểu Hạn', () => {
      const chart = generateChart({
        name: 'Reference month sample',
        solarDate: new Date(1983, 10, 13, 18, 30),
        birthHour: 9,
        birthClockHour: 18,
        birthMinute: 30,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      const han = calculateHanContext(chart, 2026, 5);

      expect(han.tieuHanPalaceIndex).toBe(8);
      expect(han.nguyetHanPalaceIndex).toBe(0);
      expect(han.nguyetHanMonthByPalace).toMatchObject({
        8: 1,
        9: 2,
        10: 3,
        11: 4,
        0: 5,
        1: 6,
        2: 7,
        3: 8,
        4: 9,
        5: 10,
        6: 11,
        7: 12,
      });
    });

    it('keeps restored non-major stars for 1983-11-13 18:30 male', () => {
      const chart = generateChart({
        name: 'Cohoc sample',
        solarDate: new Date(1983, 10, 13, 18, 30),
        birthHour: 9,
        birthClockHour: 18,
        birthMinute: 30,
        gender: 'nam',
        timezone: 'Asia/Ho_Chi_Minh',
      });

      expect(chart.engineMeta?.version).toBe('accuracy-v4');
      expect(chart.combinations.filter((combination) => combination.id === 'giap-sat')).toHaveLength(2);

      const byChi = new Map(chart.palaces.map((palace) => [palace.chi, palace]));
      expect(byChi.get('Tý')?.brightness['Thiên Đồng']).toBe('Vượng');
      expect(byChi.get('Tý')?.brightness['Thái Âm']).toBe('Vượng');
      expect(byChi.get('Sửu')?.brightness['Vũ Khúc']).toBe('Miếu');
      expect(byChi.get('Sửu')?.brightness['Tham Lang']).toBe('Miếu');
      expect(byChi.get('Sửu')?.brightness['Văn Xương']).toBe('Đắc');
      expect(byChi.get('Sửu')?.brightness['Văn Khúc']).toBe('Đắc');
      expect(byChi.get('Dần')?.brightness['Thái Dương']).toBe('Vượng');
      expect(byChi.get('Dần')?.brightness['Cự Môn']).toBe('Vượng');
      expect(byChi.get('Dần')?.brightness['Địa Không']).toBe('Đắc');
      expect(byChi.get('Mão')?.brightness['Thiên Tướng']).toBe('Hãm');
      expect(byChi.get('Mão')?.brightness['Đại Hao']).toBe('Đắc');
      expect(byChi.get('Thìn')?.brightness['Thiên Cơ']).toBe('Miếu');
      expect(byChi.get('Thìn')?.brightness['Thiên Lương']).toBe('Miếu');
      expect(byChi.get('Tỵ')?.brightness['Tử Vi']).toBe('Miếu');
      expect(byChi.get('Tỵ')?.brightness['Thất Sát']).toBe('Vượng');
      expect(byChi.get('Tỵ')?.brightness['Thiên Mã']).toBe('Đắc');
      expect(byChi.get('Ngọ')?.brightness['Hỏa Tinh']).toBe('Đắc');
      expect(byChi.get('Ngọ')?.brightness['Thiên Hình']).toBe('Hãm');
      expect(byChi.get('Mùi')?.brightness['Linh Tinh']).toBe('Hãm');
      expect(byChi.get('Mùi')?.brightness['Thiên Khốc']).toBe('Đắc');
      expect(byChi.get('Thân')?.brightness['Địa Kiếp']).toBe('Đắc');
      expect(byChi.get('Dậu')?.brightness['Liêm Trinh']).toBe('Hãm');
      expect(byChi.get('Dậu')?.brightness['Phá Quân']).toBe('Hãm');
      expect(byChi.get('Dậu')?.brightness['Tiểu Hao']).toBe('Đắc');
      expect(byChi.get('Tuất')?.brightness['Thiên Diêu']).toBe('Đắc');
      expect(byChi.get('Hợi')?.brightness['Thiên Phủ']).toBe('Đắc');

      const allAuxStarNames = chart.palaces.flatMap((palace) => [
        ...palace.phuTinh.map((star) => star.name),
        ...palace.satTinh.map((star) => star.name),
      ]);
      expect(allAuxStarNames).toContain('Cô Thần');
      expect(allAuxStarNames).toContain('Lưu Hà');
      expect(allAuxStarNames).toContain('Phong Cáo');
      expect(allAuxStarNames).toContain('Đẩu Quân');
      expect(allAuxStarNames).toContain('Bạch Hổ');
      expect(allAuxStarNames).not.toContain('Thiên Đức Q.N');
      expect(allAuxStarNames).not.toContain('Nguyệt Đức Q.N');
      expect(chart.palaces.every((palace) => palace.rings?.truongSinh)).toBe(true);
    });

    it('allows a dense palace with 19 non-major labels and 21 total labels', () => {
      const yearCanIndex = 7; // Tân
      const yearChiIndex = 7; // Mùi
      const lunarMonth = 2;
      const lunarDay = 2;
      const hourBranch = 2; // Dần
      const thuanNghich = 'Thuận' as const;
      const school = 'nam-phai' as const;

      const menhPosition = calculateMenhCungPosition(lunarMonth, hourBranch);
      const thanPosition = calculateThanCungPosition(menhPosition, lunarMonth, hourBranch);
      const menhCanIndex = calculateMenhCan(yearCanIndex, menhPosition);
      const cuc = calculateCuc(menhCanIndex, menhPosition);
      const tuViPosition = placeTuViStar(cuc.number, lunarDay);
      const chinhMap = placeChinhTinh(tuViPosition);
      const phuMap = placePhuTinh(
        yearCanIndex,
        yearChiIndex,
        lunarMonth,
        lunarDay,
        hourBranch,
        menhPosition,
        thanPosition,
        thuanNghich,
        school,
      );
      const tuHoaRaw = calculateTuHoa(yearCanIndex, school);

      const allStarPositions: Record<string, number> = {};
      for (const [name, positions] of Object.entries(chinhMap)) {
        allStarPositions[name] = positions[0];
      }
      Object.assign(allStarPositions, phuMap);

      const counts = Array.from({ length: 12 }, (_, palaceIndex) => {
        const main = Object.values(chinhMap).reduce((sum, positions) => sum + positions.filter((pos) => pos === palaceIndex).length, 0);
        const nonMajorBase = Object.values(phuMap).filter((pos) => pos === palaceIndex).length;
        const tuHoaCount = Object.values(tuHoaRaw).filter((entry) => allStarPositions[entry.starName] === palaceIndex).length;
        return {
          chi: palaceIndex,
          main,
          nonMajor: nonMajorBase + tuHoaCount,
          total: main + nonMajorBase + tuHoaCount,
        };
      });

      const densest = counts.reduce((current, next) => (next.nonMajor > current.nonMajor ? next : current));

      expect(densest.chi).toBe(8); // Thân
      expect(densest.nonMajor).toBe(19);
      expect(densest.total).toBe(21);
      expect(densest.main).toBe(2);
    });
  });
});
