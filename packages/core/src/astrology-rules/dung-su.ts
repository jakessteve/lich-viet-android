import { DiaChi, DIA_CHI_LIST } from './can-chi.js';

export interface DungSuResult {
  truc: string;
  trucMeaning: string;
  mansion28: string;
  mansionElement: string;
  nenActivities: string[];
  tranhActivities: string[];
  auspiciousScore: number; // 0 to 100
}

export const TRUC_12_LIST = [
  {
    name: 'Kiến',
    meaning: 'Khởi đầu, xuất hành, giá thú',
    good: ['Xuất hành', 'Cầu tài', 'Ký kết'],
    bad: ['Động thổ', 'An táng'],
  },
  {
    name: 'Trừ',
    meaning: 'Tẩy uế, giải trừ, chữa bệnh',
    good: ['Chữa bệnh', 'Tắm gội', 'Dọn dẹp'],
    bad: ['Cưới hỏi', 'Khai trương'],
  },
  {
    name: 'Mãn',
    meaning: 'Đầy đủ, cầu phúc, nhập trạch',
    good: ['Cầu tài', 'Khai trương', 'Nhập trạch'],
    bad: ['Chữa bệnh', 'Cho vay'],
  },
  {
    name: 'Bình',
    meaning: 'Bình ổn, tu bổ, san nền',
    good: ['Sửa chữa', 'San nền', 'Giao dịch'],
    bad: ['Đi thuyền', 'Tranh chấp'],
  },
  {
    name: 'Định',
    meaning: 'Đính ước, cầu an, gieo trồng',
    good: ['Đính hôn', 'Ký hợp đồng', 'Trồng trọt'],
    bad: ['Kiện tụng', 'Xuất hành xa'],
  },
  {
    name: 'Chấp',
    meaning: 'Bắt giữ, xây đắp, củng cố',
    good: ['Xây đắp', 'Thu nợ', 'Gia cố'],
    bad: ['Di chuyển', 'Khai trương'],
  },
  {
    name: 'Phá',
    meaning: 'Phá bỏ, dỡ nhà, giải tỏa',
    good: ['Dỡ nhà', 'Phá vỡ chướng ngại', 'Chữa bệnh'],
    bad: ['Cưới hỏi', 'Khai trương', 'Ký kết'],
  },
  {
    name: 'Nguy',
    meaning: 'Nguy nan, cẩn trọng hành sự',
    good: ['Cúng tế', 'Cầu an', 'Thiền định'],
    bad: ['Đi lại nguy hiểm', 'Leo núi', 'Đầu tư lớn'],
  },
  {
    name: 'Thành',
    meaning: 'Thành tựu, hôn lễ, khai trương',
    good: ['Khai trương', 'Cưới hỏi', 'Nhập học', 'Ký hợp đồng'],
    bad: ['Kiện tụng', 'Tranh chấp'],
  },
  {
    name: 'Thâu',
    meaning: 'Thu gom, thu hoạch, cất giữ',
    good: ['Thu hoạch', 'Cất trữ', 'Gom vốn'],
    bad: ['Tang lễ', 'Xuất kho'],
  },
  {
    name: 'Khai',
    meaning: 'Mở cửa, khởi công, giao thương',
    good: ['Khai trương', 'Động thổ', 'Xuất hành', 'Ký hợp đồng'],
    bad: ['An táng', 'Phá dỡ'],
  },
  {
    name: 'Bế',
    meaning: 'Đóng kín, bồi đắp, phòng thủ',
    good: ['Xây đập', 'Phòng thủ', 'Đắp đê'],
    bad: ['Khai trương', 'Cưới hỏi', 'Khởi công'],
  },
];

