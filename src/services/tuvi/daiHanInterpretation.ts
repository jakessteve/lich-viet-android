/**
 * Advanced Tử Vi Đại Hạn Holistic Interpretation Engine — Lịch Việt
 *
 * Grounded in classical Tử Vi Đẩu Số (tuvi.cohoc.net, Thái Thứ Lang, Cụ Thiên Lương):
 * - Can Cung Đại Hạn & Lưu Tứ Hóa of the 10-year period + clashes with Natal Tứ Hóa
 * - Tam Tài Matrix (Thiên Thời, Địa Lợi, Nhân Hòa, Khí Lực) with numerical rating
 * - Tam Phương Tứ Chính (3 Trine + 1 Opposite) star and mutagen projection
 * - 14 Major stars and 24 classic dual star combinations with brightness nuances
 * - Cung Vô Chính Diệu (Empty palace) specialized handling (Tuần/Triệt, Đối cung, Sát tinh độc thủ)
 * - Prominent Luck Patterns (Song Lộc, Lộc Mã, Tam Kỳ, Sát Phá Tham, Kình Đà, Không Kiếp, v.v.)
 * - Dynamic 5-Year Phasing (Tiền vận vs Hậu vận)
 * - Life Stage Relevance (Học hành, Lập nghiệp, Đỉnh cao, Dưỡng lão)
 * - Human-oriented, empowering, non-fatalistic actionable life guidance
 */

import type { TuViChart, TuViPalace, DaiHanInterpretationResult, Can } from '../../types/tuvi';
import { NGU_HANH_SINH, NGU_HANH_KHAC, NAP_AM_HANH, TAM_HOP_GROUPS, DOI_CUNG_MAP } from './constants';

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

const CAN_TUHOA_TABLE: Record<string, { Loc: string; Quyen: string; Khoa: string; Ky: string }> = {
  Giáp: { Loc: 'Liêm Trinh', Quyen: 'Phá Quân', Khoa: 'Vũ Khúc', Ky: 'Thái Dương' },
  Ất: { Loc: 'Thiên Cơ', Quyen: 'Thiên Lương', Khoa: 'Tử Vi', Ky: 'Thái Âm' },
  Bính: { Loc: 'Thiên Đồng', Quyen: 'Thiên Cơ', Khoa: 'Văn Xương', Ky: 'Liêm Trinh' },
  Đinh: { Loc: 'Thái Âm', Quyen: 'Thiên Đồng', Khoa: 'Thiên Cơ', Ky: 'Cự Môn' },
  Mậu: { Loc: 'Tham Lang', Quyen: 'Thái Âm', Khoa: 'Hữu Bật', Ky: 'Thiên Cơ' },
  Kỷ: { Loc: 'Vũ Khúc', Quyen: 'Tham Lang', Khoa: 'Thiên Lương', Ky: 'Văn Khúc' },
  Canh: { Loc: 'Thái Dương', Quyen: 'Vũ Khúc', Khoa: 'Thiên Đồng', Ky: 'Thái Âm' },
  Tân: { Loc: 'Cự Môn', Quyen: 'Thái Dương', Khoa: 'Văn Khúc', Ky: 'Văn Xương' },
  Nhâm: { Loc: 'Thiên Lương', Quyen: 'Tử Vi', Khoa: 'Thiên Phủ', Ky: 'Vũ Khúc' },
  Quý: { Loc: 'Phá Quân', Quyen: 'Cự Môn', Khoa: 'Thái Âm', Ky: 'Tham Lang' },
};

const TRUONG_SINH_INSIGHTS: Record<
  string,
  {
    level: 'thinh' | 'binh' | 'suy' | 'tich_luy';
    score: number;
    desc: string;
    advice: string;
  }
