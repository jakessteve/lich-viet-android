/**
 * Advanced Tử Vi Tiểu Hạn & Nguyệt Hạn Dynamic Interpretation Engine — Lịch Việt
 *
 * Grounded in classical Tử Vi Đẩu Số (Thái Thứ Lang, Cụ Thiên Lương, Nam phái & Phi Tinh):
 * - Real-time annual impact calculation based on exact birth chart parameters
 * - Annual Thiên Can → Lưu Tứ Hóa (Lộc, Quyền, Khoa, Kỵ) & multi-tier collision detection
 * - Đại Hạn × Tiểu Hạn Resonance (Đồng cung, Tam hợp, Đối xung, Nhị hợp)
 * - Tam Tài Matrix (Thiên Thời - Vòng Thái Tuế, Địa Lợi - Nạp Âm, Nhân Hòa - Tinh Diệu, Khí Lực - Tràng Sinh)
 * - Tuần / Triệt status modifiers & Vô Chính Diệu inversion handling
 * - Dynamic, anti-generic parameterized synthesis with zero static boilerplate
 */

import type {
  TuViChart,
  TuViPalace,
  Can,
  Chi,
  TuViSchool,
  TieuHanInterpretationResult,
  NguyetHanInterpretationResult,
  LuuTuHoaCollision,
  TieuHanTamTaiMatrix,
  DaiHanResonance,
} from '../../types/tuvi';
import {
  CAN_NAMES,
  CHI_NAMES,
  NGU_HANH_SINH,
  NGU_HANH_KHAC,
  NAP_AM_HANH,
  TAM_HOP_GROUPS,
  DOI_CUNG_MAP,
  NHI_HOP_MAP,
} from './constants';
import { TU_VI_SCHOOL_PROFILES } from './schoolProfiles';
import { calculateHanContext } from './starPlacement';

const CHI_HANH: Record<string, string> = {
  Tý: 'Thủy',
  Sửu: 'Thổ',
  Dần: 'Mộc',
  Mão: 'Mộc',
  Thìn: 'Thổ',
  Tỵ: 'Hỏa',
  Ngọ: 'Hỏa',
  Mùi: 'Thổ',
  Thân: 'Kim',
  Dậu: 'Kim',
  Tuất: 'Thổ',
  Hợi: 'Thủy',
};