export const MANSIONS_28 = [
  { name: 'Giác', element: 'Mộc', nature: 'Tốt' },
  { name: 'Cang', element: 'Kim', nature: 'Xấu' },
  { name: 'Đê', element: 'Thổ', nature: 'Xấu' },
  { name: 'Phòng', element: 'Nhật', nature: 'Tốt' },
  { name: 'Tâm', element: 'Nguyệt', nature: 'Xấu' },
  { name: 'Vĩ', element: 'Hỏa', nature: 'Tốt' },
  { name: 'Cơ', element: 'Thủy', nature: 'Tốt' },
  { name: 'Đẩu', element: 'Mộc', nature: 'Tốt' },
  { name: 'Ngưu', element: 'Kim', nature: 'Xấu' },
  { name: 'Nữ', element: 'Thổ', nature: 'Xấu' },
  { name: 'Hư', element: 'Nhật', nature: 'Xấu' },
  { name: 'Nguy', element: 'Nguyệt', nature: 'Xấu' },
  { name: 'Thất', element: 'Hỏa', nature: 'Tốt' },
  { name: 'Bích', element: 'Thủy', nature: 'Tốt' },
  { name: 'Khuê', element: 'Mộc', nature: 'Xấu' },
  { name: 'Lâu', element: 'Kim', nature: 'Tốt' },
  { name: 'Vị', element: 'Thổ', nature: 'Tốt' },
  { name: 'Mão', element: 'Nhật', nature: 'Xấu' },
  { name: 'Tất', element: 'Nguyệt', nature: 'Tốt' },
  { name: 'Chủy', element: 'Hỏa', nature: 'Xấu' },
  { name: 'Sâm', element: 'Thủy', nature: 'Tốt' },
  { name: 'Tỉnh', element: 'Mộc', nature: 'Tốt' },
  { name: 'Quỷ', element: 'Kim', nature: 'Xấu' },
  { name: 'Liễu', element: 'Thổ', nature: 'Xấu' },
  { name: 'Tinh', element: 'Nhật', nature: 'Xấu' },
  { name: 'Trương', element: 'Nguyệt', nature: 'Tốt' },
  { name: 'Dực', element: 'Hỏa', nature: 'Tốt' },
  { name: 'Chẩn', element: 'Thủy', nature: 'Tốt' },
];

/**
 * Derives 12 Trực from lunar month and day branch.
 */
export function getTruc(
  lunarMonth: number,
  dayChi: DiaChi,
): { name: string; meaning: string; good: string[]; bad: string[] } {
  const monthStartChiIndex = (lunarMonth + 1) % 12;
  const dayChiIndex = DIA_CHI_LIST.indexOf(dayChi);
  const trucIndex = (dayChiIndex - monthStartChiIndex + 12) % 12;
  return TRUC_12_LIST[trucIndex]!;
}

/**
 * Derives 28 Mansions (Nhị Thập Bát Tú) from continuous Julian Day.
 */
export function getMansion28(jd: number): { name: string; element: string; nature: string } {
  const index = (Math.floor(jd) + 11) % 28;
  const normalizedIndex = index >= 0 ? index : index + 28;
  return MANSIONS_28[normalizedIndex]!;
}

/**
 * Computes Dụng Sự activity recommendations and auspicious score.
 */
export function getDungSu(lunarMonth: number, dayChi: DiaChi, jd: number): DungSuResult {
  const truc = getTruc(lunarMonth, dayChi);
  const mansion = getMansion28(jd);

  let score = 50;
  if (['Thành', 'Khai', 'Kiến', 'Mãn', 'Định'].includes(truc.name)) {
    score += 25;
  } else if (['Phá', 'Nguy', 'Bế'].includes(truc.name)) {
    score -= 25;
  }

  if (mansion.nature === 'Tốt') {
    score += 20;
  } else {
    score -= 20;
  }

  score = Math.max(10, Math.min(95, score));

  return {
    truc: truc.name,
    trucMeaning: truc.meaning,
    mansion28: mansion.name,
    mansionElement: mansion.element,
    nenActivities: truc.good,
    tranhActivities: truc.bad,
    auspiciousScore: score,
  };
}
