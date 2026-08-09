import test from "node:test";
import assert from "node:assert/strict";

import {
  STAR_COLORS,
  getStarColor,
  getTrietPositions,
  getTuanPositions,
  calculateDaiHanAgeRanges,
  calculateTieuHanPalaceIndex,
  calculateTieuHanAgesForPalace,
  calculateNguyetHanPalaces,
  getHourBranch,
  resolveTuViBirthContext,
  createTuViStarChart
} from "../src/index.js";

test("STAR_COLORS and getStarColor function correctly mapping elements to cohoc.net design colors", () => {
  assert.equal(STAR_COLORS.kim, "#8a8a8a");
  assert.equal(STAR_COLORS.moc, "#2e9730");
  assert.equal(STAR_COLORS.thuy, "#161617");
  assert.equal(STAR_COLORS.hoa, "#da2828");
  assert.equal(STAR_COLORS.tho, "#c28b08");

  assert.equal(getStarColor("kim"), "#8a8a8a");
  assert.equal(getStarColor("MOC"), "#2e9730");
  assert.equal(getStarColor("Thuy"), "#161617");
  assert.equal(getStarColor("HOA"), "#da2828");
  assert.equal(getStarColor("Tho"), "#c28b08");
  assert.equal(getStarColor("unknown"), null);
  assert.equal(getStarColor(123), null);
});

test("getTrietPositions returns the correct two Chi indices based on Can index or name", () => {
  // Giáp (0) / Kỷ (5) -> [8, 9] (Thân, Dậu)
  assert.deepEqual(getTrietPositions(0), [8, 9]);
  assert.deepEqual(getTrietPositions("Giáp"), [8, 9]);
  assert.deepEqual(getTrietPositions("Kỷ"), [8, 9]);

  // Bính (2) / Tân (7) -> [4, 5] (Thìn, Tỵ)
  assert.deepEqual(getTrietPositions(2), [4, 5]);
  assert.deepEqual(getTrietPositions("Bính"), [4, 5]);

  // Quý (9) -> [0, 1] (Tý, Sửu)
  assert.deepEqual(getTrietPositions(9), [0, 1]);
  assert.deepEqual(getTrietPositions("Quý"), [0, 1]);

  // Invalid inputs
  assert.throws(() => getTrietPositions(-1), TypeError);
  assert.throws(() => getTrietPositions("InvalidCan"), TypeError);
  assert.throws(() => getTrietPositions(10), TypeError);
});

test("getTuanPositions returns correct empty branch positions via decade formula", () => {
  // Giáp Tý (Can=0, Chi=0): diff = 0 -> [(0-2+12)%12, (0-1+12)%12] = [10, 11] (Tuất, Hợi)
  assert.deepEqual(getTuanPositions(0, 0), [10, 11]);
  assert.deepEqual(getTuanPositions("Giáp", "Tý"), [10, 11]);

  // Giáp Tuất (Can=0, Chi=10): diff = 10 -> [8, 9] (Thân, Dậu)
  assert.deepEqual(getTuanPositions("Giáp", "Tuất"), [8, 9]);

  // Bính Tý (Can=2, Chi=0): diff = (0 - 2 + 12) % 12 = 10 -> decade Giáp Tuất -> [8, 9]
  assert.deepEqual(getTuanPositions("Bính", "Tý"), [8, 9]);

  // Invalid inputs
  assert.throws(() => getTuanPositions("Giáp", "InvalidChi"), TypeError);
  assert.throws(() => getTuanPositions(11, 0), TypeError);
  assert.throws(() => getTuanPositions(0, 12), TypeError);
});