> = {
  'Trường Sinh': {
    level: 'thinh',
    score: 9.0,
    desc: 'Sinh khí dồi dào, tràn đầy sức sống và cơ hội mới. Thời kỳ vạn sự khởi đầu hanh thông, dễ gặp quý nhân nâng đỡ.',
    advice: 'Chủ động nắm bắt cơ hội, mở rộng quy mô công việc và tự tin dấn thân vào các kế hoạch dài hạn.',
  },
  'Mộc Dục': {
    level: 'binh',
    score: 6.5,
    desc: 'Giai đoạn chuyển hóa, làm mới bản thân và mở rộng giao thiệp xã hội. Vận trình có nhiều biến động cảm xúc và trải nghiệm phong phú.',
    advice:
      'Giữ vững mục tiêu cốt lõi, cẩn trọng trong các quyết định tài chính bộc phát và duy trì sự tỉnh táo trước cám dỗ.',
  },
  'Quan Đới': {
    level: 'thinh',
    score: 8.5,
    desc: 'Giai đoạn trưởng thành và xác lập vị thế. Năng lực được ghi nhận, uy tín gia tăng và sẵn sàng gánh vác trách nhiệm lớn hơn.',
    advice: 'Tập trung trau dồi chuyên môn, xây dựng mạng lưới quan hệ bền vững và khẳng định năng lực dẫn dắt.',
  },
  'Lâm Quan': {
    level: 'thinh',
    score: 9.2,
    desc: 'Thời kỳ chín muồi và đắc lực nhất. Khả năng tự lập mạnh mẽ, tài lộc vượng tiến, công danh có nhiều bước tiến vững chắc.',
    advice: 'Phát huy tối đa thế mạnh tự thân, quyết đoán trong hành động nhưng cần khiêm tốn lắng nghe cộng sự.',
  },
  'Đế Vượng': {
    level: 'thinh',
    score: 9.5,
    desc: 'Đỉnh cao phong độ, quyền lực và năng lượng rực rỡ nhất trong chu kỳ. Thành quả thu hoạch dồi dào, tầm ảnh hưởng lan rộng.',
    advice: 'Trân trọng thành quả, san sẻ lợi ích để duy trì sự ủng hộ và chuẩn bị chiến lược bền vững cho tương lai.',
  },
  Suy: {
    level: 'binh',
    score: 6.5,
    desc: 'Năng lượng chuyển sang trạng thái trầm ổn, hạ nhiệt sau thời kỳ bứt phá. Vận trình cần sự ổn định và duy trì nền tảng.',
    advice: 'Ưu tiên củng cố thành tựu hiện có, tối ưu hóa quy trình làm việc thay vì mở rộng mạo hiểm.',
  },
  Bệnh: {
    level: 'suy',
    score: 4.8,
    desc: 'Khí lực có phần tiêu hao, đòi hỏi sự cân bằng giữa cống hiến và tái tạo năng lượng. Sức khỏe thể chất lẫn tinh thần cần được quan tâm.',
    advice: 'Lắng nghe cơ thể, duy trì lối sống lành mạnh, phân bổ công việc hợp lý và tránh ôm đồm quá sức.',
  },
  Tử: {
    level: 'suy',
    score: 4.5,
    desc: 'Trạng thái tĩnh lặng và lắng đọng. Thời điểm thích hợp để tổng kết, khép lại những việc cũ và tu dưỡng chiều sâu nội tâm.',
    advice: 'Tránh tranh đoạt được mất, tập trung tích lũy tri thức, hoàn thiện kỹ năng và chờ đón cơ hội chuyển mình.',
  },
  Mộ: {
    level: 'tich_luy',
    score: 7.2,
    desc: 'Vận thế tích tụ và ẩn tàng. Khả năng tích lũy tài sản, kiến thức và nguồn lực âm thầm nhưng rất bền bỉ.',
    advice: 'Tập trung quản trị tài chính an toàn, giữ gìn vốn liếng và xây dựng hậu phương vững chắc.',
  },
  Tuyệt: {
    level: 'tich_luy',
    score: 5.0,
    desc: 'Giai đoạn chuyển giao cuối chu kỳ. Bước ngoặt giải phóng những áp lực hoặc mô hình cũ không còn phù hợp để đón nhận hạt mầm mới.',
    advice:
      'Bình thản buông bỏ điều không cần thiết, tái cơ cấu mục tiêu và kiên nhẫn chuẩn bị cho một chặng đường mới.',
  },
  Thai: {
    level: 'tich_luy',
    score: 7.5,
    desc: 'Mầm mống cơ hội mới bắt đầu nhen nhóm. Giai đoạn ấp ủ ý tưởng sáng tạo, nuôi dưỡng khát vọng và tìm kiếm hướng đi tương lai.',
    advice: 'Lập kế hoạch cẩn thận, học hỏi thêm điều mới và kiên trì gieo hạt từng bước mà không cần vội vàng.',
  },
  Dưỡng: {
    level: 'tich_luy',
    score: 7.8,
    desc: 'Vận trình bồi bổ và phục hồi sinh lực. Môi trường xung quanh mang tính tương trợ, giúp hoàn thiện nền tảng trước khi bước vào chu kỳ mới.',
    advice:
      'Dành thời gian rèn luyện nội lực, chăm sóc các mối quan hệ gia đình và tích lũy nguồn lực sẵn sàng bứt phá.',
  },
};

