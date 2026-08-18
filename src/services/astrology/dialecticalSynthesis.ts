/**
 * Dialectical Tri-System Synthesis Engine — Lịch Việt v3
 *
 * Integrates and cross-references Western Astrology (Tropical / Conscious Social Persona),
 * Tử Vi Đẩu Số (Circumstantial Reality & Social Fate), and Vedic Astrology (Sidereal / Soul Core)
 * into a profound, multi-layered psychological synthesis without forcing false equivalence.
 */

export interface TriSystemInput {
  western: {
    sunSign: string;
    moonSign: string;
    ascSign: string;
    sunHouse?: number;
    moonHouse?: number;
    dominantElement?: string;
    chartRuler?: string;
    chartRulerHouse?: number;
    isDiurnal?: boolean;
  };
  tuvi: {
    menhCung: string;
    thanCung: string;
    menhNapAm: string;
    cuc: string;
    chinhTinhMenh: string[];
    chinhTinhThan: string[];
    tuHoa: string[];
    amDuongThuanLy?: boolean;
  };
  vedic: {
    lagnaSign: string;
    moonRasiSign: string;
    nakshatra?: string;
    pada?: number;
    atmakaraka?: string;
    activeYogas?: string[];
    activeDashaLord?: string;
  };
}

export interface DialecticalSynthesisResult {
  socialPersonaVi: string;
  circumstantialDestinyVi: string;
  soulCoreVi: string;
  consensusGiftsVi: string[];
  growthTensionsVi: string[];
  unifiedLifeAdviceVi: string;
  elementalAlchemyVi?: string;
  dashaConvergenceVi?: string;
  triTraditionMatrix?: Array<{ layer: string; western: string; tuvi: string; vedic: string }>;
}

/**
 * Synthesizes cross-system insights into a multi-layered dialectical report.
 */
