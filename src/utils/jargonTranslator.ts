/**
 * Dual-Layer Jargon Translation & Cognitive Offloading Utility — Lịch Việt v3
 *
 * Preserves 100% authentic classical astrological terms (Apex T-Square, Atmakaraka, Vô Chính Diệu...)
 * while providing supportive plain-language subtitles and psychological reframing tooltips for casual users.
 */

export interface DualLayerTerm {
  classicalTerm: string;
  category: 'western' | 'tuvi' | 'vedic' | 'general';
  plainSubtitleVi: string;
  psychologicalMeaningVi: string;
  actionableHintVi: string;
}

export const DUAL_LAYER_TERMS_DICTIONARY: Record<string, DualLayerTerm> = {
  // ── Western Astrology ─────────────────────────────────────────
  'Apex': {
    classicalTerm: 'Apex (Hành Tinh Đỉnh)',
    category: 'western',
    plainSubtitleVi: 'Điểm gánh áp lực lớn nhất & bộc phát năng lượng',
    psychologicalMeaningVi: 'Nơi tập trung mọi căng thẳng từ góc đối đỉnh và chuyển hóa thành động lực hành động mạnh mẽ.',
    actionableHintVi: 'Tập trung năng lượng vào các mục tiêu sáng tạo hoặc thể thao để giải tỏa áp lực lành mạnh.',
  },
  'Empty Leg': {
    classicalTerm: 'Empty Leg (Điểm Giải Tỏa Năng Lượng Đối Đỉnh)',
    category: 'western',
    plainSubtitleVi: 'Điểm tựa cân bằng & giải pháp hóa giải xung đột',
    psychologicalMeaningVi: 'Khu vực hoặc phẩm chất đối diện giúp giải phóng năng lượng tắc nghẽn của hành tinh đỉnh.',
    actionableHintVi: 'Phát triển các đức tính của cung và nhà đối diện để tìm lại trạng thái an yên.',
  },
  'T-Square': {
    classicalTerm: 'T-Square (Mô Hình Chữ T Vuông)',
    category: 'western',
    plainSubtitleVi: 'Cấu trúc tạo sức bật từ áp lực nội tâm',
    psychologicalMeaningVi: 'Sự kết hợp giữa 1 góc đối đỉnh (180°) và 2 góc vuông (90°) tạo nên động lực vươn lên phi thường.',
    actionableHintVi: 'Biến cảm giác bất an thành năng suất lao động và thành tựu thực tế.',
  },
  'Grand Trine': {
    classicalTerm: 'Grand Trine (Tam Giác Đại Cát)',
    category: 'western',
    plainSubtitleVi: 'Dòng chảy tài năng thiên bẩm tự nhiên',
    psychologicalMeaningVi: 'Sự tuần hoàn hài hòa năng lượng của cùng 1 nguyên tố (Lửa/Đất/Khí/Nước).',
    actionableHintVi: 'Cần có tính chủ động và kỷ luật để không lãng phí tài năng có sẵn.',
  },
  'Chart Ruler': {
    classicalTerm: 'Chart Ruler (Chủ Tinh Cung Mọc)',
    category: 'western',
    plainSubtitleVi: 'Hành tinh dẫn đường & kim chỉ nam cuộc đời',
    psychologicalMeaningVi: 'Ngôi sao chủ quản Cung Mọc, chỉ ra lĩnh vực then chốt mà bạn dồn nhiều tâm huyết nhất.',
    actionableHintVi: 'Khai thác tối đa thế mạnh của cung và nhà nơi Chủ tinh tọa thủ.',
  },

  // ── Tử Vi Đẩu Số ──────────────────────────────────────────────
  'Vô Chính Diệu': {
    classicalTerm: 'Cung Vô Chính Diệu (Không Có Chính Tinh)',
    category: 'tuvi',
    plainSubtitleVi: 'Cung vị linh hoạt, thích ứng cao & mượn lực ngoại cảnh',
    psychologicalMeaningVi: 'Tâm tính mềm dẻo, dễ hòa nhập với môi trường nhưng cần rèn luyện tính tự chủ kiên định.',
    actionableHintVi: 'Dựa vào thực lực đối cung và trợ lực từ quý nhân xung quanh.',
  },
  'Triệt Không': {
    classicalTerm: 'Triệt Không (Nút Thắt Thử Thách Tiền Vận)',
    category: 'tuvi',
    plainSubtitleVi: 'Bài học tôi luyện ý chí trước tuổi 30',
    psychologicalMeaningVi: 'Kìm hãm những bộc phát non nớt thời trẻ để tích lũy nội lực chiều sâu cho hậu vận.',
    actionableHintVi: 'Kiên trì trước khó khăn đầu đời, không nản chí vì thành công lớn sẽ đến sau tuổi 30.',
  },
  'Tuần Không': {
    classicalTerm: 'Tuần Không (Vùng Bao Bọc Giữ Nhịp)',
    category: 'tuvi',
    plainSubtitleVi: 'Lực giữ nhịp êm ả, bảo vệ sự ổn định lâu dài',
    psychologicalMeaningVi: 'Làm chậm tốc độ phát triển nhưng giúp giảm bớt hung tính của sát tinh và giữ sự vững bền.',
    actionableHintVi: 'Phát triển theo chiều sâu, tránh nóng vội đốt cháy giai đoạn.',
  },
  'Hóa Lộc': {
    classicalTerm: 'Hóa Lộc (Thiên Phú Của Cải & Cơ Duyên)',
    category: 'tuvi',
    plainSubtitleVi: 'Kích hoạt tài lộc, cơ hội hanh thông & sự dễ chịu',
    psychologicalMeaningVi: 'Nơi vũ trụ trao tặng bạn sự thuận lợi tự nhiên và duyên lành tài chính.',
    actionableHintVi: 'Chủ động đón nhận cơ hội và chia sẻ giá trị cho cộng đồng.',
  },
  'Hóa Quyền': {
    classicalTerm: 'Hóa Quyền (Năng Lực Lãnh Đạo & Tự Quyết)',
    category: 'tuvi',
    plainSubtitleVi: 'Uy thế, quyền lực & khả năng chỉ huy',
    psychologicalMeaningVi: 'Khát khao kiểm soát, trách nhiệm cao và khả năng dẫn dắt tập thể vượt qua khó khăn.',
    actionableHintVi: 'Lắng nghe phản biện cấp dưới để quyền uy đi liền với sự phục lòng.',
  },
  'Hóa Khoa': {
    classicalTerm: 'Hóa Khoa (Danh Tiếng & Trí Tuệ Cứu Giải)',
    category: 'tuvi',
    plainSubtitleVi: 'Học vấn uyên bác, danh thơm & đệ nhất cứu giải',
    psychologicalMeaningVi: 'Trí tuệ minh mẫn, khả năng biến nguy thành an bằng sự hiểu biết và uy tín cá nhân.',
    actionableHintVi: 'Không ngừng học tập và giữ gìn đạo đức chuẩn mực trong mọi việc.',
  },
  'Hóa Kỵ': {
    classicalTerm: 'Hóa Kỵ (Nút Thắt Chuyển Hóa & Áp Lực)',
    category: 'tuvi',
    plainSubtitleVi: 'Vùng thử thách đòi hỏi sự nhẫn nại & chiều sâu',
    psychologicalMeaningVi: 'Nơi tiềm thức chứa đựng sự lo âu hoặc vướng bận, nhưng cũng là mỏ vàng kinh nghiệm nếu vượt qua.',
    actionableHintVi: 'Gỡ rối từng bước với thái độ điềm tĩnh, tránh phản ứng cảm xúc bộc phát.',
  },

  // ── Vedic Jyotish ─────────────────────────────────────────────
  'Atmakaraka': {
    classicalTerm: 'Atmakaraka (Hành Tinh Chủ Linh Hồn)',
    category: 'vedic',
    plainSubtitleVi: 'Ngôi sao đại diện cho khát vọng sâu thẳm của linh hồn',
    psychologicalMeaningVi: 'Hành tinh có độ dài cao nhất trong lá số, thể hiện bài học tiến hóa tâm linh lớn nhất trong kiếp sống này.',
    actionableHintVi: 'Sống chân thật với giá trị cốt lõi mà hành tinh này đại diện.',
  },
  'Vimshottari Dasha': {
    classicalTerm: 'Vimshottari Dasha (Chu Kỳ Thời Vận 120 Năm)',
    category: 'vedic',
    plainSubtitleVi: 'Dòng thời gian kích hoạt các giai đoạn cuộc đời',
    psychologicalMeaningVi: 'Hệ thống vận hạn thiên văn chỉ ra hành tinh nào đang nắm quyền điều khiển thời vận hiện tại.',
    actionableHintVi: 'Thuận theo chu kỳ năng lượng của hành tinh đại vận để gặt hái thành quả tối ưu.',
  },
  'Astangata': {
    classicalTerm: 'Astangata (Hiện Tượng Thiêu Đốt Bởi Mặt Trời)',
    category: 'vedic',
    plainSubtitleVi: 'Năng lượng hành tinh bị tôi luyện dưới sức nóng Mặt Trời',
    psychologicalMeaningVi: 'Khi hành tinh ở quá gần Mặt Trời (< 3°), biểu hiện bên ngoài có thể bị che khuất nhưng nội lực bên trong rất mãnh liệt.',
    actionableHintVi: 'Tránh khoe khoang bên ngoài, tập trung phát triển chiều sâu chuyên môn bí mật.',
  },
};

/**
 * Returns dual-layer term details or a fallback with classical formatting.
 */
export function getDualLayerTerm(termKey: string): DualLayerTerm {
  return (
    DUAL_LAYER_TERMS_DICTIONARY[termKey] ?? {
      classicalTerm: termKey,
      category: 'general',
      plainSubtitleVi: 'Khái niệm học thuật đặc thù',
      psychologicalMeaningVi: 'Tác động năng lượng đặc thù lên bản mệnh.',
      actionableHintVi: 'Phát huy mặt tích cực và chuyển hóa các điểm chưa trọn vẹn.',
    }
  );
}