test("calculateDaiHanAgeRanges calculates 10-year major cycle boundaries correctly", () => {
  // Dương Nam / Âm Nữ: Clockwise
  // cucNumber=2, menhPalaceIndex=2 (Dần), male (nam), yearCan="Giáp" (0, even -> Dương) -> Dương Nam -> Clockwise (step=1)
  const cwRanges = calculateDaiHanAgeRanges({
    cucNumber: 2,
    gender: "nam",
    yearCan: "Giáp",
    menhPalaceIndex: 2
  });

  assert.equal(cwRanges.length, 12);
  assert.deepEqual(cwRanges[2], { startAge: 2, endAge: 11, rangeString: "2–11" });  // Mệnh
  assert.deepEqual(cwRanges[3], { startAge: 12, endAge: 21, rangeString: "12–21" }); // Phụ Mẫu
  assert.deepEqual(cwRanges[4], { startAge: 22, endAge: 31, rangeString: "22–31" }); // Phúc Đức
  assert.deepEqual(cwRanges[1], { startAge: 112, endAge: 121, rangeString: "112–121" }); // Huynh Đệ

  // Âm Nam / Dương Nữ: Counter-Clockwise
  // cucNumber=5, menhPalaceIndex=4 (Thìn), female (nữ), yearCan="Giáp" (0, even -> Dương) -> Dương Nữ -> Counter-Clockwise (step=-1)
  const ccwRanges = calculateDaiHanAgeRanges({
    cucNumber: 5,
    gender: "nữ",
    yearCan: "Giáp",
    menhPalaceIndex: 4
  });

  assert.deepEqual(ccwRanges[4], { startAge: 5, endAge: 14, rangeString: "5–14" });   // Mệnh
  assert.deepEqual(ccwRanges[3], { startAge: 15, endAge: 24, rangeString: "15–24" }); // Huynh Đệ
  assert.deepEqual(ccwRanges[2], { startAge: 25, endAge: 34, rangeString: "25–34" }); // Phu Thê
  assert.deepEqual(ccwRanges[5], { startAge: 115, endAge: 124, rangeString: "115–124" }); // Phụ Mẫu

  // Âm Nữ: Clockwise
  const yinFemaleRanges = calculateDaiHanAgeRanges({
    cucNumber: 3,
    gender: "nữ",
    yearCan: "Ất",
    menhPalaceIndex: 6
  });

  assert.deepEqual(yinFemaleRanges[6], { startAge: 3, endAge: 12, rangeString: "3–12" });
  assert.deepEqual(yinFemaleRanges[7], { startAge: 13, endAge: 22, rangeString: "13–22" });
  assert.deepEqual(yinFemaleRanges[5], { startAge: 113, endAge: 122, rangeString: "113–122" });

  // Âm Nam: Counter-Clockwise
  const yinMaleRanges = calculateDaiHanAgeRanges({
    cucNumber: 3,
    gender: "nam",
    yearCan: "Ất",
    menhPalaceIndex: 6
  });

  assert.deepEqual(yinMaleRanges[6], { startAge: 3, endAge: 12, rangeString: "3–12" });
  assert.deepEqual(yinMaleRanges[5], { startAge: 13, endAge: 22, rangeString: "13–22" });
  assert.deepEqual(yinMaleRanges[7], { startAge: 113, endAge: 122, rangeString: "113–122" });

  // Edge cases and error handling
  assert.throws(() => calculateDaiHanAgeRanges({ cucNumber: 1, gender: "nam", yearCan: "Giáp", menhPalaceIndex: 2 }), RangeError);
  assert.throws(() => calculateDaiHanAgeRanges({ cucNumber: 3, gender: "invalid", yearCan: "Giáp", menhPalaceIndex: 2 }), TypeError);
  assert.throws(() => calculateDaiHanAgeRanges({ cucNumber: 3, gender: "nam", yearCan: "invalid", menhPalaceIndex: 2 }), TypeError);
  assert.throws(() => calculateDaiHanAgeRanges({ cucNumber: 3, gender: "nam", yearCan: "Giáp", menhPalaceIndex: 12 }), RangeError);
});

