/**
 * Tử Vi 12-Palace Holistic Interpretation Engine (SCTE) — Lịch Việt v3
 *
 * Provides deep, contextual, multi-layered interpretations for any of the 12 palaces
 * combining Major Stars (Chính tinh), Tứ Hóa (Mutagens), Auxiliaries, Tuần/Triệt,
 * and Tam Phương Tứ Chính without bloating bundle size.
 */

import type { TuViPalace, TuViStar, TuViCenterInfo } from '../../types/tuvi';
import { detectTamHopPalaces, detectDoiCung, detectCombinations } from './combinationDetection';

export interface PalaceInterpretationResult {
  palaceId: number;
  palaceName: string;
  palaceBranch: string;
  isMenh: boolean;
  isThan: boolean;
  coreThemeVi: string;
  majorStarsAnalysisVi: string;
  cachCucAnalysisVi?: {
    name: string;
    purity: string;
    description: string;
    synthesisVi: string;
  };
  tuHoaAnalysisVi: string[];
  auxiliaryAndMaleficVi: string;
  tuanTrietAnalysisVi?: string;
  tamPhuongTuChinhVi: string;
  daiHanAdviceVi?: string;
  actionableGuidanceVi: string;
}

const PALACE_DOMAIN_THEMES: Record<string, { role: string; focus: string }> = {
  'Mệnh': { role: 'Bản Mệnh & Cốt Cách', focus: 'Tư chất bẩm sinh, ý chí, tính cách cốt lõi và tiềm năng cả đời' },
  'Phụ Mẫu': { role: 'Phụ Mẫu & Cội Nguồn', focus: 'Mối quan hệ với cha mẹ, nền tảng gia giáo và sự nâng đỡ từ bề trên' },
  'Phúc Đức': { role: 'Phúc Đức & Tâm Hồn', focus: 'Căn cơ phước đức tổ tiên, đời sống tinh thần, tuổi thọ và sự bình an' },
  'Điền Trạch': { role: 'Điền Trạch & Sản Nghiệp', focus: 'Khả năng tích lũy bất động sản, nhà cửa, nơi an cư và môi trường sống' },
  'Quan Lộc': { role: 'Quan Lộc & Sự Nghiệp', focus: 'Con đường công danh, vị thế xã hội, phong cách làm việc và đỉnh cao sự nghiệp' },
  'Nô Bộc': { role: 'Nô Bộc & Bằng Hữu', focus: 'Mạng lưới bạn bè, đồng nghiệp, cấp dưới và đối tác tương trợ' },
  'Thiên Di': { role: 'Thiên Di & Đối Ngoại', focus: 'Môi trường xã hội bên ngoài, khả năng xuất ngoại, đi xa và giao thiệp' },
  'Tật Ách': { role: 'Tật Ách & Thể Trạng', focus: 'Sức khỏe thể chất, tâm lý, các giai đoạn thử thách và năng lực phục hồi' },
  'Tài Bạch': { role: 'Tài Bạch & Tài Chính', focus: 'Khả năng kiếm tiền, quản trị dòng vốn, tích lũy của cải và tư duy tài chính' },
  'Tử Tức': { role: 'Tử Tức & Hậu Duệ', focus: 'Đường con cái, sự kế thừa thế hệ sau và niềm vui gia đạo tương lai' },
  'Phu Thê': { role: 'Phu Thê & Hôn Nhân', focus: 'Mối quan hệ với người phối ngẫu, hạnh phúc hôn nhân và sự đồng điệu' },
  'Huynh Đệ': { role: 'Huynh Đệ & Tương Trợ', focus: 'Tình cảm anh chị em trong nhà, sự gắn kết và tương trợ trong gia đình' },
};