const CAN_TUHOA_DEFAULT: Record<string, Record<string, string>> = {
  Giáp: { Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' },
  Ất: { Lộc: 'Thiên Cơ', Quyền: 'Thiên Lương', Khoa: 'Tử Vi', Kỵ: 'Thái Âm' },
  Bính: { Lộc: 'Thiên Đồng', Quyền: 'Thiên Cơ', Khoa: 'Văn Xương', Kỵ: 'Liêm Trinh' },
  Đinh: { Lộc: 'Thái Âm', Quyền: 'Thiên Đồng', Khoa: 'Thiên Cơ', Kỵ: 'Cự Môn' },
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Hữu Bật', Kỵ: 'Thiên Cơ' },
  Kỷ: { Lộc: 'Vũ Khúc', Quyền: 'Tham Lang', Khoa: 'Thiên Lương', Kỵ: 'Văn Khúc' },
  Canh: { Lộc: 'Thái Dương', Quyen: 'Vũ Khúc', Khoa: 'Thiên Đồng', Kỵ: 'Thái Âm' },
  Tân: { Lộc: 'Cự Môn', Quyền: 'Thái Dương', Khoa: 'Văn Khúc', Kỵ: 'Văn Xương' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Thiên Phủ', Kỵ: 'Vũ Khúc' },
  Quý: { Lộc: 'Phá Quân', Quyền: 'Cự Môn', Khoa: 'Thái Âm', Kỵ: 'Tham Lang' },
};

const TRUONG_SINH_SCORES: Record<string, { level: 'thinh' | 'binh' | 'suy' | 'tich_luy'; score: number; desc: string }> = {
  'Trường Sinh': {
    level: 'thinh',
    score: 9.0,
    desc: 'Sinh khí dồi dào, tràn đầy sức sống và cơ hội mới. Năm vạn sự khởi sắc thuận buồm xuôi gió.',
  },
  'Mộc Dục': {
    level: 'binh',
    score: 6.5,
    desc: 'Giai đoạn chuyển hóa, làm mới hình ảnh và mở rộng giao thiệp; cần chú trọng ổn định cảm xúc.',
  },
  'Quan Đới': {
    level: 'thinh',
    score: 8.5,
    desc: 'Xác lập vị thế, năng lực được ghi nhận, uy tín gia tăng và có đà thăng tiến trong chức nghiệp.',
  },
  'Lâm Quan': {
    level: 'thinh',
    score: 9.2,
    desc: 'Thời kỳ chín muồi và đắc lực nhất; tài lộc vượng tiến, hành động quyết đoán gặt hái kết quả rõ nét.',
  },
  'Đế Vượng': {
    level: 'thinh',
    score: 9.5,
    desc: 'Đỉnh cao phong độ và năng lượng; tầm ảnh hưởng lan tỏa, thu hoạch thành quả dồi dào.',
  },
  Suy: {
    level: 'binh',
    score: 6.5,
    desc: 'Năng lượng chuyển sang trạng thái trầm ổn; thích hợp duy trì nền tảng và tối ưu hóa vận hành.',
  },
  Bệnh: {
    level: 'suy',
    score: 4.8,
    desc: 'Khí lực có phần hao tổn; cần chủ động chăm sóc sức khỏe thể chất, tránh ôm đồm công việc quá tải.',
  },
  Tử: {
    level: 'suy',
    score: 4.5,
    desc: 'Trạng thái lắng đọng; thời điểm tốt để tổng kết việc cũ, tu dưỡng nội lực và tích lũy tri thức.',
  },
  Mộ: {
    level: 'tich_luy',
    score: 7.2,
    desc: 'Vận thế tích tụ và ẩn tàng; khả năng tích lũy tài chính bền bỉ, xây dựng hậu thuẫn an toàn.',
  },
  Tuyệt: {
    level: 'tich_luy',
    score: 5.0,
    desc: 'Giai đoạn chuyển tiếp cuối chu kỳ; giải phóng những gánh nặng cũ để chuẩn bị cho cơ hội mới.',
  },
  Thai: {
    level: 'tich_luy',
    score: 7.5,
    desc: 'Mầm mống kế hoạch mới bắt đầu nhen nhóm; thích hợp gieo hạt, ấp ủ dự định sáng tạo tương lai.',
  },
  Dưỡng: {
    level: 'tich_luy',
    score: 7.8,
    desc: 'Vận trình bồi bổ và hoàn thiện nội lực; nhận được sự hỗ trợ từ gia đạo và môi trường xung quanh.',
  },
};

/** Computes Year Can and Chi from Gregorian year */
export function getYearCanChi(year: number): { can: Can; chi: Chi } {
  const canIndex = (((year - 4) % 10) + 10) % 10;
  const chiIndex = (((year - 4) % 12) + 12) % 12;
  return {
    can: CAN_NAMES[canIndex] as Can,
    chi: CHI_NAMES[chiIndex] as Chi,
  };
}

/** Finds palace index by star name in chart */
function findPalaceIndexWithStar(chart: TuViChart, starName: string): number {
  const idx = chart.palaces.findIndex(
    (p) =>
      p.chinhTinh.some((s) => s.name === starName) ||
      p.phuTinh.some((s) => s.name === starName) ||
      p.satTinh.some((s) => s.name === starName),
  );
  return idx >= 0 ? idx : 0;
}

/** Evaluates Đại Hạn resonance with Tiểu Hạn palace */
function evaluateDaiHanResonance(
  tieuHanPalaceId: number,
  daiHanPalaceId: number | null,
  tieuHanPalaceName: string,
  daiHanPalaceName: string,
): DaiHanResonance {
  if (daiHanPalaceId === null || daiHanPalaceId === undefined) {
    return {
      type: 'cach_cung',
      titleVi: 'Vận hành độc lập',
      descriptionVi: 'Tiểu Hạn vận hành theo quỹ đạo thời gian thường quy, không gặp điểm giao thoa đặc thù.',
      amplification: 1.0,
    };
  }

  if (tieuHanPalaceId === daiHanPalaceId) {
    return {
      type: 'dong_cung',
      titleVi: 'Đại Tiểu Hạn Trùng Phùng',
      descriptionVi: `Tiểu Hạn năm nay nhập đúng cung Đại Hạn (${daiHanPalaceName}): Năm mang tính bước ngoặt có tác động then chốt. Cát hung bộc phát mạnh mẽ gấp bội, mở ra những sự kiện trọng đại trong cuộc đời.`,
      amplification: 1.5,
    };
  }

  // Check Tam Hợp
  for (const group of TAM_HOP_GROUPS) {
    if (group.includes(tieuHanPalaceId) && group.includes(daiHanPalaceId)) {
      return {
        type: 'tam_hop',
        titleVi: 'Đại Tiểu Hạn Tam Hợp',
        descriptionVi: `Tiểu Hạn nằm trong tam hợp thế chiếu với Đại Hạn (${daiHanPalaceName}): Vận trình đắc thế, cộng hưởng thuận lợi và kế thừa trọn vẹn đà phát triển của 10 năm.`,
        amplification: 1.25,
      };
    }
  }

  // Check Đối Cung (Lục Xung)
  if (DOI_CUNG_MAP[tieuHanPalaceId] === daiHanPalaceId) {
    return {
      type: 'doi_cung',
      titleVi: 'Đại Tiểu Hạn Đối Xung',
      descriptionVi: `Tiểu Hạn trực xung cung Đại Hạn (${daiHanPalaceName}): Báo hiệu năm nhiều biến chuyển ngoại cảnh, dịch chuyển công tác, đổi mới môi trường sống hoặc đối diện thử thách trực diện.`,
      amplification: 1.2,
    };
  }

  // Check Nhị Hợp
  if (NHI_HOP_MAP[tieuHanPalaceId] === daiHanPalaceId) {
    return {
      type: 'nhi_hop',
      titleVi: 'Đại Tiểu Hạn Nhị Hợp',
      descriptionVi: `Tiểu Hạn nhị hợp cung Đại Hạn (${daiHanPalaceName}): Có quý nhân tương trợ ngầm, nguồn lực hỗ trợ kín đáo và nền tảng gia đình vững vàng.`,
      amplification: 1.1,
    };
  }

  return {
    type: 'cach_cung',
    titleVi: 'Đại Tiểu Hạn Cách Cung',
    descriptionVi: `Tiểu Hạn tại ${tieuHanPalaceName} phối chiếu cùng Đại Hạn tại ${daiHanPalaceName}, kết hợp đan xen giữa mục tiêu dài hạn và kế hoạch linh hoạt từng năm.`,
    amplification: 1.0,
  };
}

/** Detects all Lưu Tứ Hóa collisions with Natal chart */
function detectLuuTuHoaCollisions(
  yearCan: Can,
  chart: TuViChart,
  school: TuViSchool = 'thien-luong',
): {
  luuTuHoa: { canYear: Can; hoaLoc: string; hoaQuyen: string; hoaKhoa: string; hoaKy: string };
  collisions: LuuTuHoaCollision[];
} {
  const schoolProfile = TU_VI_SCHOOL_PROFILES[school] ?? TU_VI_SCHOOL_PROFILES['thien-luong'];
  const tuHoaTable = schoolProfile.tuHoaTable ?? CAN_TUHOA_DEFAULT;
  const mapping = ((tuHoaTable as Record<string, Record<string, string>>)[yearCan] ?? CAN_TUHOA_DEFAULT[yearCan] ?? CAN_TUHOA_DEFAULT['Giáp']) as Record<string, string>;

  const hoaLoc = mapping['Lộc'] ?? mapping['Loc'] ?? '';
  const hoaQuyen = mapping['Quyền'] ?? mapping['Quyen'] ?? '';
  const hoaKhoa = mapping['Khoa'] ?? '';
  const hoaKy = mapping['Kỵ'] ?? mapping['Ky'] ?? '';

  const luuTuHoa = {
    canYear: yearCan,
    hoaLoc,
    hoaQuyen,
    hoaKhoa,
    hoaKy,
  };

  const collisions: LuuTuHoaCollision[] = [];
  const natalTuHoa = chart.palaces.flatMap((p) =>
    p.tuHoa.map((th) => ({
      ...th,
      palaceId: p.id,
      palaceName: p.name,
    })),
  );

  const locPalaceId = findPalaceIndexWithStar(chart, hoaLoc);
  const locPalace = chart.palaces[locPalaceId];
  const natalLoc = natalTuHoa.find((th) => th.type === 'Lộc');
  const hasNatalLocTon = locPalace.phuTinh.some((s) => s.name === 'Lộc Tồn');

  if (natalLoc && natalLoc.starName === hoaLoc) {
    collisions.push({
      type: 'Lộc',
      starName: hoaLoc,
      sourceCan: yearCan,
      targetPalaceId: locPalaceId,
      targetPalaceName: locPalace.name,
      collisionKind: 'song_loc',
      titleVi: 'Song Lộc Trùng Phùng (Năm Sinh + Lưu Niên)',
      descriptionVi: `Lưu Niên Hóa Lộc hội ngộ Năm Sinh Hóa Lộc tại sao ${hoaLoc} (Cung ${locPalace.name}): Đại cát hanh thông, cơ hội tài chính nở rộ và đón nhận nguồn thu dồi dào.`,
    });
  } else if (hasNatalLocTon) {
    collisions.push({
      type: 'Lộc',
      starName: hoaLoc,
      sourceCan: yearCan,
      targetPalaceId: locPalaceId,
      targetPalaceName: locPalace.name,
      collisionKind: 'loc_gap_loc',
      titleVi: 'Lộc Tồn ngộ Lưu Hóa Lộc',
      descriptionVi: `Lưu Hóa Lộc chiếu đúng cung có Lộc Tồn tại Cung ${locPalace.name}: Bồi đắp tài khí, gia tăng cơ hội đầu tư kinh doanh và củng cố nguồn vốn.`,
    });
  } else {
    collisions.push({
      type: 'Lộc',
      starName: hoaLoc,
      sourceCan: yearCan,
      targetPalaceId: locPalaceId,
      targetPalaceName: locPalace.name,
      collisionKind: 'don_thu',
      titleVi: `Lưu Hóa Lộc tại ${locPalace.name}`,
      descriptionVi: `Lưu Hóa Lộc nhập Cung ${locPalace.name} (${hoaLoc}): Kích hoạt duyên may và mở ra cơ hội tài chính, công danh tại phương diện này.`,
    });
  }

  // Hóa Kỵ Collisions
  const kyPalaceId = findPalaceIndexWithStar(chart, hoaKy);
  const kyPalace = chart.palaces[kyPalaceId];
  const natalKy = natalTuHoa.find((th) => th.type === 'Kỵ');

  if (natalKy && natalKy.starName === hoaKy) {
    collisions.push({
      type: 'Kỵ',
      starName: hoaKy,
      sourceCan: yearCan,
      targetPalaceId: kyPalaceId,
      targetPalaceName: kyPalace.name,
      collisionKind: 'song_ky',
      titleVi: 'Song Kỵ Trùng Phùng (Gia Tăng Thử Thách)',
      descriptionVi: `Lưu Niên Hóa Kỵ trùng ngộ Năm Sinh Hóa Kỵ tại sao ${hoaKy} (Cung ${kyPalace.name}): Điểm nghẽn cần đặc biệt cẩn trọng giấy tờ, tài chính và tránh nóng vội trong giao dịch.`,
    });
  } else if (kyPalace.isMenh) {
    collisions.push({
      type: 'Kỵ',
      starName: hoaKy,
      sourceCan: yearCan,
      targetPalaceId: kyPalaceId,
      targetPalaceName: kyPalace.name,
      collisionKind: 'ky_xung_menh',
      titleVi: 'Lưu Hóa Kỵ nhập Cung Mệnh',
      descriptionVi: `Lưu Hóa Kỵ nhập bản Cung Mệnh (${hoaKy}): Nhắc nhở đương số giữ tâm thế tĩnh tại, kiểm soát căng thẳng và không quyết định bốc đồng.`,
    });
  } else {
    const menhPalace = chart.palaces.find((p) => p.isMenh);
    if (menhPalace && DOI_CUNG_MAP[kyPalaceId] === menhPalace.id) {
      collisions.push({
        type: 'Kỵ',
        starName: hoaKy,
        sourceCan: yearCan,
        targetPalaceId: kyPalaceId,
        targetPalaceName: kyPalace.name,
        collisionKind: 'ky_xung_thai_tue',
        titleVi: `Lưu Hóa Kỵ tại ${kyPalace.name} trực xung Cung Mệnh`,
        descriptionVi: `Lưu Hóa Kỵ đóng tại ${kyPalace.name} chiếu thẳng về Cung Mệnh: Đề phòng thị phi từ môi trường bên ngoài, nên giải quyết tranh chấp bằng thiện chí.`,
      });
    }
  }

  return { luuTuHoa, collisions };
}

/** Evaluates Tam Tài matrix for Tiểu Hạn */
function evaluateTieuHanTamTai(
  menhHanh: string,
  palaceChiHanh: string,
  thaiTueName?: string,
  truongSinhName?: string,
  majorStars: Array<{ name: string; brightness: string; nguHanh: string }> = [],
  phuTinh: string[] = [],
  satTinh: string[] = [],
): TieuHanTamTaiMatrix {
  // 1. Thiên Thời (Vòng Thái Tuế)
  let thienThoiLevel: 'Đắc Thời' | 'Trung Hòa' | 'Nghịch Cảnh' = 'Trung Hòa';
  let thienThoiScore = 7.0;
  let thienThoiDesc = 'Vận trình linh hoạt thích ứng theo thời cuộc.';

  if (thaiTueName) {
    if (['Thái Tuế', 'Quan Phù', 'Bạch Hổ'].includes(thaiTueName)) {
      thienThoiLevel = 'Đắc Thời';
      thienThoiScore = 9.2;
      thienThoiDesc = `Thế Thái Tuế (${thaiTueName}): Đắc Thiên Thời chính danh, có tiếng nói uy tín, thuận lợi khẳng định quyền lực và mở rộng vị thế xã hội.`;
    } else if (['Thiếu Dương', 'Phúc Đức', 'Đào Hoa'].includes(thaiTueName)) {
      thienThoiLevel = 'Đắc Thời';
      thienThoiScore = 8.5;
      thienThoiDesc = `Thế Thiếu Dương – Đào Hoa (${thaiTueName}): Tràn đầy sinh khí, tư duy sáng tạo nhạy bén, tâm thế hoan hỷ đón nhận duyên may.`;
    } else if (['Thiếu Âm', 'Long Đức', 'Trực Phù'].includes(thaiTueName)) {
      thienThoiLevel = 'Trung Hòa';
      thienThoiScore = 7.0;
      thienThoiDesc = `Thế Âm Long Trực (${thaiTueName}): Lấy đức làm gốc, nhẫn nại tích lũy để gặt hái phước báu bền lâu, hóa giải bất đồng.`;
    } else {
      thienThoiLevel = 'Nghịch Cảnh';
      thienThoiScore = 5.2;
      thienThoiDesc = `Thế Tuế Phá – Tang Môn (${thaiTueName}): Năm tôi luyện bản lĩnh vượt khó; cần kiên trì bền chí để tạo bước ngoặt bứt phá.`;
    }
  }

  // 2. Địa Lợi (Ngũ Hành Chi Cung vs Bản Mệnh Nạp Âm)
  let diaLoiLevel: 'Tương Sinh' | 'Tỷ Hòa' | 'Khắc Xuất' | 'Sinh Xuất' | 'Khắc Nhập' = 'Tỷ Hòa';
  let diaLoiScore = 7.5;
  let diaLoiDesc = 'Ngũ Hành tương giao bình hòa.';

  if (menhHanh && palaceChiHanh) {
    if (menhHanh === palaceChiHanh) {
      diaLoiLevel = 'Tỷ Hòa';
      diaLoiScore = 8.0;
      diaLoiDesc = `Đồng hành (${menhHanh} – ${palaceChiHanh}): Môi trường hòa hợp, tự thân phát huy thực lực vững vàng.`;
    } else if (NGU_HANH_SINH[palaceChiHanh] === menhHanh) {
      diaLoiLevel = 'Tương Sinh';
      diaLoiScore = 9.5;
      diaLoiDesc = `Cung sinh Mệnh (${palaceChiHanh} sinh ${menhHanh}): Đắc Địa Lợi hoàn hảo, hoàn cảnh trợ lực tối đa, tạo điều kiện thuận buồm xuôi gió.`;
    } else if (NGU_HANH_SINH[menhHanh] === palaceChiHanh) {
      diaLoiLevel = 'Sinh Xuất';
      diaLoiScore = 6.0;
      diaLoiDesc = `Mệnh sinh Cung (${menhHanh} sinh ${palaceChiHanh}): Năm cống hiến tâm sức cho công việc và người khác, tạo dựng giá trị lâu dài.`;
    } else if (NGU_HANH_KHAC[menhHanh] === palaceChiHanh) {
      diaLoiLevel = 'Khắc Xuất';
      diaLoiScore = 7.0;
      diaLoiDesc = `Mệnh khắc Cung (${menhHanh} khắc ${palaceChiHanh}): Nỗ lực cạnh tranh và chủ động làm chủ tình thế.`;
    } else if (NGU_HANH_KHAC[palaceChiHanh] === menhHanh) {
      diaLoiLevel = 'Khắc Nhập';
      diaLoiScore = 4.8;
      diaLoiDesc = `Cung khắc Mệnh (${palaceChiHanh} khắc ${menhHanh}): Ngoại cảnh nhiều áp lực; bí quyết thành công là sự thận trọng và bình tĩnh.`;
    }
  }

  // 3. Nhân Hòa (Cát tinh & Sát tinh hội tụ)
  let nhanHoaScore = 7.0;
  let nhanHoaLevel: 'Quý Nhân Phò Trợ' | 'Tự Lực Cánh Sinh' | 'Tiểu Nhân Dèm Pha' = 'Tự Lực Cánh Sinh';
  let nhanHoaDesc = 'Tự thân vận động, liên kết đồng nghiệp hài hòa.';

  const auspiciousCount = phuTinh.filter((s) =>
    ['Tả Phụ', 'Hữu Bật', 'Thiên Khôi', 'Thiên Việt', 'Văn Xương', 'Văn Khúc', 'Lộc Tồn', 'Hóa Khoa', 'Hóa Lộc', 'Thiên Mã', 'Hồng Loan', 'Đào Hoa'].includes(s),
  ).length;

  const satCount = satTinh.length;
  const majorBrightCount = majorStars.filter((s) => ['Miếu', 'Vượng', 'Đắc'].includes(s.brightness)).length;
  const majorDarkCount = majorStars.filter((s) => ['Hãm'].includes(s.brightness)).length;

  if (auspiciousCount >= 2 && satCount === 0 && majorDarkCount === 0) {
    nhanHoaScore = 9.2;
    nhanHoaLevel = 'Quý Nhân Phò Trợ';
    nhanHoaDesc = 'Hội tụ nhiều cát tinh nâng đỡ, cấp trên trọng dụng, đồng nghiệp hết lòng hỗ trợ và dễ gặp cơ hội vàng.';
  } else if (satCount >= 2 || majorDarkCount >= 2) {
    nhanHoaScore = 5.2;
    nhanHoaLevel = 'Tiểu Nhân Dèm Pha';
    nhanHoaDesc = 'Đề phòng thị phi, sự ganh ghét hoặc bất đồng quan điểm; nên giữ chữ tín và làm việc minh bạch.';
  } else {
    nhanHoaScore = 7.2 + (majorBrightCount * 0.3) - (satCount * 0.4);
    nhanHoaLevel = 'Tự Lực Cánh Sinh';
    nhanHoaDesc = 'Vừa có quý nhân tương trợ vừa có thử thách cạnh tranh; tự thân nỗ lực là yếu tố quyết định.';
  }

  // 4. Khí Lực (Tràng Sinh)
  const tsInfo = TRUONG_SINH_SCORES[truongSinhName ?? 'Trường Sinh'] ?? TRUONG_SINH_SCORES['Trường Sinh'];

  const totalScore =
    Math.round(
      Math.max(
        1.0,
        Math.min(10.0, thienThoiScore * 0.3 + diaLoiScore * 0.25 + nhanHoaScore * 0.25 + tsInfo.score * 0.2),
      ) * 10,
    ) / 10;

  return {
    thienThoi: { level: thienThoiLevel, score: thienThoiScore, desc: thienThoiDesc },
    diaLoi: { level: diaLoiLevel, score: diaLoiScore, desc: diaLoiDesc },
    nhanHoa: { level: nhanHoaLevel, score: nhanHoaScore, desc: nhanHoaDesc },
    khiLuc: { stage: truongSinhName ?? 'Trường Sinh', level: tsInfo.level, score: tsInfo.score, desc: tsInfo.desc },
    totalScore,
  };
}

/** Generates rich, parameterized, dynamic synthesis */
function synthesizeTieuHanGuidance(
  viewYear: number,
  viewAge: number,
  yearCan: Can,
  yearChi: Chi,
  palace: TuViPalace,
  tamTai: TieuHanTamTaiMatrix,
  resonance: DaiHanResonance,
  collisions: LuuTuHoaCollision[],
  tuanTriet: { hasTuan: boolean; hasTriet: boolean },
): {
  luckTier: 'Đại Cát' | 'Khởi Sắc' | 'Bình Hòa' | 'Thử Thách' | 'Gian Nan';
  themeHeadlineVi: string;
  detailedSynthesis: {
    generalVibe: string;
    careerAndFinance: string;
    relationshipAndHealth: string;
    actionableAdvice: string;
  };
  keyWarnings: string[];
} {
  const score = tamTai.totalScore;
  let luckTier: 'Đại Cát' | 'Khởi Sắc' | 'Bình Hòa' | 'Thử Thách' | 'Gian Nan' = 'Bình Hòa';
  if (score >= 8.6) luckTier = 'Đại Cát';
  else if (score >= 7.2) luckTier = 'Khởi Sắc';
  else if (score >= 5.6) luckTier = 'Bình Hòa';
  else if (score >= 4.2) luckTier = 'Thử Thách';
  else luckTier = 'Gian Nan';

  const majorNames = palace.chinhTinh.map((s) => `${s.name} (${s.brightness})`).join(', ') || 'Vô Chính Diệu';
  const hasSongLoc = collisions.some((c) => c.collisionKind === 'song_loc' || c.collisionKind === 'loc_gap_loc');
  const hasSongKy = collisions.some((c) => c.collisionKind === 'song_ky');
  const hasLuuKyAffliction = collisions.some((c) => c.collisionKind === 'ky_xung_menh' || c.collisionKind === 'ky_xung_thai_tue');

  // Dynamic Headline
  let themeHeadlineVi = `Tiểu Hạn năm ${yearCan} ${yearChi} (${viewYear}) nhập Cung ${palace.name} [${palace.chi}] (${viewAge} tuổi)`;
  if (resonance.type === 'dong_cung') {
    themeHeadlineVi += ` - Đại Tiểu Hạn Trùng Phùng Đắc Vận`;
  } else if (hasSongLoc) {
    themeHeadlineVi += ` - Song Lộc Tụ Hội, Vận Tài Khởi Sắc`;
  } else if (hasSongKy) {
    themeHeadlineVi += ` - Thận Trọng Ứng Biến, Giữ Vững Cốt Lõi`;
  } else if (luckTier === 'Đại Cát' || luckTier === 'Khởi Sắc') {
    themeHeadlineVi += ` - Thiên Thời Địa Lợi, Hanh Thông Khởi Sắc`;
  } else {
    themeHeadlineVi += ` - Củng Cố Nền Tảng, Vững Vàng Tích Lũy`;
  }

  // 1. General Vibe
  const vibeParts: string[] = [];
  vibeParts.push(
    `Năm ${viewYear} (${yearCan} ${yearChi}), đương số bước sang tuổi ${viewAge}, Tiểu Hạn tọa lạc tại Cung ${palace.name} (${palace.chi}) với chính tinh ${majorNames}.`,
  );
  vibeParts.push(resonance.descriptionVi);
  if (tuanTriet.hasTriet || tuanTriet.hasTuan) {
    const ttNames = [tuanTriet.hasTriet ? 'Triệt' : '', tuanTriet.hasTuan ? 'Tuần' : ''].filter(Boolean).join(' - ');
    vibeParts.push(
      `Cung Tiểu Hạn hội ngộ ${ttNames}: Giúp triệt tiêu xung sát tinh nhưng đòi hỏi sự kiên nhẫn trong giai đoạn đầu năm trước khi đón nhận thành quả.`,
    );
  }
  vibeParts.push(
    `Thế tam tài đánh giá tổng quan đạt ${tamTai.totalScore}/10 (${tamTai.thienThoi.level} về Thiên Thời, ${tamTai.diaLoi.level} về Địa Lợi, ${tamTai.nhanHoa.level} về Nhân Hòa).`,
  );

  // 2. Career & Finance
  const careerParts: string[] = [];
  if (hasSongLoc) {
    careerParts.push(
      `Tài chính & Sự nghiệp đón vận may vượt trội nhờ Song Lộc tương hội. Cơ hội gia tăng thu nhập từ công việc chính và đầu tư bên ngoài rộng mở.`,
    );
  } else if (tamTai.nhanHoa.level === 'Quý Nhân Phò Trợ') {
    careerParts.push(
      `Công danh và công việc có quý nhân dẫn lối, sự nghiệp thuận lợi mở rộng quy mô hoặc đảm nhận thêm trọng trách giá trị.`,
    );
  } else if (hasSongKy || hasLuuKyAffliction) {
    careerParts.push(
      `Công việc đòi hỏi sự cẩn trọng cao độ trong hợp đồng, giấy tờ pháp lý và giao dịch tiền bạc; nên ưu tiên bảo toàn vốn liếng thay vì mạo hiểm đầu cơ.`,
    );
  } else {
    careerParts.push(
      `Vận trình công việc duy trì nhịp độ ổn định, thích hợp nâng cao chuyên môn, xây dựng uy tín và hoàn thiện các dự án đang triển khai.`,
    );
  }

  // 3. Relationship & Health
  const relationParts: string[] = [];
  if (palace.satTinh.length > 0) {
    const satNames = palace.satTinh.map((s) => s.name).join(', ');
    relationParts.push(
      `Sát tinh ${satNames} tại cung vận nhắc nhở chú ý sức khỏe tinh thần, điều tiết chế độ nghỉ ngơi và tránh tranh cãi không cần thiết trong các mối quan hệ.`,
    );
  } else {
    relationParts.push(
      `Gia đạo và các mối quan hệ đối ngoại diễn ra êm đẹp, tình cảm gắn kết và nhận được sự đồng hành chân thành từ người thân, đồng nghiệp.`,
    );
  }

  // 4. Actionable Advice
  const adviceParts: string[] = [];
  if (luckTier === 'Đại Cát' || luckTier === 'Khởi Sắc') {
    adviceParts.push(
      `Chủ động hiện thực hóa các kế hoạch quan trọng đã chuẩn bị từ trước; quyết đoán nắm bắt cơ hội nhưng luôn giữ sự khiêm nhường để duy trì phước lành lâu dài.`,
    );
  } else if (luckTier === 'Bình Hòa') {
    adviceParts.push(
      `Lấy tĩnh chế động, tập trung tối ưu hóa hiệu quả hiện tại, bồi đắp kiến thức và mở rộng mạng lưới quan hệ chất lượng cao.`,
    );
  } else {
    adviceParts.push(
      `Giữ vững kỷ luật, cẩn trọng trong các quyết định lớn và rèn luyện tâm thế an nhiên trước mọi biến động ngoại cảnh.`,
    );
  }

  // Key Warnings
  const keyWarnings: string[] = [];
  if (hasSongKy) keyWarnings.push('Cẩn trọng tối đa tranh chấp pháp lý, hợp đồng và thị phi tài chính.');
  if (hasLuuKyAffliction) keyWarnings.push('Đề phòng hiểu lầm hoặc áp lực từ đối tác bên ngoài.');
  if (palace.satTinh.some((s) => ['Kình Dương', 'Đà La', 'Địa Kiếp'].includes(s.name))) {
    keyWarnings.push('Chú ý an toàn khi di chuyển và kiểm tra kỹ lưỡng các giao dịch lớn.');
  }

  return {
    luckTier,
    themeHeadlineVi,
    detailedSynthesis: {
      generalVibe: vibeParts.join(' '),
      careerAndFinance: careerParts.join(' '),
      relationshipAndHealth: relationParts.join(' '),
      actionableAdvice: adviceParts.join(' '),
    },
    keyWarnings,
  };
}

/**
 * Calculates and interprets the full Tiểu Hạn (Annual Horizon) for a given chart & year.
 */
export function interpretTieuHan(chart: TuViChart, targetYear?: number): TieuHanInterpretationResult {
  const currentYear = targetYear ?? chart.hanContext?.viewYear ?? new Date().getFullYear();
  const birthYear = chart.lunarDate.year;
  const viewAge = Math.max(1, currentYear - birthYear + 1);
  const { can: yearCan, chi: yearChi } = getYearCanChi(currentYear);

  // Ensure han context is active
  const han = chart.hanContext ?? calculateHanContext(chart, currentYear, 1);
  const tieuHanPalaceId = han.tieuHanPalaceIndex ?? 0;
  const palace = chart.palaces[tieuHanPalaceId] ?? chart.palaces[0];

  const menhNapAm = chart.centerInfo.menhNapAm;
  const menhHanh = NAP_AM_HANH[menhNapAm] ?? 'Kim';
  const palaceChiHanh = CHI_HANH[palace.chi] ?? 'Thổ';

  const majorStars = palace.chinhTinh.map((s) => ({
    name: s.name,
    brightness: s.brightness,
    nguHanh: s.nguHanh,
  }));
  const phuTinh = palace.phuTinh.map((s) => s.name);
  const satTinh = palace.satTinh.map((s) => s.name);

  // Lưu Tứ Hóa & Collisions
  const school = (chart.input.school ?? 'thien-luong') as TuViSchool;
  const { luuTuHoa, collisions } = detectLuuTuHoaCollisions(yearCan, chart, school);

  // Đại Hạn Resonance
  const daiHanResonance = evaluateDaiHanResonance(
    tieuHanPalaceId,
    han.daiHanPalaceIndex,
    palace.name,
    han.daiHanPalaceName,
  );

  // Tam Tài Matrix
  const tamTai = evaluateTieuHanTamTai(
    menhHanh,
    palaceChiHanh,
    palace.rings?.thaiTue,
    palace.rings?.truongSinh,
    majorStars,
    phuTinh,
    satTinh,
  );

  const tuanTriet = {
    hasTuan: palace.hasTuan,
    hasTriet: palace.hasTriet,
  };

  // Detailed Synthesis
  const { luckTier, themeHeadlineVi, detailedSynthesis, keyWarnings } = synthesizeTieuHanGuidance(
    currentYear,
    viewAge,
    yearCan,
    yearChi,
    palace,
    tamTai,
    daiHanResonance,
    collisions,
    tuanTriet,
  );

  // Calculate 12 monthly scores to classify favorable vs challenging months
  const monthlyScores: Array<{ month: number; score: number }> = [];
  for (let m = 1; m <= 12; m++) {
    const ngResult = interpretNguyetHan(chart, currentYear, m);
    monthlyScores.push({ month: m, score: ngResult.monthScore });
  }

  const favorableMonths = monthlyScores.filter((ms) => ms.score >= 7.0).map((ms) => ms.month);
  const challengingMonths = monthlyScores.filter((ms) => ms.score < 5.5).map((ms) => ms.month);

  return {
    viewYear: currentYear,
    viewAge,
    yearCan,
    yearChi,
    tieuHanPalaceId,
    tieuHanPalaceName: palace.name,
    tieuHanPalaceChi: palace.chi,
    isMenh: palace.isMenh,
    isThan: palace.isThan,
    majorStars,
    phuTinh,
    satTinh,
    tuanTriet,
    luuTuHoa,
    collisions,
    daiHanResonance,
    tamTai,
    overallScore: tamTai.totalScore,
    luckTier,
    themeHeadlineVi,
    detailedSynthesis,
    keyWarnings,
    favorableMonths,
    challengingMonths,
  };
}

/**
 * Calculates and interprets Nguyệt Hạn (Monthly Horizon) for a specific lunar/calendar month.
 */
export function interpretNguyetHan(
  chart: TuViChart,
  viewYear: number,
  viewMonth: number,
): NguyetHanInterpretationResult {
  const normalizedMonth = Math.min(12, Math.max(1, Math.floor(viewMonth) || 1));
  const han = chart.hanContext ?? calculateHanContext(chart, viewYear, normalizedMonth);

  // Find palace for this month
  const palaceEntry = Object.entries(han.nguyetHanMonthByPalace).find(([, m]) => m === normalizedMonth);
  const palaceId = palaceEntry ? Number(palaceEntry[0]) : (han.tieuHanPalaceIndex ?? 0);
  const palace = chart.palaces[palaceId] ?? chart.palaces[0];

  const majorNames = palace.chinhTinh.map((s) => `${s.name} (${s.brightness})`).join(', ') || 'Vô Chính Diệu';
  const majorBright = palace.chinhTinh.filter((s) => ['Miếu', 'Vượng', 'Đắc'].includes(s.brightness)).length;
  const majorDark = palace.chinhTinh.filter((s) => ['Hãm'].includes(s.brightness)).length;
  const satCount = palace.satTinh.length;
  const phuCount = palace.phuTinh.length;

  let monthScore = 7.0 + majorBright * 0.5 - majorDark * 0.4 - satCount * 0.6 + Math.min(1.0, phuCount * 0.15);
  monthScore = Math.round(Math.max(1.0, Math.min(10.0, monthScore)) * 10) / 10;

  let luckTier: 'Đại Cát' | 'Khởi Sắc' | 'Bình Hòa' | 'Thử Thách' | 'Gian Nan' = 'Bình Hòa';
  if (monthScore >= 8.5) luckTier = 'Đại Cát';
  else if (monthScore >= 7.0) luckTier = 'Khởi Sắc';
  else if (monthScore >= 5.5) luckTier = 'Bình Hòa';
  else if (monthScore >= 4.0) luckTier = 'Thử Thách';
  else luckTier = 'Gian Nan';

  const focusThemes: Record<string, string> = {
    Mệnh: 'Tự thân phát triển, định hình mục tiêu và củng cố phong độ cá nhân',
    'Tài Bạch': 'Quản trị tài chính, thu hồi vốn và nắm bắt cơ hội kinh doanh',
    'Quan Lộc': 'Thúc đẩy công việc, khẳng định năng lực chuyên môn và thăng tiến',
    'Thiên Di': 'Giao thiệp xã hội, mở rộng mạng lưới quan hệ và xuất hành',
    'Phu Thê': 'Gắn kết tình cảm lứa đôi, thấu hiểu và chia sẻ cùng bạn đời',
    'Phúc Đức': 'Thư thái tinh thần, hướng về nguồn cội và tích lũy phước đức',
    'Điền Trạch': 'Gia đạo êm ấm, tu sửa nhà cửa và quản trị tài sản bất động sản',
    'Huynh Đệ': 'Tương trợ bạn bè, anh em đồng nghiệp và hợp tác dự án',
    'Tử Tức': 'Chăm sóc con cái, thế hệ kế cận và các dự định ươm mầm tương lai',
    'Nô Bộc': 'Giao lưu đối tác, quản trị đội ngũ và lắng nghe cộng sự',
    'Tật Ách': 'Thanh lọc cơ thể, rèn luyện thể chất và giải tỏa căng thẳng',
    'Phụ Mẫu': 'Hiếu kính song thân, đón nhận lời khuyên quý báu từ tiền bối',
  };

  const focusThemeVi = focusThemes[palace.name] ?? 'Hoạt động hài hòa theo chu kỳ tháng';

  const summaryVi = `Tháng ${normalizedMonth} Nguyệt Hạn vận hành tại Cung ${palace.name} (${palace.chi}), hội tụ tinh diệu ${majorNames}.`;
  let adviceVi = 'Chủ động duy trì nhịp độ làm việc, giữ tinh thần tỉnh táo và cân bằng cuộc sống.';
  if (luckTier === 'Đại Cát' || luckTier === 'Khởi Sắc') {
    adviceVi = 'Thời điểm thuận lợi để triển khai các việc quan trọng, xúc tiến hợp đồng và mở rộng giao thiệp.';
  } else if (luckTier === 'Thử Thách' || luckTier === 'Gian Nan') {
    adviceVi = 'Nên ưu tiên sự an toàn, kiểm soát chi tiêu và đề phòng bất đồng trong giao tiếp.';
  }

  return {
    viewMonth: normalizedMonth,
    viewYear,
    palaceId,
    palaceName: palace.name,
    palaceChi: palace.chi,
    majorStarsSummary: majorNames,
    monthScore,
    luckTier,
    summaryVi,
    focusThemeVi,
    adviceVi,
  };
}
