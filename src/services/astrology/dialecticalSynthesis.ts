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
    dominantElement?: string;
    chartRuler?: string;
  };
  tuvi: {
    menhCung: string;
    thanCung: string;
    menhNapAm: string;
    cuc: string;
    chinhTinhMenh: string[];
    chinhTinhThan: string[];
    tuHoa: string[];
  };
  vedic: {
    lagnaSign: string;
    moonRasiSign: string;
    nakshatra?: string;
    atmakaraka?: string;
  };
}

export interface DialecticalSynthesisResult {
  socialPersonaVi: string;
  circumstantialDestinyVi: string;
  soulCoreVi: string;
  consensusGiftsVi: string[];
  growthTensionsVi: string[];
  unifiedLifeAdviceVi: string;
}

/**
 * Synthesizes cross-system insights into a multi-layered dialectical report.
 */
export function synthesizeTriSystemReport(input: TriSystemInput): DialecticalSynthesisResult {
  const { western, tuvi, vedic } = input;

  // 1. Tầng 1: Ý Thức & Phong Thái Xã Hội (Tây Phương Tropical)
  const socialPersonaVi = `Ở tầng ý thức bề mặt và cách bạn tiếp cận xã hội (Tây Phương), bạn thể hiện cái tôi mang khí chất ${western.sunSign} (ý chí & lý tưởng), được định hình qua lăng kính phong thái ${western.ascSign}${western.chartRuler ? ` và được dẫn dắt bởi chủ tinh ${western.chartRuler}` : ''}. Đây là cách người khác nhìn nhận bạn trong các mối quan hệ xã hội thường nhật.`;

  // 2. Tầng 2: Hoàn Cảnh & Vận Trình Thực Tế (Tử Vi Đông Phương)
  const chinhTinhStr = tuvi.chinhTinhMenh.length > 0 ? tuvi.chinhTinhMenh.join(', ') : 'Vô Chính Diệu';
  const tuHoaStr = tuvi.tuHoa.length > 0 ? ` kết hợp sự biến hóa của Tứ Hóa [${tuvi.tuHoa.join(', ')}]` : '';
  const circumstantialDestinyVi = `Ở tầng hoàn cảnh sống và môi trường thời vận thực tế (Tử Vi), bản mệnh mang nạp âm ${tuvi.menhNapAm}, tọa thủ tại Cung ${tuvi.menhCung} với các sao chủ chốt [${chinhTinhStr}]${tuHoaStr}. Sự tương tác giữa Mệnh và Cục (${tuvi.cuc}) phản ánh môi trường gia đình, công việc và những bước ngoặt cụ thể trong đời thực.`;

  // 3. Tầng 3: Chiều Sâu Tâm Thức & Nghiệp Quả (Vệ Đà Sidereal Jyotish)
  const soulCoreVi = `Ở tầng tâm thức sâu kín và động lực linh hồn (Vệ Đà), Cung Mọc Vệ Đà (Lagna) tại ${vedic.lagnaSign}, tâm trí (Rasi) tại ${vedic.moonRasiSign}${vedic.nakshatra ? ` thuộc chòm sao ${vedic.nakshatra}` : ''}${vedic.atmakaraka ? ` và hành tinh chủ linh hồn (Atmakaraka) là ${vedic.atmakaraka}` : ''}. Đây là nơi chứa đựng trực giác vô thức, khát vọng sâu thẳm nhất và bài học nghiệp lực cả đời bạn cần hoàn thiện.`;

  // 4. Consensus Gifts & Strengths
  const consensusGiftsVi: string[] = [
    `Sự kết hợp đa tầng giữa tư chất ${western.sunSign} (Tây Phương) và ${chinhTinhStr} (Tử Vi) giúp bạn có bản lĩnh tự chủ và phong cách tư duy độc đáo.`,
    `Thế liên kết giữa Mặt Trăng ${western.moonSign} và Rasi ${vedic.moonRasiSign} mang lại trực giác nhạy bén, khả năng thích ứng linh hoạt trước biến động.`,
  ];

  // 5. Growth Tensions & Synthesis
  const growthTensionsVi: string[] = [];
  if (western.sunSign !== vedic.lagnaSign) {
    growthTensionsVi.push(
      `Sự khác biệt giữa hình ảnh xã hội (${western.sunSign} Tây Phương) và động lực nội tâm sâu kín (${vedic.lagnaSign} Vệ Đà): Bạn có thể xuất hiện rất quyết đoán bên ngoài nhưng bên trong lại suy tư chiêm nghiệm nhiều hơn người khác tưởng.`
    );
  }
  if (tuvi.tuHoa.some((th) => th.includes('Kỵ'))) {
    growthTensionsVi.push(
      'Sự hiện diện của Hóa Kỵ đòi hỏi bạn học cách kiên nhẫn với các bước lùi tạm thời, chuyển hóa áp lực thành kinh nghiệm chiến lược.'
    );
  } else {
    growthTensionsVi.push(
      'Cần chú ý giữ nhịp cân bằng giữa việc bứt phá công danh xã hội và nuôi dưỡng sự bình an trong đời sống tinh thần.'
    );
  }

  // 6. Unified Life Guidance (Thân - Tâm - Trí)
  const unifiedLifeAdviceVi = `Kim chỉ nam thống nhất: Hãy lấy sự tự tin của ${western.sunSign} làm đòn bẩy hành động, dùng kỷ luật và sự bền bỉ của ${chinhTinhStr} để quản trị công việc thực tế, và luôn giữ gìn sự trong sáng, bình an nơi tâm hồn theo chỉ dẫn của ${vedic.moonRasiSign} / ${vedic.lagnaSign}. Khi Thân - Tâm - Trí hòa hợp, bạn sẽ khai mở trọn vẹn tiềm năng cuộc đời.`;

  return {
    socialPersonaVi,
    circumstantialDestinyVi,
    soulCoreVi,
    consensusGiftsVi,
    growthTensionsVi,
    unifiedLifeAdviceVi,
  };
}