const STAR_CORE_TRAITS: Record<string, { nature: string; brightGift: string; dimChallenge: string }> = {
  'Tử Vi': {
    nature: 'Đế tinh chí tôn, chủ về quyền uy, bao dung và phẩm cách lãnh đạo.',
    brightGift: 'Tố chất chỉ huy tự nhiên, đĩnh đạc, được mọi người kính nể và có hoài bão lớn lao.',
    dimChallenge: 'Dễ có tính cô độc, cần học cách lắng nghe phản biện và hòa đồng với tập thể.',
  },
  'Thiên Phủ': {
    nature: 'Lệnh tinh cai quản tài khố, chủ về sự cẩn trọng, phúc hậu và quản trị tài sản.',
    brightGift: 'Tư duy tài chính sắc bén, tính tình điềm đạm, biết tích lũy và xây dựng hậu phương vững chắc.',
    dimChallenge: 'Đôi khi quá an phận hoặc cẩn thận thái quá làm bỏ lỡ thời cơ đột phá.',
  },
  'Thái Dương': {
    nature: 'Nhật tinh quang minh chính đại, chủ về danh vọng, sự cống hiến và hào sảng.',
    brightGift: 'Trí tuệ minh mẫn, tinh thần tiên phong, hào hiệp trượng nghĩa và dễ thành công rực rỡ.',
    dimChallenge: 'Dễ hao tán sức lực vì người khác, tính tình bộc trực đôi khi làm mất lòng tiểu nhân.',
  },
  'Thái Âm': {
    nature: 'Nguyệt tinh dịu dàng thanh nhã, chủ về trực giác, tình cảm và tài lộc ngầm.',
    brightGift: 'Nội tâm tinh tế, khiếu thẩm mỹ nghệ thuật cao, tích lũy điền sản và sự nghiệp bền vững.',
    dimChallenge: 'Dễ suy nghĩ đa sầu đa cảm, tâm trạng thất thường khi đối diện với biến cố.',
  },
  'Vũ Khúc': {
    nature: 'Tài tinh dũng mãnh, chủ về sự quyết đoán, tài chính và tính độc lập.',
    brightGift: 'Năng lực kiếm tiền xuất sắc, hành động quyết liệt, thực tế và khả năng quản lý nguồn vốn.',
    dimChallenge: 'Tính tình có phần lạnh lùng, cần bồi đắp sự mềm mỏng trong quan hệ tình cảm.',
  },
  'Thiên Đồng': {
    nature: 'Phúc tinh nhân hậu, chủ về sự hòa nhã, thích nghi và hưởng thụ bình an.',
    brightGift: 'Tâm hồn lạc quan, nhân ái, có duyên lành với quý nhân và cuộc sống an nhàn.',
    dimChallenge: 'Dễ thiếu tính kiên trì, cần rèn luyện tính kỷ luật khi theo đuổi mục tiêu lớn.',
  },
  'Liêm Trinh': {
    nature: 'Tù tinh & Đào hoa thứ, chủ về nguyên tắc thép, sự sắc sảo và tham vọng.',
    brightGift: 'Trí tuệ nhạy bén, nguyên tắc kỷ luật cao, khả năng tổ chức và sức hút cá nhân lớn.',
    dimChallenge: 'Dễ bảo thủ, cố chấp hoặc tự tạo áp lực nội tâm quá lớn cho bản thân.',
  },
  'Thiên Cơ': {
    nature: 'Thiện tinh trí tuệ mưu lược, chủ về sự linh hoạt, học vấn và sáng tạo.',
    brightGift: 'Tư duy chiến lược, học một biết mười, giỏi ứng biến và hoạch định phương án.',
    dimChallenge: 'Tâm trí hay bận rộn suy nghĩ lo toan, dễ bồn chồn thiếu kiên nhẫn.',
  },
  'Thiên Tướng': {
    nature: 'Ấn tinh trung thành nhân từ, chủ về trợ lực, chính trực và thẩm mỹ.',
    brightGift: 'Phong thái đàng hoàng, có tinh thần trách nhiệm cao, là cánh tay đắc lực và người bạn tin cậy.',
    dimChallenge: 'Dễ cả nể hoặc bị cuốn vào chuyện thị phi của người khác.',
  },
  'Thiên Lương': {
    nature: 'Ấm tinh thanh cao nhân hậu, chủ về sự che chở, nguyên tắc đạo đức và tuổi thọ.',
    brightGift: 'Tấm lòng từ ái, có năng lực cố vấn xuất sắc, giải cứu hung họa và được bề trên quý mến.',
    dimChallenge: 'Đôi khi hơi giáo điều hoặc thích giảng giải đạo lý.',
  },
  'Thất Sát': {
    nature: 'Tướng tinh dũng mãnh quả quyết, chủ về sự tôi luyện, bứt phá và uy quyền.',
    brightGift: 'Bản lĩnh kiên cường trước nghịch cảnh, không sợ thử thách, dám mở lối tiên phong.',
    dimChallenge: 'Tính khí nóng nảy, cuộc đời nhiều thăng trầm đòi hỏi sự tiết chế cảm xúc.',
  },
  'Phá Quân': {
    nature: 'Hao tinh tiên phong cải cách, chủ về sự đổi mới, đột phá và dấn thân.',
    brightGift: 'Tư duy đổi mới không ngừng, dám phá bỏ lối mòn cũ để tạo lập thành tựu mới.',
    dimChallenge: 'Tính khí bất định, dễ hao tán nguồn lực nếu thiếu kế hoạch dài hạn.',
  },
  'Tham Lang': {
    nature: 'Đào hoa tinh dục vọng & tài năng, chủ về giao tiếp, nghệ thuật và sự linh hoạt.',
    brightGift: 'Tài ngoại giao xuất chúng, đam mê học hỏi đa ngành, năng khiếu thẩm mỹ và sức sống dồi dào.',
    dimChallenge: 'Dễ phân tán mục tiêu hoặc bị cám dỗ nhất thời chi phối.',
  },
  'Cự Môn': {
    nature: 'Ám tinh tài biện luận, chủ về khảo sát, điều tra, ngôn ngữ và chiều sâu phân tích.',
    brightGift: 'Khả năng phản biện sắc sảo, ngôn từ đanh thép, năng lực nghiên cứu sâu và nhìn thấu bản chất.',
    dimChallenge: 'Dễ vướng khẩu thiệt thị phi nếu thiếu sự khéo léo và lắng nghe.',
  },
};