test("calculateTieuHanPalaceIndex resolves the correct palace index for a given view year", () => {
  // Male born in Ngọ (6) -> group 2 (Dần/Ngọ/Tuất) -> anchor = 4 (Thìn).
  // View year 2026 (Bính Ngọ -> Chi index 6).
  // Offset = (6 - 6) = 0 -> male direction = 1 -> tieuHan = 4 (Thìn)
  const p1 = calculateTieuHanPalaceIndex({
    birthYearChi: "Ngọ",
    gender: "nam",
    viewYear: 2026
  });
  assert.equal(p1, 4);

  // Female born in Ngọ (6) -> anchor = 4 (Thìn).
  // View year 2027 (Đinh Mùi -> Chi index 7).
  // Offset = (7 - 6) = 1 -> female direction = -1 -> tieuHan = (4 - 1) = 3 (Mão)
  const p2 = calculateTieuHanPalaceIndex({
    birthYearChi: "Ngọ",
    gender: "nữ",
    viewYear: 2027
  });
  assert.equal(p2, 3);

  // Male born in Tý (0) -> group 0 (Thân/Tý/Thìn) -> anchor = 10 (Tuất).
  // View year 2024 (Giáp Thìn -> Chi index 4).
  // Offset = (4 - 0) = 4 -> male direction = 1 -> tieuHan = (10 + 4) % 12 = 2 (Dần)
  const p3 = calculateTieuHanPalaceIndex({
    birthYearChi: "Tý",
    gender: "nam",
    viewYear: 2024
  });
  assert.equal(p3, 2);

  // Errors
  assert.throws(() => calculateTieuHanPalaceIndex({ birthYearChi: "invalid", gender: "nam", viewYear: 2026 }), TypeError);
  assert.throws(() => calculateTieuHanPalaceIndex({ birthYearChi: "Tý", gender: "invalid", viewYear: 2026 }), TypeError);
});

test("calculateTieuHanAgesForPalace computes age lists for a given target palace", () => {
  // Male born in Ngọ (6) -> anchor = 4 (Thìn), direction = 1
  // Target palace 4 (Thìn): Diff = 1 * (4 - 4) = 0 -> baseAge = 1 -> ages: 1, 13, 25, 37...
  const ages1 = calculateTieuHanAgesForPalace({
    birthYearChi: "Ngọ",
    gender: "nam",
    palaceIndex: 4,
    maxAge: 40
  });
  assert.deepEqual(ages1, [1, 13, 25, 37]);

  // Target palace 5 (Tỵ): Diff = 1 * (5 - 4) = 1 -> baseAge = 2 -> ages: 2, 14, 26, 38...
  const ages2 = calculateTieuHanAgesForPalace({
    birthYearChi: "Ngọ",
    gender: "nam",
    palaceIndex: 5,
    maxAge: 40
  });
  assert.deepEqual(ages2, [2, 14, 26, 38]);

  // Female born in Ngọ (6) -> anchor = 4 (Thìn), direction = -1
  // Target palace 3 (Mão): Diff = -1 * (3 - 4) = 1 -> baseAge = 2 -> ages: 2, 14, 26...
  const ages3 = calculateTieuHanAgesForPalace({
    birthYearChi: "Ngọ",
    gender: "nữ",
    palaceIndex: 3,
    maxAge: 40
  });
  assert.deepEqual(ages3, [2, 14, 26, 38]);
});

test("calculateNguyetHanPalaces computes monthly Hạn mapping for months 1-12", () => {
  // tieuHanPalaceIndex = 4 (Thìn), birthMonth = 5, birthHour = 2 (Dần)
  // monthOnePalace = (4 - (5 - 1) + 2) % 12 = (4 - 4 + 2) % 12 = 2 (Dần)
  // result: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]
  const months = calculateNguyetHanPalaces({
    tieuHanPalaceIndex: 4,
    birthMonth: 5,
    birthHour: 2
  });

  assert.equal(months.length, 12);
  assert.equal(months[0], 2);  // Month 1 -> Dần (2)
  assert.equal(months[1], 3);  // Month 2 -> Mão (3)
  assert.equal(months[4], 6);  // Month 5 -> Ngọ (6)
  assert.equal(months[11], 1); // Month 12 -> Sửu (1)

  // Errors
  assert.throws(() => calculateNguyetHanPalaces({ tieuHanPalaceIndex: 12, birthMonth: 5, birthHour: 2 }), RangeError);
  assert.throws(() => calculateNguyetHanPalaces({ tieuHanPalaceIndex: 4, birthMonth: 13, birthHour: 2 }), RangeError);
  assert.throws(() => calculateNguyetHanPalaces({ tieuHanPalaceIndex: 4, birthMonth: 5, birthHour: -1 }), RangeError);
});

