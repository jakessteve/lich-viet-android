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
 * Extracts and analyzes Tam Phương Tứ Chính (Trine & Opposition) for a given palace.
 * Generates an individualized, human-oriented synthesis of projecting major stars,
 * key auxiliaries, Tứ Hóa transformations, and malefic pressures.
 */
function buildTamPhuongTuChinhInterpretation(
  palace: TuViPalace,
  allPalaces: TuViPalace[]
): string {
  const tamHopIndices = detectTamHopPalaces(palace.id);
  const doiCungIdx = detectDoiCung(palace.id);
  const tamHopPalaces = tamHopIndices.map((i) => allPalaces[i]).filter((p): p is TuViPalace => Boolean(p));
  const doiCungPalace = allPalaces[doiCungIdx];

  // 1. Structure definition
  const tamHopLabels = tamHopPalaces.map((p) => `${p.name} (${p.chi})`).join(' và ');
  const doiCungLabel = doiCungPalace ? `${doiCungPalace.name} (${doiCungPalace.chi})` : '';

  const sections: string[] = [];

  // Network overview
  sections.push(
    `Thế chân vạc Tam Phương Tứ Chính hội tụ từ hai cung Tam Hợp [${tamHopLabels}] cùng cung Xung Chiếu trực diện [${doiCungLabel}], tạo nên mạng lưới tương tác đa chiều cho cung ${palace.name} (${palace.chi}).`
  );

  // 2. Major Stars & Projection
  const tamHopStars = tamHopPalaces.flatMap((p) =>
    p.chinhTinh.map((s) => `${s.name} (${s.brightness}) tại ${p.name}`)
  );
  const doiCungStars = doiCungPalace
    ? doiCungPalace.chinhTinh.map((s) => `${s.name} (${s.brightness}) tại ${doiCungPalace.name}`)
    : [];

  if (palace.chinhTinh.length === 0) {
    // Vô chính diệu
    if (doiCungStars.length > 0) {
      sections.push(
        `Do Bản Cung Vô Chính Diệu, cung vị mượn trọn vẹn nguồn năng lượng xung chiếu từ đối cung ${doiCungLabel} với ${doiCungStars.join(', ')}, kết hợp cùng nguồn lực tam hợp từ ${tamHopLabels} (${tamHopStars.join(', ') || 'các cát tinh hội tụ'}). Điều này giúp đương số có khả năng thích ứng linh hoạt, khéo xoay chuyển theo ngoại cảnh nhưng cần xây dựng nội lực tự thân vững vàng.`
      );
    } else {
      sections.push(
        `Bản Cung Vô Chính Diệu và đối cung không có chính tinh đắc cách, sự phát triển phụ thuộc chủ yếu vào sự kết hợp giữa các cát tinh tam hợp và khả năng thích ứng mềm dẻo của đương số.`
      );
    }
  } else {
    // Normal palace with major stars
    const allProjectingMajor = [...tamHopStars, ...doiCungStars];
    if (allProjectingMajor.length > 0) {
      // Check classic patterns across the 4 palaces
      const allFourPalaces = [palace, ...tamHopPalaces, doiCungPalace].filter(Boolean) as TuViPalace[];
      const allFourChinhTinh = allFourPalaces.flatMap((p) => p.chinhTinh.map((s) => s.name));
      const hasSatPhaTham = ['Thất Sát', 'Phá Quân', 'Tham Lang'].some((n) => allFourChinhTinh.includes(n));
      const hasTuPhuVuTuong = ['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'].some((n) => allFourChinhTinh.includes(n));
      const hasCoNguyetDongLuong = ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].some((n) => allFourChinhTinh.includes(n));
      const hasCuNhat = ['Cự Môn', 'Thái Dương'].some((n) => allFourChinhTinh.includes(n));

      let synergyNote = '';
      if (hasTuPhuVuTuong && hasSatPhaTham) {
        synergyNote = 'Sự kết hợp giữa uy quyền quản trị và tinh thần dám nghĩ dám làm tạo nên thế cân bằng giữa ổn định và đột phá.';
      } else if (hasSatPhaTham) {
        synergyNote = 'Khí thế Sát Phá Tham hội tụ thúc đẩy tinh thần tiên phong, sẵn sàng dấn thân vào thử thách để tạo lập thành tựu.';
      } else if (hasTuPhuVuTuong) {
        synergyNote = 'Thế trận Tử Phủ Vũ Tướng củng cố nền tảng tổ chức vững vàng, tư duy quản lý tài chính và tinh thần trách nhiệm cao.';
      } else if (hasCoNguyetDongLuong) {
        synergyNote = 'Bộ Cơ Nguyệt Đồng Lương tăng cường tư duy chiến lược, năng lực tham mưu mưu lược và tính tình nhân hậu, bền bỉ.';
      } else if (hasCuNhat) {
        synergyNote = 'Thế Cự Nhật mở rộng tầm nhìn đối ngoại, gia tăng khả năng biện luận, truyền cảm hứng và xây dựng uy tín cá nhân.';
      }

      sections.push(
        `Các chính tinh hội chiếu gồm: ${allProjectingMajor.join('; ')}. ${synergyNote}`
      );
    }
  }

  // 3. Tứ Hóa projecting from Tam Hợp & Đối Cung
  const projectingTuHoa: string[] = [];
  tamHopPalaces.forEach((p) => {
    p.tuHoa.forEach((th) => {
      projectingTuHoa.push(`Hóa ${th.type} (${th.starName}) tại ${p.name}`);
    });
  });
  if (doiCungPalace) {
    doiCungPalace.tuHoa.forEach((th) => {
      projectingTuHoa.push(`Hóa ${th.type} (${th.starName}) xung chiếu từ ${doiCungPalace.name}`);
    });
  }

  if (projectingTuHoa.length > 0) {
    const thInterpretations: string[] = [];
    if (projectingTuHoa.some((t) => t.includes('Hóa Lộc'))) {
      thInterpretations.push('Hóa Lộc mang lại vận may tài lộc và cơ hội hợp tác thuận lợi từ bên ngoài');
    }
    if (projectingTuHoa.some((t) => t.includes('Hóa Quyền'))) {
      thInterpretations.push('Hóa Quyền gia tăng quyền chủ động, vị thế dẫn dắt và tiếng nói uy tín');
    }
    if (projectingTuHoa.some((t) => t.includes('Hóa Khoa'))) {
      thInterpretations.push('Hóa Khoa tăng cường danh tiếng, học vấn uyên bác và khả năng cứu giải tai ương');
    }
    if (projectingTuHoa.some((t) => t.includes('Hóa Kỵ'))) {
      thInterpretations.push('Hóa Kỵ cảnh báo những khúc mắc tâm lý, áp lực cạnh tranh hoặc thị phi cần hóa giải bằng sự bình tĩnh');
    }
    sections.push(
      `Tứ Hóa hội tụ: ${projectingTuHoa.join(', ')}. Tác động: ${thInterpretations.join('; ')}.`
    );
  }

  // 4. Auxiliaries & Malefics in Tam Hợp & Đối Cung
  const projectingGood: string[] = [];
  const projectingBad: string[] = [];
  const relatedPalaces = [...tamHopPalaces, doiCungPalace].filter(Boolean) as TuViPalace[];

  relatedPalaces.forEach((p) => {
    p.phuTinh.forEach((s) => {
      if (['Tả Phụ', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Thiên Khôi', 'Thiên Việt', 'Lộc Tồn', 'Thiên Mã', 'Đào Hoa', 'Hồng Loan'].includes(s.name)) {
        projectingGood.push(`${s.name} (${p.name})`);
      }
    });
    p.satTinh.forEach((s) => {
      if (['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp'].includes(s.name)) {
        projectingBad.push(`${s.name} (${p.name})`);
      }
    });
  });

  if (projectingGood.length > 0 && projectingBad.length > 0) {
    sections.push(
      `Cát tinh hội chiếu (${projectingGood.slice(0, 4).join(', ')}) đan xen cùng sát tinh áp lực (${projectingBad.slice(0, 4).join(', ')}), tạo nên môi trường có cả trợ lực lẫn thử thách, giúp đương số không ngừng trui rèn bản lĩnh để trưởng thành.`
    );
  } else if (projectingGood.length > 0) {
    sections.push(
      `Hội tụ nhiều cát tinh nâng đỡ (${projectingGood.slice(0, 5).join(', ')}), đem lại nguồn trợ duyên quý báu từ đồng nghiệp, quý nhân và hoàn cảnh xung quanh.`
    );
  } else if (projectingBad.length > 0) {
    sections.push(
      `Có sự hiện diện của sát tinh hội chiếu (${projectingBad.slice(0, 4).join(', ')}), nhắc nhở đương số luôn giữ sự cẩn trọng, kiềm chế tính nóng nảy và phòng ngừa rủi ro bất ngờ.`
    );
  }

  return sections.join(' ');
}