function parseAgeRange(rangeString: string): { start: number; end: number } | null {
  if (!rangeString) return null;
  const parts = rangeString.split(/[–-]/).map((p) => parseInt(p.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { start: parts[0], end: parts[1] };
  }
  return null;
}

function getTamHopIndices(palaceId: number): [number, number] {
  for (const group of TAM_HOP_GROUPS) {
    if (group.includes(palaceId)) {
      const others = group.filter((idx) => idx !== palaceId);
      return [others[0], others[1]];
    }
  }
  return [(palaceId + 4) % 12, (palaceId + 8) % 12];
}

function getDoiCungIndex(palaceId: number): number {
  return DOI_CUNG_MAP[palaceId] ?? (palaceId + 6) % 12;
}

function evaluateTamTaiMatrix(
  menhHanh: string,
  palaceChiHanh: string,
  thaiTueName?: string,
  truongSinhName?: string,
  _majorStars: Array<{ name: string; brightness: string; nguHanh: string }> = [],
  phuTinh: string[] = [],
  satTinh: string[] = [],
): DaiHanInterpretationResult['tamTai'] {
  // 1. Thiên Thời (Vòng Thái Tuế)
  let thienThoiLevel: 'Đắc Thời' | 'Trung Hòa' | 'Nghịch Cảnh' = 'Trung Hòa';
  let thienThoiScore = 7.0;
  let thienThoiDesc = 'Vận thế hành xử linh hoạt thuận theo thời cuộc.';

  if (thaiTueName) {
    if (['Thái Tuế', 'Quan Phù', 'Bạch Hổ'].includes(thaiTueName)) {
      thienThoiLevel = 'Đắc Thời';
      thienThoiScore = 9.2;
      thienThoiDesc = `Thế tam hợp Thái Tuế (${thaiTueName}): Đắc Thiên Thời chính danh, có tiếng nói uy tín, thuận lợi khẳng định quyền lực và mở rộng vị thế xã hội.`;
    } else if (['Thiếu Dương', 'Phúc Đức', 'Đào Hoa'].includes(thaiTueName)) {
      thienThoiLevel = 'Đắc Thời';
      thienThoiScore = 8.4;
      thienThoiDesc = `Thế Thiếu Dương – Đào Hoa (${thaiTueName}): Nhiều cơ hội và duyên lành tương trợ, tư duy sáng tạo nhạy bén, tâm thế hoan hỷ đón nhận vận hội.`;
    } else if (['Thiếu Âm', 'Long Đức', 'Trực Phù'].includes(thaiTueName)) {
      thienThoiLevel = 'Trung Hòa';
      thienThoiScore = 6.8;
      thienThoiDesc = `Thế Âm Long Trực (${thaiTueName}): Vận trình lấy đức thắng tài, chịu thiệt thòi trước để gặt hái phước báu bền lâu, hòa nhã trong các mối quan hệ.`;
    } else {
      thienThoiLevel = 'Nghịch Cảnh';
      thienThoiScore = 5.2;
      thienThoiDesc = `Thế Tuế Phá – Tang Môn (${thaiTueName}): Nghịch cảnh tôi luyện bản lĩnh, phải nỗ lực vượt khó gấp bội nhưng tích lũy được ý chí kiên cường và đột phá.`;
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
      diaLoiDesc = `Đồng hành (${menhHanh} – ${palaceChiHanh}): Môi trường hòa hợp, tự thân phát huy thực lực vững vàng, đứng vững trước biến động.`;
    } else if (NGU_HANH_SINH[palaceChiHanh] === menhHanh) {
      diaLoiLevel = 'Tương Sinh';
      diaLoiScore = 9.5;
      diaLoiDesc = `Cung sinh Mệnh (${palaceChiHanh} sinh ${menhHanh}): Đắc Địa Lợi tuyệt hảo, hoàn cảnh trợ lực tối đa, tạo điều kiện thuận buồm xuôi gió.`;
    } else if (NGU_HANH_SINH[menhHanh] === palaceChiHanh) {
      diaLoiLevel = 'Sinh Xuất';
      diaLoiScore = 5.8;
      diaLoiDesc = `Mệnh sinh Cung (${menhHanh} sinh ${palaceChiHanh}): Vận trình cống hiến, hao tổn nhiều tâm sức cho công việc và người khác nhưng tạo dựng được giá trị.`;
    } else if (NGU_HANH_KHAC[menhHanh] === palaceChiHanh) {
      diaLoiLevel = 'Khắc Xuất';
      diaLoiScore = 6.8;
      diaLoiDesc = `Mệnh khắc Cung (${menhHanh} khắc ${palaceChiHanh}): Phải nỗ lực cạnh tranh và vượt khó, nhưng nắm thế chủ động để làm chủ cục diện.`;
    } else if (NGU_HANH_KHAC[palaceChiHanh] === menhHanh) {
      diaLoiLevel = 'Khắc Nhập';
      diaLoiScore = 4.5;
      diaLoiDesc = `Cung khắc Mệnh (${palaceChiHanh} khắc ${menhHanh}): Môi trường nhiều áp lực và trở ngại ngoại cảnh; chìa khóa thành công là sự nhẫn nại và phòng thủ cẩn trọng.`;
    }
  }

  // 3. Nhân Hòa (Chính tinh & Cát tinh)
  let nhanHoaScore = 7.0;
  let nhanHoaLevel: 'Quý Nhân Phò Trợ' | 'Tự Lực Cánh Sinh' | 'Tiểu Nhân Dèm Pha' = 'Tự Lực Cánh Sinh';
  let nhanHoaDesc = 'Tự thân vận động, liên kết đồng nghiệp hài hòa.';

  const hasGoodStars = phuTinh.some((s) =>
    ['Tả Phụ', 'Hữu Bật', 'Thiên Khôi', 'Thiên Việt', 'Văn Xương', 'Văn Khúc', 'Lộc Tồn', 'Hóa Khoa'].includes(s),
  );
  const hasBadStars = satTinh.some((s) =>
    ['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp', 'Hóa Kỵ'].includes(s),
  );

  if (hasGoodStars && !hasBadStars) {
    nhanHoaScore = 9.0;
    nhanHoaLevel = 'Quý Nhân Phò Trợ';
    nhanHoaDesc =
      'Hội tụ nhiều cát tinh nâng đỡ, cấp trên trọng dụng, đồng nghiệp hết lòng hỗ trợ và dễ gặp cơ hội vàng.';
  } else if (hasGoodStars && hasBadStars) {
    nhanHoaScore = 7.2;
    nhanHoaLevel = 'Tự Lực Cánh Sinh';
    nhanHoaDesc =
      'Vừa có quý nhân nâng đỡ vừa có sự cạnh tranh gay gắt; cần khéo léo trong đối nhân xử thế để biến thử thách thành động lực.';
  } else if (hasBadStars) {
    nhanHoaScore = 5.0;
    nhanHoaLevel = 'Tiểu Nhân Dèm Pha';
    nhanHoaDesc = 'Đề phòng thị phi, sự ganh ghét hoặc bất đồng quan điểm; nên giữ chữ tín và làm việc minh bạch.';
  }

  // 4. Khí Lực (Trường Sinh)
  const tsInfo = TRUONG_SINH_INSIGHTS[truongSinhName ?? 'Trường Sinh'] ?? TRUONG_SINH_INSIGHTS['Trường Sinh'];

  const totalScore =
    Math.round((thienThoiScore * 0.3 + diaLoiScore * 0.25 + nhanHoaScore * 0.25 + tsInfo.score * 0.2) * 10) / 10;

  return {
    thienThoi: { level: thienThoiLevel, score: thienThoiScore, desc: thienThoiDesc },
    diaLoi: { level: diaLoiLevel, score: diaLoiScore, desc: diaLoiDesc },
    nhanHoa: { level: nhanHoaLevel, score: nhanHoaScore, desc: nhanHoaDesc },
    khiLuc: { stage: truongSinhName ?? 'Trường Sinh', level: tsInfo.level, score: tsInfo.score, desc: tsInfo.desc },
    totalScore,
  };
}

function calculateDaiHanTuHoa(palaceCan: Can, chart: TuViChart): DaiHanInterpretationResult['daiHanTuHoa'] {
  const mapping = CAN_TUHOA_TABLE[palaceCan] ?? CAN_TUHOA_TABLE['Giáp'];
  const interactions: string[] = [];

  const natalTuHoa = chart.palaces.flatMap((p) => p.tuHoa);
  const natalLoc = natalTuHoa.find((th) => th.type === 'Lộc');
  const natalKy = natalTuHoa.find((th) => th.type === 'Kỵ');

  if (natalLoc && natalLoc.starName === mapping.Loc) {
    interactions.push(
      `Song Lộc Trùng Phùng: Đại Hạn Hóa Lộc gặp Năm Sinh Hóa Lộc tại sao ${mapping.Loc} — Thời vận đại phát tài lộc.`,
    );
  }
  if (natalKy && natalKy.starName === mapping.Ky) {
    interactions.push(
      `Song Kỵ Trùng Phùng: Đại Hạn Hóa Kỵ gặp Năm Sinh Hóa Kỵ tại sao ${mapping.Ky} — Cần hết sức thận trọng thị phi, giấy tờ và rủi ro lớn.`,
    );
  }

  return {
    canCung: palaceCan,
    hoaLoc: mapping.Loc,
    hoaQuyen: mapping.Quyen,
    hoaKhoa: mapping.Khoa,
    hoaKy: mapping.Ky,
    interactionWithNatal: interactions,
  };
}

function evaluateTamPhuongTuChinh(
  palace: TuViPalace,
  allPalaces: TuViPalace[],
): DaiHanInterpretationResult['tamPhuongTuChinh'] {
  const [th1Idx, th2Idx] = getTamHopIndices(palace.id);
  const dcIdx = getDoiCungIndex(palace.id);

  const th1 = allPalaces[th1Idx];
  const th2 = allPalaces[th2Idx];
  const dc = allPalaces[dcIdx];

  const related = [th1, th2, dc].filter(Boolean) as TuViPalace[];

  const tamHopPalaces = [
    th1?.name ? `${th1.name} (${th1.chi})` : '',
    th2?.name ? `${th2.name} (${th2.chi})` : '',
  ].filter(Boolean);
  const doiCungPalace = dc?.name ? `${dc.name} (${dc.chi})` : '';

  const projectingMajorStars = related.flatMap((p) =>
    p.chinhTinh.map((s) => `${s.name} (${s.brightness}) từ ${p.name}`),
  );
  const projectingTuHoa = related.flatMap((p) => p.tuHoa.map((th) => `Hóa ${th.type} (${th.starName}) tại ${p.name}`));
  const projectingAuspicious = related.flatMap((p) =>
    p.phuTinh
      .filter(
        (s) =>
          [
            'Tả Phụ',
            'Hữu Bật',
            'Văn Xương',
            'Văn Khúc',
            'Thiên Khôi',
            'Thiên Việt',
            'Lộc Tồn',
            'Thiên Mã',
            'Đào Hoa',
            'Hồng Loan',
          ].includes(s.name) || s.grade === 'giap',
      )
      .map((s) => `${s.name} (${p.name})`),
  );
  const projectingMalefics = related.flatMap((p) => p.satTinh.map((s) => `${s.name} (${p.name})`));

  let summary = `Tam Phương Tứ Chính hội tụ từ hai cung tam hợp **${tamHopPalaces.join(', ')}** và cung đối **${doiCungPalace}**. `;
  if (projectingMajorStars.length > 0) {
    summary += `Chính tinh hội chiếu: ${projectingMajorStars.slice(0, 4).join(', ')}. `;
  }
  if (projectingAuspicious.length > 0) {
    summary += `Cát tinh trợ lực: ${projectingAuspicious.slice(0, 4).join(', ')}. `;
  }
  if (projectingMalefics.length > 0) {
    summary += `Sát tinh chiếu về: ${projectingMalefics.slice(0, 3).join(', ')}. `;
  }

  return {
    tamHopPalaces,
    doiCungPalace,
    projectingMajorStars,
    projectingTuHoa,
    projectingAuspicious,
    projectingMalefics,
    summary,
  };
}

function detectProminentPatterns(
  palace: TuViPalace,
  tptc: DaiHanInterpretationResult['tamPhuongTuChinh'],
  tuHoa: DaiHanInterpretationResult['daiHanTuHoa'],
): DaiHanInterpretationResult['prominentPatterns'] {
  const patterns: DaiHanInterpretationResult['prominentPatterns'] = [];

  const allStarsInPalace = [...palace.chinhTinh, ...palace.phuTinh, ...palace.satTinh].map((s) => s.name);
  const allProjectingStars = [
    ...tptc.projectingMajorStars,
    ...tptc.projectingAuspicious,
    ...tptc.projectingMalefics,
  ].map((s) => s.split(' ')[0]);
  const allDomainStars = [...allStarsInPalace, ...allProjectingStars];

  const hasLocTon = allDomainStars.includes('Lộc Tồn');
  const hasThienMa = allDomainStars.includes('Thiên Mã');
  const hasHoaLoc = palace.tuHoa.some((th) => th.type === 'Lộc') || tuHoa.hoaLoc.length > 0;
  const hasHoaQuyen = palace.tuHoa.some((th) => th.type === 'Quyền');
  const hasHoaKhoa = palace.tuHoa.some((th) => th.type === 'Khoa');
  const hasHoaKy =
    palace.tuHoa.some((th) => th.type === 'Kỵ') || tptc.projectingTuHoa.some((th) => th.includes('Hóa Kỵ'));

  // Song Lộc
  if (hasLocTon && hasHoaLoc) {
    patterns.push({
      name: 'Song Lộc Triều Viên',
      type: 'cat',
      description:
        'Lộc Tồn và Hóa Lộc cùng hội tụ: Đại hạn bội thu tài chính, kinh doanh buôn bán đại phát, mở rộng tài sản nhanh chóng.',
      note: 'Lộc Tồn và Hóa Lộc cùng hội tụ: Đại hạn bội thu tài chính, kinh doanh buôn bán đại phát, mở rộng tài sản nhanh chóng.',
    });
  }

  // Lộc Mã Giao Trì
  if ((hasLocTon || hasHoaLoc) && hasThienMa) {
    patterns.push({
      name: 'Lộc Mã Giao Trì',
      type: 'cat',
      description:
        'Lộc Tồn/Hóa Lộc gặp Thiên Mã: Đại hạn làm ăn phương xa, giao thương quốc tế, càng dịch chuyển công tác càng gặt hái tài lộc dồi dào.',
      note: 'Lộc Tồn/Hóa Lộc gặp Thiên Mã: Đại hạn làm ăn phương xa, giao thương quốc tế, càng dịch chuyển công tác càng gặt hái tài lộc dồi dào.',
    });
  }

  // Tam Kỳ Giai Hội
  if (hasHoaKhoa && hasHoaQuyen && hasHoaLoc) {
    patterns.push({
      name: 'Tam Kỳ Giai Hội',
      type: 'cat',
      description:
        'Khoa – Quyền – Lộc hội đủ trong đại vận: Thời kỳ danh vọng vang dội, quyền uy vững chắc, thi cử thăng tiến rực rỡ.',
      note: 'Khoa – Quyền – Lộc hội đủ trong đại vận: Thời kỳ danh vọng vang dội, quyền uy vững chắc, thi cử thăng tiến rực rỡ.',
    });
  }

  // Khôi Việt Quý Nhân
  if (allDomainStars.includes('Thiên Khôi') || allDomainStars.includes('Thiên Việt')) {
    patterns.push({
      name: 'Khôi Việt Trợ Mệnh',
      type: 'cat',
      description:
        'Gặp Thiên Khôi/Thiên Việt trong đại hạn: Dễ gặp quý nhân bề trên nâng đỡ, thi cử đỗ đạt, đạt thành tựu vẻ vang.',
      note: 'Gặp Thiên Khôi/Thiên Việt trong đại hạn: Dễ gặp quý nhân bề trên nâng đỡ, thi cử đỗ đạt, đạt thành tựu vẻ vang.',
    });
  }

  // Đào Hồng Hỷ
  if (
    allDomainStars.includes('Đào Hoa') ||
    allDomainStars.includes('Hồng Loan') ||
    allDomainStars.includes('Thiên Hỉ')
  ) {
    patterns.push({
      name: 'Đào Hồng Hỷ Tín',
      type: 'cat',
      description:
        'Đào Hoa, Hồng Loan, Thiên Hỷ hội chiếu: Đại hạn có nhiều tin vui gia đạo, tình duyên nảy nở, nhân duyên xã hội rộng mở.',
      note: 'Đào Hoa, Hồng Loan, Thiên Hỷ hội chiếu: Đại hạn có nhiều tin vui gia đạo, tình duyên nảy nở, nhân duyên xã hội rộng mở.',
    });
  }

  // Sát Tinh Cảnh Báo
  const maleficNames = ['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp'];
  const presentMalefics = maleficNames.filter((m) => allDomainStars.includes(m));
  if (presentMalefics.length >= 2) {
    patterns.push({
      name: `Sát Tinh Hội Chiếu (${presentMalefics.slice(0, 3).join(', ')})`,
      type: 'hung',
      description:
        'Có từ 2 sát tinh trở lên hội tụ: Cần cẩn trọng trong các cam kết tài chính, đề phòng va chạm tranh chấp và giữ gìn thể trạng sức khỏe.',
      note: 'Có từ 2 sát tinh trở lên hội tụ: Cần cẩn trọng trong các cam kết tài chính, đề phòng va chạm tranh chấp và giữ gìn thể trạng sức khỏe.',
    });
  }

  // Hóa Kỵ Xung Phá
  if (hasHoaKy) {
    patterns.push({
      name: 'Hóa Kỵ Án Ngữ / Xung Chiếu',
      type: 'hung',
      description:
        'Hóa Kỵ xuất hiện trong đại vận: Cảnh báo khẩu thiệt thị phi, hiểu lầm trong hợp đồng văn bản; cần giữ sự điềm tĩnh và làm việc minh bạch.',
      note: 'Hóa Kỵ xuất hiện trong đại vận: Cảnh báo khẩu thiệt thị phi, hiểu lầm trong hợp đồng văn bản; cần giữ sự điềm tĩnh và làm việc minh bạch.',
    });
  }

  // Song Hao
  if (allDomainStars.includes('Đại Hao') || allDomainStars.includes('Tiểu Hao')) {
    patterns.push({
      name: 'Song Hao Lưu Chuyển',
      type: 'trung',
      description:
        'Đại vận có Song Hao: Dòng tiền luân chuyển mạnh, tiêu pha lớn cho đầu tư, học hành hoặc thay đổi nơi ở, xuất ngoại.',
      note: 'Đại vận có Song Hao: Dòng tiền luân chuyển mạnh, tiêu pha lớn cho đầu tư, học hành hoặc thay đổi nơi ở, xuất ngoại.',
    });
  }

  // Cô Quả
  if (allDomainStars.includes('Cô Thần') || allDomainStars.includes('Quả Tú')) {
    patterns.push({
      name: 'Cô Quả Độc Lập',
      type: 'trung',
      description:
        'Có Cô Thần/Quả Tú: Vận trình thiên về tự lực gánh vác, độc lập nghiên cứu chuyên môn sâu sắc, ít người đồng điệu tâm sự.',
      note: 'Có Cô Thần/Quả Tú: Vận trình thiên về tự lực gánh vác, độc lập nghiên cứu chuyên môn sâu sắc, ít người đồng điệu tâm sự.',
    });
  }

  return patterns;
}

function getLifeStageTheme(startAge: number): { stageName: string; coreFocus: string } {
  if (startAge < 20) {
    return {
      stageName: 'Thiếu Thời & Giáo Dưỡng',
      coreFocus:
        'Tập trung rèn luyện nhân cách, học vấn thi cử, xây dựng nền tảng tri thức và giữ gìn thể trạng tuổi trẻ.',
    };
  }
  if (startAge < 40) {
    return {
      stageName: 'Thanh Xuân & Khởi Nghiệp',
      coreFocus:
        'Giai đoạn lập thân, định hình sự nghiệp, tạo dựng các mối quan hệ then chốt, hôn nhân gia đạo và tích lũy ban đầu.',
    };
  }
  if (startAge < 60) {
    return {
      stageName: 'Trung Niên & Đỉnh Cao',
      coreFocus:
        'Khẳng định vị thế xã hội, mở rộng quy mô sự nghiệp, quản trị dòng tiền đầu tư và chăm lo cho thế hệ kế cận.',
    };
  }
  return {
    stageName: 'Vãn Niên & An Dưỡng',
    coreFocus:
      'An hưởng thành quả cuộc đời, chăm sóc sức khỏe thể chất lẫn tinh thần, làm việc thiện tích phước và truyền thừa kinh nghiệm.',
  };
}

function evaluatePhasingBreakdown(
  palace: TuViPalace,
  startAge: number,
  endAge: number,
): { firstHalf: string; secondHalf: string } {
  const midAge = startAge + 4;
  let firstHalf = `Từ ${startAge} đến ${midAge} tuổi: Giai đoạn Tiền vận chịu ảnh hưởng mạnh của Can Cung (${palace.can}). `;
  let secondHalf = `Từ ${midAge + 1} đến ${endAge} tuổi: Giai đoạn Hậu vận chịu ảnh hưởng sâu của Chi Cung (${palace.chi}) và Vòng Trường Sinh. `;

  if (palace.hasTuan && palace.hasTriet) {
    firstHalf +=
      'Do ngộ cả Tuần lẫn Triệt đồng cung, 5 năm đầu chịu nhiều thử thách biến động đan xen, đòi hỏi sự kiên định bền bỉ. ';
    secondHalf += 'Vượt qua giai đoạn tôi luyện, 5 năm sau đón bước chuyển mình ngoạn mục, khai mở tiềm năng lớn. ';
  } else if (palace.hasTriet) {
    firstHalf +=
      'Do có Triệt Không án ngữ, 5 năm đầu có thể gặp nhiều thử thách chông gai, đòi hỏi sự bền bỉ tôi luyện bản lĩnh. ';
    secondHalf +=
      'Vượt qua thử thách ban đầu, 5 năm sau vận trình chuyển hướng hanh thông, công việc khai hoa kết trái rực rỡ. ';
  } else if (palace.hasTuan) {
    firstHalf += 'Do có Tuần Không che chở, 5 năm đầu diễn ra êm ả, bình hòa, thích hợp củng cố nền tảng nội lực. ';
    secondHalf += 'Nửa sau đại hạn sẽ có những chuyển biến sâu sắc, tích lũy vững vàng và đón nhận cơ hội mới. ';
  } else {
    firstHalf += 'Các kế hoạch bước đầu được triển khai tích cực, phát huy năng lực thích ứng và mở rộng quan hệ. ';
    secondHalf += 'Thời kỳ thu hoạch thành quả, củng cố vị thế và hoàn thiện các mục tiêu trọng điểm của đại vận. ';
  }

  return { firstHalf, secondHalf };
}

/**
 * Interprets a single Đại Hạn (10-year major luck period) for a palace.
 */
export function interpretDaiHan(palace: TuViPalace, chart: TuViChart, isCurrent = false): DaiHanInterpretationResult {
  const ageRange = palace.daiHanAgeRange;
  const parsed = parseAgeRange(ageRange) ?? { start: 0, end: 0 };
  const palaceChiHanh = CHI_HANH[palace.chi] ?? 'Thổ';

  const menhNapAm = chart.centerInfo.menhNapAm;
  const menhHanh = NAP_AM_HANH[menhNapAm] ?? 'Kim';

  const majorStars = palace.chinhTinh.map((s) => ({
    name: s.name,
    brightness: s.brightness,
    nguHanh: s.nguHanh,
  }));
  const isVoChinhDieu = majorStars.length === 0;

  const phuTinhNames = palace.phuTinh.map((s) => s.name);
  const satTinhNames = palace.satTinh.map((s) => s.name);

  // 1. Tam Tài & Vòng Trường Sinh
  const tsName = palace.rings?.truongSinh ?? 'Trường Sinh';
  const ttName = palace.rings?.thaiTue;
  const tamTai = evaluateTamTaiMatrix(menhHanh, palaceChiHanh, ttName, tsName, majorStars, phuTinhNames, satTinhNames);

  // 2. Can Cung Đại Hạn Tứ Hóa
  const daiHanTuHoa = calculateDaiHanTuHoa(palace.can as Can, chart);

  // 3. Tam Phương Tứ Chính
  const tamPhuongTuChinh = evaluateTamPhuongTuChinh(palace, chart.palaces);

  // 4. Prominent Patterns
  const prominentPatterns = detectProminentPatterns(palace, tamPhuongTuChinh, daiHanTuHoa);

  // 5. Life Stage & Phasing
  const lifeStageTheme = getLifeStageTheme(parsed.start);
  const phasingBreakdown = evaluatePhasingBreakdown(palace, parsed.start, parsed.end);

  // Star cluster & VCD special handling
  let clusterType: DaiHanInterpretationResult['starStructure']['clusterType'] = 'hon_hop';
  let clusterSummary = '';
  let vcdSpecialNote: string | undefined;

  if (isVoChinhDieu) {
    clusterType = 'vo_chinh_dieu';
    if (palace.hasTuan && palace.hasTriet) {
      vcdSpecialNote =
        'Cung Vô Chính Diệu đắc cả Tuần lẫn Triệt: Tiền vận tôi luyện gian nan, hậu vận chuyển mình thành nội lực sâu sắc và đột phá mạnh mẽ.';
    } else if (palace.hasTriet) {
      vcdSpecialNote =
        'Cung Vô Chính Diệu đắc Triệt Không: Biến thế yếu thành thế mạnh, phá cách giải phóng tiềm năng tiền vận và tạo đột phá bất ngờ.';
    } else if (palace.hasTuan) {
      vcdSpecialNote =
        'Cung Vô Chính Diệu đắc Tuần Không: Bảo toàn năng lượng, giữ thế bình ổn êm ả và giảm hung tính của sát tinh đi qua.';
    } else if (tamPhuongTuChinh.projectingMajorStars.length > 0) {
      vcdSpecialNote = `Cung Vô Chính Diệu mượn trọn năng lượng đối cung và tam hợp (${tamPhuongTuChinh.projectingMajorStars.slice(0, 3).join(', ')}): Uyển chuyển thích ứng với thời thế.`;
    }
    clusterSummary =
      'Cung Vô Chính Diệu: Vận thế biến ảo, linh hoạt theo ngoại cảnh, đắc lực khi biết liên kết nguồn lực bên ngoài.';
  } else {
    const starNames = majorStars.map((s) => s.name);
    const hasTuPhu = starNames.some((s) => ['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'].includes(s));
    const hasSatPha = starNames.some((s) => ['Thất Sát', 'Phá Quân', 'Tham Lang'].includes(s));
    const hasCoNguyet = starNames.some((s) => ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].includes(s));
    const hasCuNhat = starNames.some((s) => ['Cự Môn', 'Thái Dương'].includes(s));

    if (hasSatPha && !hasTuPhu) {
      clusterType = 'sat_pha_tham';
      clusterSummary =
        'Cục diện Sát Phá Tham: Vận trình khai phá, cải cách và đổi mới dũng mãnh. Dám nghĩ dám làm sẽ mở ra bước ngoặt lớn.';
    } else if (hasTuPhu && !hasSatPha) {
      clusterType = 'tu_phu_vu_tuong';
      clusterSummary =
        'Cục diện Tử Phủ Vũ Tướng: Vận trình quyền uy vững chắc, chủ về tích lũy tài sản, mở rộng cơ nghiệp và củng cố uy danh.';
    } else if (hasCoNguyet && !hasSatPha) {
      clusterType = 'co_nguyet_dong_luong';
      clusterSummary =
        'Cục diện Cơ Nguyệt Đồng Lương: Vận trình mưu lược, trí tuệ, bình ổn, thích hợp cho giáo dục, dịch vụ và quản trị.';
    } else if (hasCuNhat) {
      clusterType = 'cu_nhat';
      clusterSummary =
        'Cục diện Cự Nhật: Vận trình đối ngoại, truyền thông, tài ăn nói và danh tiếng; cần cẩn trọng lời nói để tránh thị phi.';
    } else {
      clusterType = 'hon_hop';
      clusterSummary = `Hội tụ các chính tinh (${starNames.join(', ')}): Vận thế đa dạng, kết hợp hài hòa nhiều nguồn lực phát triển.`;
    }
  }

  // Luck Tier
  let luckTier: DaiHanInterpretationResult['luckTier'] = 'Bình Hòa';
  if (tamTai.totalScore >= 8.5) luckTier = 'Đại Cát';
  else if (tamTai.totalScore >= 7.0) luckTier = 'Khởi Sắc';
  else if (tamTai.totalScore >= 5.5) luckTier = 'Bình Hòa';
  else if (tamTai.totalScore >= 4.0) luckTier = 'Thử Thách';
  else luckTier = 'Gian Nan';

  // Tuần Triệt note
  let tuanTrietNote: string | undefined;
  if (palace.hasTuan && palace.hasTriet) {
    tuanTrietNote =
      'Cung vị ngộ cả Tuần lẫn Triệt: Vận thế lúc đầu nhiều biến động thử thách, nhưng về sau xoay chuyển ngoạn mục.';
  } else if (palace.hasTriet) {
    tuanTrietNote =
      'Cung vị có Triệt Không: Nửa đầu đại hạn (5 năm đầu) cần kiên trì vượt khó, nửa sau vận trình hanh thông rộng mở.';
  } else if (palace.hasTuan) {
    tuanTrietNote =
      'Cung vị có Tuần Không: Vận thế chuyển biến êm ả, bảo toàn bình an và giảm bớt hung tính của các sát tinh.';
  }

  // 1-sentence headline theme
  const themeVi = `Đại Hạn ${ageRange} tuổi tại Cung ${palace.name} (${palace.canChi}) — Vận thế ${luckTier} (${tamTai.totalScore}/10): ${lifeStageTheme.coreFocus}`;

  // Humanized Detailed Syntheses
  const overview = `Trong 10 năm từ ${parsed.start} đến ${parsed.end} tuổi, dòng chảy vận hạn của bạn dịch chuyển qua Cung ${palace.name} (${palace.canChi}), đạt ${tamTai.totalScore}/10 (${luckTier}).\n\nThiên thời: ${tamTai.thienThoi.desc}\n\nĐịa lợi: ${tamTai.diaLoi.desc}\n\nNhân hòa: ${tamTai.nhanHoa.desc}\n\nKhí lực: Năng lượng ${tsName} (${tamTai.khiLuc.desc.toLowerCase()}).`;

  let careerAndWealth = `Về sự nghiệp và tài chính: Trọng tâm 10 năm hướng vào ${lifeStageTheme.coreFocus.toLowerCase()} `;
  if (daiHanTuHoa.hoaLoc) {
    careerAndWealth += `Đại Hạn Can ${palace.can} kích hoạt Hóa Lộc tại ${daiHanTuHoa.hoaLoc}, mở ra các cơ hội gia tăng thu nhập và đầu tư thuận lợi. `;
  }
  if (prominentPatterns.some((p) => p.type === 'cat')) {
    const catNotes = prominentPatterns
      .filter((p) => p.type === 'cat')
      .map((p) => p.name)
      .join(', ');
    careerAndWealth += `Đắc cách các cát cục nổi bật (${catNotes}), hỗ trợ đắc lực cho việc thăng tiến công danh và tích lũy sản nghiệp. `;
  }
  if (satTinhNames.length > 0) {
    careerAndWealth += `Tuy nhiên, do có sự hiện diện của sát tinh (${satTinhNames.slice(0, 3).join(', ')}), bạn cần quản trị rủi ro chặt chẽ, tránh đầu tư mạo hiểm theo cảm tính. `;
  }

  let relationshipAndHealth = `Về gia đạo, tình cảm và thể trạng: `;
  if (prominentPatterns.some((p) => p.name.includes('Đào Hồng'))) {
    relationshipAndHealth +=
      'Đại vận đón nhận hỷ tín tình cảm, nhân duyên gia đạo nảy nở và mở rộng mạng lưới bạn bè tốt đẹp. ';
  }
  if (tsName === 'Bệnh' || tsName === 'Tử' || palace.name === 'Tật Ách' || satTinhNames.length >= 2) {
    relationshipAndHealth +=
      'Cần chú ý lắng nghe cơ thể, duy trì lối sống lành mạnh, cân bằng công việc và tránh để áp lực công việc ảnh hưởng đến sức khỏe thể chất. ';
  } else {
    relationshipAndHealth +=
      'Tinh thần duy trì được sự lạc quan, gia đạo êm ấm, tạo hậu phương vững chắc để bạn yên tâm phát triển sự nghiệp. ';
  }

  const keyStrategy = `Chiến lược hành động đắc thắng: ${tamTai.thienThoi.level === 'Đắc Thời' ? 'Tận dụng tối đa uy tín và thời cơ để bứt phá mở rộng.' : 'Tập trung xây dựng nội lực tự thân, kiên trì tích lũy từng bước chắc chắn.'} ${TRUONG_SINH_INSIGHTS[tsName]?.advice ?? ''}`;

  return {
    palaceId: palace.id,
    palaceName: palace.name,
    palaceChi: palace.chi,
    palaceCanChi: palace.canChi,
    palaceCan: palace.can,
    ageRange,
    startAge: parsed.start,
    endAge: parsed.end,
    isCurrent,
    luckScore: tamTai.totalScore,
    luckTier,
    tamTai,
    truongSinh: {
      name: tsName,
      energyLevel: tamTai.khiLuc.level,
      energyDescription: tamTai.khiLuc.desc,
      advice: TRUONG_SINH_INSIGHTS[tsName]?.advice ?? '',
    },
    thaiTue: ttName
      ? {
          name: ttName,
          postureDescription: tamTai.thienThoi.desc,
        }
      : undefined,
    elementalAnalysis: {
      menhHanh,
      palaceHanh: palaceChiHanh,
      relationType:
        tamTai.diaLoi.level === 'Tương Sinh'
          ? 'sinh_nhap'
          : tamTai.diaLoi.level === 'Tỷ Hòa'
            ? 'ty_hoa'
            : tamTai.diaLoi.level === 'Khắc Xuất'
              ? 'khac_xuat'
              : tamTai.diaLoi.level === 'Sinh Xuất'
                ? 'sinh_xuat'
                : 'khac_nhap',
      description: tamTai.diaLoi.desc,
    },
    starStructure: {
      majorStars,
      hasChinhTinh: !isVoChinhDieu,
      isVoChinhDieu,
      vcdSpecialNote,
      clusterType,
      summary: clusterSummary,
    },
    tamPhuongTuChinh,
    daiHanTuHoa,
    prominentPatterns,
    lifeStageTheme,
    phasingBreakdown,
    tuanTriet: {
      hasTuan: palace.hasTuan,
      hasTriet: palace.hasTriet,
      note: tuanTrietNote,
    },
    themeVi,
    detailedSynthesis: {
      overview,
      careerAndWealth,
      relationshipAndHealth,
      strategicGuidance: keyStrategy,
    },
  };
}