test("getHourBranch resolves clock hours to branch indices correctly", () => {
  assert.equal(getHourBranch(23), 0); // Tý
  assert.equal(getHourBranch(0), 0);  // Tý
  assert.equal(getHourBranch(1), 1);  // Sửu
  assert.equal(getHourBranch(2), 1);  // Sửu
  assert.equal(getHourBranch(3), 2);  // Dần
  assert.equal(getHourBranch(11), 6); // Ngọ
  assert.equal(getHourBranch(12), 6); // Ngọ
  assert.equal(getHourBranch(21), 11); // Hợi
  assert.equal(getHourBranch(22), 11); // Hợi

  // Wrapping
  assert.equal(getHourBranch(-1), 0); // 23 -> Tý
  assert.equal(getHourBranch(24), 0); // 0 -> Tý
  assert.equal(getHourBranch(25), 1); // 1 -> Sửu
});

test("resolveTuViBirthContext resolves time, offsets, true solar, and Dạ Tý day shifts correctly", () => {
  // Test case 1: Modern birth, no historical shift or day shift
  // 2026-05-30 at 10:30 AM
  const ctx1 = resolveTuViBirthContext({
    solarDate: "2026-05-30",
    birthClockHour: 10,
    birthMinute: 30,
    gender: "nam"
  });

  assert.equal(ctx1.offsetHours, 7.0);
  assert.equal(ctx1.isDayShifted, false);
  assert.equal(ctx1.hourBranchIndex, 5); // Tỵ (9:00 - 11:00)
  assert.equal(ctx1.correctedDate.getDate(), 30);
  assert.equal(ctx1.metaphysicalDate.getDate(), 30);

  // Test case 2: Dạ Tý birth (23:30), day shift expected
  // May 30th 23:30 -> metaphysical date should become May 31st, hour branch index 0 (Tý)
  const ctx2 = resolveTuViBirthContext({
    solarDate: "2026-05-30",
    birthClockHour: 23,
    birthMinute: 30,
    gender: "nam"
  });

  assert.equal(ctx2.isDayShifted, true);
  assert.equal(ctx2.hourBranchIndex, 0); // Tý
  assert.equal(ctx2.correctedDate.getDate(), 30);
  assert.equal(ctx2.metaphysicalDate.getDate(), 31);

  // Test case 3: South Vietnam historical timezone divergence (1965)
  // South Vietnam offset was +8.0. Normalizing to +7 should subtract 1 hour.
  // Birth at 12:30 PM (+8) -> shifts to 11:30 AM (+7)
  const ctx3 = resolveTuViBirthContext({
    solarDate: "1965-03-10",
    birthClockHour: 12,
    birthMinute: 30,
    gender: "nam",
    birthLocation: {
      locationName: "Sài Gòn",
      lat: 10.7,
      lng: 106.6,
      timezone: 8.0,
      countryCode: "VN",
      historicalRegion: "south"
    }
  });

  assert.equal(ctx3.offsetHours, 8.0);
  assert.equal(ctx3.correctedDate.getHours(), 11);
  assert.equal(ctx3.correctedDate.getMinutes(), 30);
  assert.equal(ctx3.hourBranchIndex, 6); // Ngọ (11:00 - 13:00)

  // Test case 4: North Vietnam historical timezone divergence (1965)
  // North Vietnam offset was +7.0. No correction.
  const ctx4 = resolveTuViBirthContext({
    solarDate: "1965-03-10",
    birthClockHour: 12,
    birthMinute: 30,
    gender: "nam",
    birthLocation: {
      locationName: "Hà Nội",
      lat: 21.0,
      lng: 105.8,
      timezone: 7.0,
      countryCode: "VN",
      historicalRegion: "north"
    }
  });

  assert.equal(ctx4.offsetHours, 7.0);
  assert.equal(ctx4.correctedDate.getHours(), 12);
  assert.equal(ctx4.correctedDate.getMinutes(), 30);

  // Test case 5: True solar time correction
  // Location: 105.8° E. Standard meridian for +7 is 105.0° E.
  // Diff = (105.8 - 105.0) * 4 = +3.2 minutes.
  // Birth clock 12:30 -> True solar time 12:33:12
  const ctx5 = resolveTuViBirthContext({
    solarDate: "2026-05-30",
    birthClockHour: 12,
    birthMinute: 30,
    gender: "nam",
    birthLocation: {
      locationName: "Hà Nội",
      lat: 21.0,
      lng: 105.8,
      timezone: 7.0
    },
    timePolicy: "true-solar"
  });

  assert.ok(Math.abs(ctx5.trueSolarCorrectionMinutes - 3.2) < 1e-9);
  assert.equal(ctx5.correctedDate.getHours(), 12);
  assert.equal(ctx5.correctedDate.getMinutes(), 33);
});