/**
 * Builds personalized, human-oriented actionable guidance for a palace,
 * synthesizing the native's star archetype, Tứ Hóa, auxiliaries, malefics,
 * and Tuần/Triệt timing into clear, empathetic life advice.
 */
function buildActionableGuidance(
  palace: TuViPalace,
  allPalaces: TuViPalace[],
  centerInfo?: TuViCenterInfo
): string {
  const domain = PALACE_DOMAIN_THEMES[palace.name] ?? { role: palace.name, focus: 'Các phương diện đời sống' };
  const points: string[] = [];

  // 1. Core Archetype Strategy
  const chinhTinhNames = palace.chinhTinh.map((s) => s.name);
  if (chinhTinhNames.length === 0) {
    const doiCung = allPalaces[detectDoiCung(palace.id)];
    const doiCungStarNames = doiCung ? doiCung.chinhTinh.map((s) => s.name).join(', ') : '';
    points.push(
      `Với vị thế Vô Chính Diệu mượn lực từ đối cung ${doiCung?.name ?? ''} (${doiCungStarNames || 'ngoại cảnh'}), hãy duy trì sự linh hoạt, khéo léo thích nghi với thời cuộc nhưng cần giữ vững định hướng cốt lõi của bản thân.`
    );
  } else {
    // Tailored guidance based on primary major stars
    if (chinhTinhNames.some((n) => ['Tử Vi', 'Thiên Phủ', 'Thiên Tướng', 'Vũ Khúc'].includes(n))) {
      const mainLeadStar = chinhTinhNames.find((n) => ['Tử Vi', 'Thiên Phủ', 'Thiên Tướng', 'Vũ Khúc'].includes(n));
      points.push(
        `Phát huy khí chất lãnh đạo và tư duy quản trị của ${mainLeadStar || 'bản cung'}: giữ phong thái điềm đạm, tư duy bao quát và quản trị nguồn lực cẩn trọng. Luôn lắng nghe ý kiến đóng góp từ tập thể để hoàn thiện quyết sách.`
      );
    } else if (chinhTinhNames.some((n) => ['Thất Sát', 'Phá Quân', 'Tham Lang'].includes(n))) {
      const mainPioneerStar = chinhTinhNames.find((n) => ['Thất Sát', 'Phá Quân', 'Tham Lang'].includes(n));
      points.push(
        `Phát huy tinh thần tiên phong đột phá của ${mainPioneerStar || 'bản cung'}: dũng cảm nắm bắt cơ hội đổi mới, dấn thân vào các mục tiêu lớn. Luôn chuẩn bị phương án dự phòng và kiên nhẫn tích lũy thay vì hành động theo cảm hứng nhất thời.`
      );
    } else if (chinhTinhNames.some((n) => ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].includes(n))) {
      const mainStrategyStar = chinhTinhNames.find((n) => ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].includes(n));
      points.push(
        `Phát huy sở trường mưu lược và chuyên môn sâu của ${mainStrategyStar || 'bản cung'}: tận dụng tư duy chiến lược và sự khéo léo trong ứng xử. Chú trọng xây dựng uy tín bền vững, làm việc thiện lành và giữ tâm thế an hòa.`
      );
    } else if (chinhTinhNames.some((n) => ['Cự Môn', 'Thái Dương'].includes(n))) {
      const mainSpeechStar = chinhTinhNames.find((n) => ['Cự Môn', 'Thái Dương'].includes(n));
      points.push(
        `Khai thác năng lực truyền thông và danh tiếng của ${mainSpeechStar || 'bản cung'}: giao tiếp chân thành, truyền cảm hứng và mở rộng quan hệ đối ngoại. Cẩn trọng trong phát ngôn để tránh những hiểu lầm không đáng có.`
      );
    } else if (chinhTinhNames.includes('Liêm Trinh')) {
      points.push(
        `Phát huy nguyên tắc kỷ luật cao và sự sắc sảo của Liêm Trinh: giữ sự minh bạch trong công việc, đồng thời rèn luyện sự mềm dẻo, linh hoạt để xử lý hài hòa các mối quan hệ xã hội.`
      );
    }
  }

  // 2. Leveraging Tứ Hóa & Auspicious Catalysts
  const hasLoc = palace.tuHoa.some((th) => th.type === 'Lộc') || palace.phuTinh.some((s) => s.name === 'Lộc Tồn');
  const hasQuyen = palace.tuHoa.some((th) => th.type === 'Quyền');
  const hasKhoa = palace.tuHoa.some((th) => th.type === 'Khoa') || palace.phuTinh.some((s) => ['Văn Xương', 'Văn Khúc'].includes(s.name));
  const hasTroLuc = palace.phuTinh.some((s) => ['Tả Phụ', 'Hữu Bật', 'Thiên Khôi', 'Thiên Việt'].includes(s.name));

  if (hasLoc) {
    points.push(
      `Đòn bẩy tài lộc đang rộng mở trong lĩnh vực ${domain.role.toLowerCase()}: hãy chủ động nắm bắt thời cơ, tái đầu tư vào năng lực và phân bổ dòng vốn minh bạch.`
    );
  }
  if (hasQuyen) {
    points.push(
      `Tự tin nhận trọng trách dẫn dắt, đề xuất các sáng kiến cải tiến và khẳng định năng lực tự chủ trong môi trường làm việc.`
    );
  }
  if (hasKhoa) {
    points.push(
      `Chú trọng nâng cao học vấn, tích lũy bằng cấp, chứng chỉ chuyên môn và xây dựng thương hiệu cá nhân uy tín, chuẩn mực.`
    );
  }
  if (hasTroLuc && !hasQuyen && !hasLoc) {
    points.push(
      `Tích cực mở rộng mạng lưới quan hệ, tìm kiếm sự cố vấn từ người đi trước và tận dụng sức mạnh đồng đội để cùng tiến xa.`
    );
  }

  // 3. Risk Mitigation & Overcoming Malefics
  const satTinhNames = palace.satTinh.map((s) => s.name);
  const hasKy = palace.tuHoa.some((th) => th.type === 'Kỵ');

  if (satTinhNames.some((n) => ['Kình Dương', 'Đà La'].includes(n))) {
    const kienStar = satTinhNames.find((n) => ['Kình Dương', 'Đà La'].includes(n));
    points.push(
      `Hóa giải áp lực từ ${kienStar}: cẩn trọng trước các tranh chấp hay bất đồng ý kiến; hãy rà soát kỹ lưỡng giấy tờ, hợp đồng và lấy sự kiên nhẫn làm kim chỉ nam giải quyết vấn đề.`
    );
  }
  if (satTinhNames.some((n) => ['Hỏa Tinh', 'Linh Tinh'].includes(n))) {
    const hoaStar = satTinhNames.find((n) => ['Hỏa Tinh', 'Linh Tinh'].includes(n));
    points.push(
      `Tiết chế ảnh hưởng nóng vội của ${hoaStar}: kiềm chế cảm xúc, tránh đưa ra các quyết định quan trọng khi tâm trạng đang kích động; giữ thói quen kiểm tra kép trước khi hành động.`
    );
  }
  if (satTinhNames.some((n) => ['Địa Không', 'Địa Kiếp'].includes(n))) {
    const khongStar = satTinhNames.find((n) => ['Địa Không', 'Địa Kiếp'].includes(n));
    points.push(
      `Phòng ngừa rủi ro biến động từ ${khongStar}: thiết lập kỷ luật tài chính nghiêm ngặt, tránh các hình thức đầu cơ rủi ro cao và luôn duy trì quỹ dự phòng an toàn.`
    );
  }
  if (hasKy) {
    points.push(
      `Hóa giải Hóa Kỵ: học cách lắng nghe đa chiều, giữ sự minh bạch trong mọi cam kết và dĩ hòa vi quý để hóa giải thị phi, khúc mắc nội tâm.`
    );
  }

  // 4. Timing & Tuần / Triệt Rhythm
  if (palace.hasTriet && palace.hasTuan) {
    points.push(
      `Với thế ngộ cả Tuần lẫn Triệt, hãy xem những thăng trầm thời trẻ như vốn sống tôi luyện bản lĩnh; thành quả vững bền sẽ thực sự nở rộ từ trung vận trở đi.`
    );
  } else if (palace.hasTriet) {
    points.push(
      `Giai đoạn tiền vận (trước 30 tuổi) hãy tập trung học hỏi và tích lũy nội lực; đừng nản lòng trước những khúc quanh ban đầu vì vận trình sẽ ngày càng sáng rõ sau độ tuổi này.`
    );
  } else if (palace.hasTuan) {
    points.push(
      `Giữ vững phương châm "chậm mà chắc", kiên trì tích lũy từng bước và gìn giữ thành quả, hạn chế sự thay đổi đột ngột thiếu cơ sở vững vàng.`
    );
  }

  // Domain-specific final wrap-up if points are sparse
  if (points.length < 2) {
    if (palace.isMenh) {
      points.push('Tập trung xây dựng hệ giá trị cá nhân vững vàng, rèn luyện tính kiên định và phát huy tối đa tư chất bẩm sinh.');
    } else if (palace.name === 'Quan Lộc') {
      points.push('Chủ động nâng cao kỹ năng chuyên môn, xây dựng phong thái làm việc chuyên nghiệp và nắm bắt thời cơ thăng tiến.');
    } else if (palace.name === 'Tài Bạch') {
      points.push('Thiết lập kỷ luật quản lý tài chính, phân bổ dòng tiền thông minh và tránh đầu tư mạo hiểm khi chưa đủ dữ liệu.');
    } else if (palace.name === 'Phúc Đức') {
      points.push('Chăm sóc đời sống tinh thần, duy trì các thói quen lành mạnh, làm việc thiện và giữ gìn sự gắn kết gia tộc.');
    } else {
      points.push(`Xây dựng sự thấu hiểu, chân thành và hòa hợp trong các mối quan hệ liên quan đến ${domain.role.toLowerCase()}.`);
    }
  }

  return points.join(' ');
}

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

  // 5. Tam Phương Tứ Chính (Personalized & Deep Synthesis)
  const tamPhuongTuChinhVi = buildTamPhuongTuChinhInterpretation(palace, allPalaces);

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

  // 7. Actionable Guidance (Personalized, Human-Oriented & Empathetic)
  const actionableGuidanceVi = buildActionableGuidance(palace, allPalaces, centerInfo);

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