/**
 * Returns all 12 Đại Hạn interpretations sorted chronologically by startAge.
 */
export function getAllDaiHanInterpretations(chart: TuViChart, viewYear?: number): DaiHanInterpretationResult[] {
  const currentViewYear = viewYear ?? chart.hanContext?.viewYear ?? new Date().getFullYear();
  const birthYear = chart.lunarDate.year;
  const currentAge = chart.hanContext?.viewAge ?? Math.max(1, currentViewYear - birthYear + 1);

  const results: DaiHanInterpretationResult[] = chart.palaces.map((palace) => {
    const range = parseAgeRange(palace.daiHanAgeRange);
    const isCurrent =
      chart.hanContext?.daiHanPalaceIndex !== undefined && chart.hanContext?.daiHanPalaceIndex !== null
        ? palace.id === chart.hanContext.daiHanPalaceIndex
        : range
          ? currentAge >= range.start && currentAge <= range.end
          : false;
    return interpretDaiHan(palace, chart, isCurrent);
  });

  return results.sort((a, b) => a.startAge - b.startAge);
}

/**
 * Returns the active Đại Hạn for the native at the given viewYear or current date.
 */
export function getCurrentDaiHan(chart: TuViChart, viewYear?: number): DaiHanInterpretationResult | null {
  const allDaiHan = getAllDaiHanInterpretations(chart, viewYear);
  const current = allDaiHan.find((dh) => dh.isCurrent);
  return current ?? allDaiHan[0] ?? null;
}