test("resolveTuViBirthContext uses PRD-aligned Vietnam LMT before 1911", () => {
  const pre1906 = resolveTuViBirthContext({
    solarDate: "1906-06-30",
    birthClockHour: 12,
    birthMinute: 0,
    gender: "nam",
    birthLocation: {
      locationName: "Hà Nội",
      lat: 21.0,
      lng: 105.8,
      countryCode: "VN"
    }
  });
  const post1906 = resolveTuViBirthContext({
    solarDate: "1906-07-01",
    birthClockHour: 12,
    birthMinute: 0,
    gender: "nam",
    birthLocation: {
      locationName: "Sài Gòn",
      lat: 10.7,
      lng: 106.6,
      countryCode: "VN"
    }
  });
  const expectedOffset = 7 + 6 / 60 + 30 / 3600;

  assert.equal(Math.abs(pre1906.offsetHours - expectedOffset) < 1e-12, true);
  assert.equal(Math.abs(post1906.offsetHours - expectedOffset) < 1e-12, true);
});

test("createTuViStarChart exposes v1-backed palaces, stars, and lineage profile", () => {
  const chart = createTuViStarChart({
    yearCanIndex: 9,
    yearChiIndex: 11,
    lunarMonth: 7,
    lunarDay: 15,
    birthHour: 4,
    gender: "male"
  });

  assert.equal(chart.status, "v1_backed_star_chart_ready");
  assert.equal(chart.palaces.length, 12);
  assert.equal(chart.lineageProfile.synthesisStatus, "bounded_lineage_profile_ready");
  assert.ok(chart.palaces.some((palace) => palace.chinhTinh.some((star) => star.name === "Tử Vi")));
  assert.ok(chart.palaces.some((palace) => palace.phuTinh.length > 0));
  assert.ok(chart.palaces.some((palace) => palace.satTinh.length > 0));
  assert.equal(chart.trietPositions.length, 2);
  assert.equal(chart.tuanPositions.length, 2);

  // Validate some specific star brightnesses
  // Find where Tử Vi is placed
  const tuViPalace = chart.palaces.find((p) => p.chinhTinh.some((star) => star.name === "Tử Vi"));
  assert.ok(tuViPalace);
  const tuViStar = tuViPalace.chinhTinh.find((star) => star.name === "Tử Vi");
  // Tử Vi at chi index has mapped brightness (e.g. Miếu, Vượng, Bình)
  assert.ok(["Miếu", "Vượng", "Bình"].includes(tuViStar.brightness));

  // Find where Kình Dương is placed
  const kinhDuongPalace = chart.palaces.find((p) => p.satTinh.some((star) => star.name === "Kình Dương") || p.phuTinh.some((star) => star.name === "Kình Dương"));
  assert.ok(kinhDuongPalace);
  const kinhDuongStar = [...kinhDuongPalace.phuTinh, ...kinhDuongPalace.satTinh].find((star) => star.name === "Kình Dương");
  assert.ok(["Miếu", "Hãm"].includes(kinhDuongStar.brightness));

  // Assert new metadata fields
  assert.equal(typeof chart.menhNapAm, "string");
  assert.ok(chart.menhNapAm.length > 0);
  assert.equal(typeof chart.saoChuCuc, "string");
  assert.ok(chart.saoChuCuc.length > 0);
  assert.equal(typeof chart.menhChu, "string");
  assert.ok(chart.menhChu.length > 0);
  assert.equal(typeof chart.thanChu, "string");
  assert.ok(chart.thanChu.length > 0);
  assert.equal(typeof chart.laiNhanCung, "string");
  assert.ok(chart.laiNhanCung.length > 0);
  assert.ok(chart.nguyenThan.length > 0);
});