export function synthesizeTriSystemReport(input: TriSystemInput): DialecticalSynthesisResult {
  const { western, tuvi, vedic } = input;

  // 1. Tầng 1: Ý Thức & Phong Thái Xã Hội (Tây Phương Tropical)
  const sunHouseStr = western.sunHouse ? ` tại Nhà ${western.sunHouse}` : '';
  const rulerStr = western.chartRuler
    ? ` và được dẫn dắt bởi Chủ tinh Cung Mọc ${western.chartRuler}${western.chartRulerHouse ? ` (Nhà ${western.chartRulerHouse})` : ''}`
    : '';
  const sectStr =
    western.isDiurnal != null
      ? western.isDiurnal
        ? ' (Lá số Ban Ngày — trọng tâm vào ý chí hành động tỉnh thức)'
        : ' (Lá số Ban Đêm — trọng tâm vào trực giác và chiều sâu nội tâm)'
      : '';
  const socialPersonaVi = `Ở tầng ý thức bề mặt và cách bạn tương tác với xã hội (Tây Phương), bạn mang khí chất ${western.sunSign}${sunHouseStr} (ý chí & lý tưởng cốt lõi), được định hình qua lăng kính phong thái Cung Mọc ${western.ascSign}${rulerStr}${sectStr}. Đây là hình ảnh đại diện và phong cách làm việc mà thế giới bên ngoài cảm nhận rõ nhất ở bạn.`;

  // 2. Tầng 2: Hoàn Cảnh & Vận Trình Thực Tế (Tử Vi Đông Phương)
  const chinhTinhStr = tuvi.chinhTinhMenh.length > 0 ? tuvi.chinhTinhMenh.join(', ') : 'Vô Chính Diệu';
  const tuHoaStr = tuvi.tuHoa.length > 0 ? ` kết hợp sự biến hóa của Tứ Hóa **${tuvi.tuHoa.join(', ')}**` : '';
  const amDuongStr =
    tuvi.amDuongThuanLy != null
      ? tuvi.amDuongThuanLy
        ? ' Cấu trúc Âm Dương Thuận Lý tạo điều kiện thuận buồm xuôi gió khi nắm bắt thời cơ.'
        : ' Cấu trúc Âm Dương Nghịch Lý đòi hỏi sự kiên trì tôi luyện và bản lĩnh tự lập cao.'
      : '';
  const thanCungStr = tuvi.thanCung ? `, định hướng hậu vận dịch chuyển về ${tuvi.thanCung}` : '';
  const circumstantialDestinyVi = `Ở tầng hoàn cảnh sống và môi trường thời vận thực tế (Tử Vi), bản mệnh mang nạp âm ${tuvi.menhNapAm}, tọa thủ tại Cung ${tuvi.menhCung} với các sao chủ chốt **${chinhTinhStr}**${tuHoaStr}${thanCungStr}. Sự tương tác giữa Mệnh và Cục (${tuvi.cuc}) phản ánh môi trường gia đình, công việc và những bước ngoặt cụ thể trong đời thực.${amDuongStr}`;

  // 3. Tầng 3: Chiều Sâu Tâm Thức & Nghiệp Quả (Vệ Đà Sidereal Jyotish)
  const padaStr = vedic.pada != null ? ` (Pada ${vedic.pada})` : '';
  const nakshatraStr = vedic.nakshatra ? ` thuộc chòm sao Janma Nakshatra ${vedic.nakshatra}${padaStr}` : '';
  const akStr = vedic.atmakaraka ? ` và hành tinh chủ linh hồn (Atmakaraka) là ${vedic.atmakaraka}` : '';
  const dashaStr = vedic.activeDashaLord
    ? ` Đại vận Vimshottari đang được kích hoạt bởi năng lượng của ${vedic.activeDashaLord}.`
    : '';
  const soulCoreVi = `Ở tầng tâm thức sâu kín và động lực linh hồn (Vệ Đà), Cung Mọc Vệ Đà (Lagna) tại ${vedic.lagnaSign}, tâm trí (Rasi) tại ${vedic.moonRasiSign}${nakshatraStr}${akStr}.${dashaStr} Đây là nơi chứa đựng trực giác vô thức, khát vọng sâu thẳm nhất và bài học nghiệp lực (Karma) cả đời bạn cần hoàn thiện.`;

  // 4. Consensus Gifts & Strengths
  const consensusGiftsVi: string[] = [
    `Sự kết hợp đa tầng giữa tư chất ${western.sunSign} (Tây Phương) và ${chinhTinhStr} (Tử Vi) giúp bạn có bản lĩnh tự chủ và phong cách tư duy độc đáo.`,
    `Thế liên kết giữa Mặt Trăng ${western.moonSign} và Rasi ${vedic.moonRasiSign}${vedic.nakshatra ? ` (${vedic.nakshatra})` : ''} mang lại trực giác nhạy bén, khả năng thích ứng linh hoạt trước biến động.`,
  ];
  if (vedic.activeYogas && vedic.activeYogas.length > 0) {
    consensusGiftsVi.push(
      `Cấu trúc cát cách Vệ Đà (${vedic.activeYogas[0]}) củng cố năng lực dẫn dắt và vận may hanh thông trong đại vận.`,
    );
  }

  // 5. Growth Tensions & Synthesis
  const growthTensionsVi: string[] = [];
  if (western.sunSign !== vedic.lagnaSign) {
    growthTensionsVi.push(
      `Sự khác biệt giữa hình ảnh xã hội (${western.sunSign} Tây Phương) và động lực nội tâm sâu kín (${vedic.lagnaSign} Vệ Đà): Bạn có thể xuất hiện rất quyết đoán bên ngoài nhưng bên trong lại suy tư chiêm nghiệm nhiều hơn người khác tưởng.`,
    );
  }
  if (tuvi.tuHoa.some((th) => th.includes('Kỵ'))) {
    growthTensionsVi.push(
      'Sự hiện diện của Hóa Kỵ đòi hỏi bạn học cách kiên nhẫn với các bước lùi tạm thời, chuyển hóa áp lực thành kinh nghiệm chiến lược.',
    );
  } else {
    growthTensionsVi.push(
      'Cần chú ý giữ nhịp cân bằng giữa việc bứt phá công danh xã hội và nuôi dưỡng sự bình an trong đời sống tinh thần.',
    );
  }

  // 6. Elemental Alchemy
  const elementalAlchemyVi = `Ngũ hành bản mệnh ${tuvi.menhNapAm} tương phối với nguyên tố trội ${western.dominantElement ?? 'Đa nguyên'} (Tây Phương) và khí chất Jyotish: Nguồn năng lượng tự nhiên của bạn cần được tiếp đất bằng hành động kỷ luật và rèn luyện thể chất đều đặn.`;

  // 7. Dasha & Timing Convergence
  const dashaConvergenceVi = vedic.activeDashaLord
    ? `Hội tụ thời vận: Giai đoạn vận hành của Đại vận ${vedic.activeDashaLord} (Vệ Đà) đồng pha với tiến trình dịch chuyển Cung Thân (${tuvi.thanCung}) của Tử Vi, mở ra cơ hội chuyển mình then chốt.`
    : 'Hội tụ thời vận: Các đại vận Đông - Tây tương hỗ, giúp đương số chủ động nắm bắt cơ hội chuyển mình.';

  // 8. Tri-Tradition Comparative Matrix
  const triTraditionMatrix = [
    {
      layer: 'Bản sắc & Khí chất',
      western: `Mặt Trời ${western.sunSign}, Mọc ${western.ascSign}`,
      tuvi: `Mệnh tại ${tuvi.menhCung} (${chinhTinhStr})`,
      vedic: `Lagna tại ${vedic.lagnaSign}`,
    },
    {
      layer: 'Tâm trí & Trực giác',
      western: `Mặt Trăng ${western.moonSign}`,
      tuvi: `Nạp âm ${tuvi.menhNapAm}`,
      vedic: `Chandra tại ${vedic.moonRasiSign} (${vedic.nakshatra ?? 'Nakshatra'})`,
    },
    {
      layer: 'Sứ mệnh & Hậu vận',
      western: `Chủ tinh ${western.chartRuler ?? 'Cung Mọc'}`,
      tuvi: `Thân cư ${tuvi.thanCung} (${tuvi.cuc})`,
      vedic: `Atmakaraka ${vedic.atmakaraka ?? 'Soul Lord'}`,
    },
  ];

  // 9. Unified Life Guidance (Thân - Tâm - Trí)
  const unifiedLifeAdviceVi = `Kim chỉ nam thống nhất: Hãy lấy sự tự tin của ${western.sunSign} làm đòn bẩy hành động, dùng kỷ luật và sự bền bỉ của ${chinhTinhStr} để quản trị công việc thực tế, và luôn giữ gìn sự trong sáng, bình an nơi tâm hồn theo chỉ dẫn của ${vedic.moonRasiSign} / ${vedic.lagnaSign}. Khi Thân - Tâm - Trí hòa hợp, bạn sẽ khai mở trọn vẹn tiềm năng cuộc đời.`;

  return {
    socialPersonaVi,
    circumstantialDestinyVi,
    soulCoreVi,
    consensusGiftsVi,
    growthTensionsVi,
    unifiedLifeAdviceVi,
    elementalAlchemyVi,
    dashaConvergenceVi,
    triTraditionMatrix,
  };
}