/**
 * Generates rich, contextual, multi-layered interpretation for a single palace.
 */
export function interpretPalace(
  palace: TuViPalace,
  allPalaces: TuViPalace[],
  centerInfo?: TuViCenterInfo
): PalaceInterpretationResult {
  const domain = PALACE_DOMAIN_THEMES[palace.name] ?? { role: palace.name, focus: 'Các phương diện đời sống liên quan' };
  
  // 1. Major Stars analysis
  let majorStarsAnalysisVi = '';
  if (palace.chinhTinh.length === 0) {
    // Vô chính diệu
    const doiCungIdx = detectDoiCung(palace.id);
    const doiCung = allPalaces[doiCungIdx];
    const doiCungStars = doiCung ? doiCung.chinhTinh.map((s) => `${s.name} (${s.brightness})`).join(', ') : '';
    majorStarsAnalysisVi = `Cung vị Vô Chính Diệu (không có chính tinh tọa thủ). Đặc tính của cung sẽ chịu ảnh hưởng lớn từ môi trường bên ngoài và mượn lực từ đối cung ${doiCung?.name ?? ''}${doiCungStars ? ` với các sao chiếu: ${doiCungStars}` : ''}. Đương số có tính linh hoạt cao, dễ thích ứng nhưng cần tự chủ vững vàng.`;
  } else {
    const starAnalyses = palace.chinhTinh.map((star) => {
      const trait = STAR_CORE_TRAITS[star.name];
      const isBright = ['Miếu', 'Vượng', 'Đắc'].includes(star.brightness);
      if (!trait) return `${star.name} (${star.brightness}) tọa thủ mang lại nguồn năng lượng đặc thù cho cung vị này.`;
      return `${star.name} (${star.brightness}): ${trait.nature} ${isBright ? trait.brightGift : trait.dimChallenge}`;
    });
    majorStarsAnalysisVi = starAnalyses.join(' ');
  }

  // 2. Tứ Hóa analysis
  const tuHoaAnalysisVi: string[] = [];
  palace.tuHoa.forEach((th) => {
    if (th.type === 'Lộc') {
      tuHoaAnalysisVi.push(`Hóa Lộc tại ${th.starName}: Kích hoạt vận may, của cải, cơ hội hanh thông và sự trợ duyên quý báu trong lĩnh vực ${palace.name.toLowerCase()}.`);
    } else if (th.type === 'Quyền') {
      tuHoaAnalysisVi.push(`Hóa Quyền tại ${th.starName}: Tăng cường uy thế, quyền chủ động, khả năng tự quyết và vị thế dẫn dắt.`);
    } else if (th.type === 'Khoa') {
      tuHoaAnalysisVi.push(`Hóa Khoa tại ${th.starName}: Mang lại danh thơm tiếng tốt, học vấn thông tuệ và khả năng cứu giải những khúc mắc hung hiểm.`);
    } else if (th.type === 'Kỵ') {
      tuHoaAnalysisVi.push(`Hóa Kỵ tại ${th.starName}: Báo hiệu những biến động tâm lý, trở ngại cần vượt qua hoặc sự ràng buộc đòi hỏi tính kiên nhẫn cao độ.`);
    }
  });

  // 3. Auxiliaries and Malefics
  const goodPhuTinh = palace.phuTinh.filter((s) => ['Tả Phụ', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Thiên Khôi', 'Thiên Việt', 'Lộc Tồn', 'Thiên Mã', 'Đào Hoa', 'Hồng Loan', 'Hóa Khoa', 'Hóa Lộc'].includes(s.name));
  const badSatTinh = palace.satTinh;
  
  let auxiliaryAndMaleficVi = '';
  if (goodPhuTinh.length > 0 && badSatTinh.length > 0) {
    auxiliaryAndMaleficVi = `Cát tinh (${goodPhuTinh.map((s) => s.name).join(', ')}) hội hợp cùng Sát tinh (${badSatTinh.map((s) => s.name).join(', ')}): Tạo nên sự tôi luyện mạnh mẽ giữa thuận lợi và áp lực, giúp đương số rèn giũa bản lĩnh vượt trội khi đối đầu thử thách.`;
  } else if (goodPhuTinh.length > 0) {
    auxiliaryAndMaleficVi = `Hội tụ cát tinh trợ lực (${goodPhuTinh.map((s) => s.name).join(', ')}): Tăng cường sự tương trợ từ quý nhân, học vấn và sự hanh thông.`;
  } else if (badSatTinh.length > 0) {
    auxiliaryAndMaleficVi = `Hiện diện sát tinh (${badSatTinh.map((s) => s.name).join(', ')}): Đòi hỏi sự cẩn trọng, kiềm chế cảm xúc nóng nảy và phòng tránh rủi ro vội vã.`;
  } else {
    auxiliaryAndMaleficVi = 'Khí trường cung vị duy trì ở trạng thái bình hòa, thuận tự nhiên.';
  }

  // 4. Tuần / Triệt
  let tuanTrietAnalysisVi: string | undefined;
  if (palace.hasTriet && palace.hasTuan) {
    tuanTrietAnalysisVi = 'Đồng cung Tuần và Triệt: Giai đoạn tiền vận gặp nhiều thăng trầm nhưng hậu vận sẽ tôi luyện được nội lực vững vàng và sự sâu sắc hiếm có.';
  } else if (palace.hasTriet) {
    tuanTrietAnalysisVi = 'Cung vị ngộ Triệt Không: Thử thách và bẻ gãy những bộc phát thời trẻ (trước 30 tuổi), sau đó sẽ dần mở ra con đường hanh thông.';
  } else if (palace.hasTuan) {
    tuanTrietAnalysisVi = 'Cung vị ngộ Tuần Không: Giữ nhịp êm ả, kiềm tỏa sự hung hãn của sát tinh hoặc bao bọc duy trì thế ổn định lâu dài.';
  }

  // 5. Tam Phương Tứ Chính
  const tamHopIndices = detectTamHopPalaces(palace.id);
  const doiCungIdx = detectDoiCung(palace.id);
  const tamHopPalaces = tamHopIndices.map((i) => allPalaces[i]).filter(Boolean);
  const doiCungPalace = allPalaces[doiCungIdx];
  const relatedNames = [...tamHopPalaces.map((p) => p.name), doiCungPalace?.name].filter(Boolean);
  const tamPhuongTuChinhVi = `Thế tam hợp và đối cung hội chiếu từ [${relatedNames.join(', ')}] tạo thành mạng lưới hỗ trợ qua lại chặt chẽ cho cung vị này.`;

  // 6. Blended Cách Cục (Combination)
  let cachCucAnalysisVi: PalaceInterpretationResult['cachCucAnalysisVi'];
  try {
    const combinations = detectCombinations(allPalaces);
    const relevantComb = combinations.find((c) =>
      c.involvedCung.includes(palace.name) || (palace.isMenh && c.involvedCung.includes('Mệnh'))
    );
    if (relevantComb) {
      const purityLabel =
        relevantComb.purity === 'thuần'
          ? 'Thuần Cách (Đắc địa toàn vẹn)'
          : relevantComb.purity === 'bán'
          ? 'Bán Cách (Hội hợp tương đối)'
          : 'Phá Cách (Gặp thử thách tôi luyện)';
      cachCucAnalysisVi = {
        name: relevantComb.name,
        purity: purityLabel,
        description: relevantComb.description || relevantComb.note,
        synthesisVi:
          relevantComb.contextualDetails?.dynamicSynthesisVi ||
          `${relevantComb.nameHanViet}: ${relevantComb.detectionReason}. ${relevantComb.note}`,
      };
    }
  } catch {
    // Graceful fallback if combination detection fails
  }

  // 7. Actionable guidance
  let actionableGuidanceVi = '';
  if (palace.isMenh) {
    actionableGuidanceVi = `Tập trung phát huy tối đa tư chất cốt lõi của ${palace.chinhTinh.map((s) => s.name).join(', ') || 'Bản Cung'}, rèn luyện tính kiên định và xây dựng hệ giá trị cá nhân vững vàng.`;
  } else if (palace.name === 'Quan Lộc') {
    actionableGuidanceVi = 'Chủ động nâng cao kỹ năng chuyên môn, xây dựng phong thái lãnh đạo trách nhiệm và tận dụng các cơ hội công danh.';
  } else if (palace.name === 'Tài Bạch') {
    actionableGuidanceVi = 'Thiết lập kỷ luật quản lý tài chính, phân bổ dòng tiền thông minh và tránh đầu tư mạo hiểm khi chưa đủ dữ liệu.';
  } else if (palace.name === 'Phúc Đức') {
    actionableGuidanceVi = 'Chăm sóc đời sống tinh thần, duy trì các thói quen lành mạnh, làm việc thiện và giữ gìn sự gắn kết gia tộc.';
  } else {
    actionableGuidanceVi = `Phát triển sự hòa hợp và thấu hiểu trong các mối quan hệ liên quan đến ${domain.role.toLowerCase()}.`;
  }

  return {
    palaceId: palace.id,
    palaceName: palace.name,
    palaceBranch: palace.chi,
    isMenh: palace.isMenh,
    isThan: palace.isThan,
    coreThemeVi: `${domain.role} — ${domain.focus}.`,
    majorStarsAnalysisVi,
    cachCucAnalysisVi,
    tuHoaAnalysisVi,
    auxiliaryAndMaleficVi,
    tuanTrietAnalysisVi,
    tamPhuongTuChinhVi,
    daiHanAdviceVi: `Đại Hạn ${palace.daiHanAgeRange} tuổi: Giai đoạn vận trình chuyển dịch qua cung vị này.`,
    actionableGuidanceVi,
  };
}