test("createTuViStarChart uses correct Bắc Phái Tứ Hóa table for Canh and Nhâm", () => {
  // Test Canh year
  const canhChart = createTuViStarChart({
    yearCanIndex: 6, // Canh
    yearChiIndex: 6, // Ngọ
    lunarMonth: 1,
    lunarDay: 1,
    birthHour: 0,
    gender: "male",
    school: "bac-phai"
  });

  const canhHoaKhoa = canhChart.palaces.flatMap(p => p.tuHoa).find(t => t.type === "Khoa");
  assert.equal(canhHoaKhoa.starName, "Thái Âm");

  // Test Nhâm year
  const nhamChart = createTuViStarChart({
    yearCanIndex: 8, // Nhâm
    yearChiIndex: 10, // Tuất
    lunarMonth: 1,
    lunarDay: 1,
    birthHour: 0,
    gender: "male",
    school: "bac-phai"
  });

  const nhamHoaKhoa = nhamChart.palaces.flatMap(p => p.tuHoa).find(t => t.type === "Khoa");
  assert.equal(nhamHoaKhoa.starName, "Tả Phụ");
});

test("createTuViStarChart applies Kình/Đà reversal only for Thiên Lương school (Âm Nam / Dương Nữ)", () => {
  const commonInput = {
    yearCanIndex: 1, // Ất (Âm)
    yearChiIndex: 1, // Sửu
    lunarMonth: 1,
    lunarDay: 1,
    birthHour: 0,
    gender: "male", // Âm Nam -> Nghịch
  };

  const namPhaiChart = createTuViStarChart({ ...commonInput, school: "nam-phai" });
  const thienLuongChart = createTuViStarChart({ ...commonInput, school: "thien-luong" });

  const getPos = (chart, starName) => chart.palaces.findIndex(p => p.satTinh.some(s => s.name === starName) || p.phuTinh.some(s => s.name === starName));

  // Lộc Tồn của Ất là Mão (index 3)
  const locTonNamPhai = getPos(namPhaiChart, "Lộc Tồn");
  const locTonThienLuong = getPos(thienLuongChart, "Lộc Tồn");

  assert.equal(locTonNamPhai, 3);
  assert.equal(locTonThienLuong, 3);

  // Nam phái: Kình luôn = Lộc Tồn + 1 (4 - Thìn), Đà = Lộc Tồn - 1 (2 - Dần)
  assert.equal(getPos(namPhaiChart, "Kình Dương"), 4);
  assert.equal(getPos(namPhaiChart, "Đà La"), 2);

  // Thiên Lương (Âm Nam -> Lộc tồn đi nghịch, Kình/Đà đảo chiều): Kình = Lộc Tồn - 1 (2 - Dần), Đà = Lộc Tồn + 1 (4 - Thìn)
  assert.equal(getPos(thienLuongChart, "Kình Dương"), 2);
  assert.equal(getPos(thienLuongChart, "Đà La"), 4);
});

test("createTuViStarChart places Khôi tại Ngọ, Việt tại Dần for Canh and Tân in all schools", () => {
  const canhChart = createTuViStarChart({ yearCanIndex: 6, yearChiIndex: 0, lunarMonth: 1, lunarDay: 1, birthHour: 0, school: "thien-luong" });
  const tanChart = createTuViStarChart({ yearCanIndex: 7, yearChiIndex: 0, lunarMonth: 1, lunarDay: 1, birthHour: 0, school: "nam-phai" });

  const getPos = (chart, starName) => chart.palaces.findIndex(p => p.phuTinh.some(s => s.name === starName));

  assert.equal(getPos(canhChart, "Thiên Khôi"), 6); // Ngọ
  assert.equal(getPos(canhChart, "Thiên Việt"), 2); // Dần

  assert.equal(getPos(tanChart, "Thiên Khôi"), 6); // Ngọ
  assert.equal(getPos(tanChart, "Thiên Việt"), 2); // Dần
});

test("createTuViStarChart includes Địa Giải star correctly based on month", () => {
  // Month 1: Mùi (index 7)
  const chartM1 = createTuViStarChart({ yearCanIndex: 0, yearChiIndex: 0, lunarMonth: 1, lunarDay: 1, birthHour: 0 });
  const getPos = (chart, starName) => chart.palaces.findIndex(p => p.phuTinh.some(s => s.name === starName));
  
  assert.equal(getPos(chartM1, "Địa Giải"), 7);

  // Month 6: Tý (index 0) => Mùi (7) + 5 = 12 (0)
  const chartM6 = createTuViStarChart({ yearCanIndex: 0, yearChiIndex: 0, lunarMonth: 6, lunarDay: 1, birthHour: 0 });
  assert.equal(getPos(chartM6, "Địa Giải"), 0);
});
