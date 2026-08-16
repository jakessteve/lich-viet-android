import type { SwissNatalChartResult, SwissNatalObject } from './swissNatalChart';

export interface VocationalAnalysis {
  mcSign: string;
  mcSignVi: string;
  planetsIn10th: SwissNatalObject[];
  planetsIn2nd: SwissNatalObject[];
  planetsIn6th: SwissNatalObject[];
  careerArchetype: string;
  keyStrengths: string[];
  recommendedFields: string[];
  workStyle: string;
}

export interface FinancialAnalysis {
  wealthScore: number;
  earningCapacity: string;
  investmentStyle: string;
  secondHouseSummary: string;
  eighthHouseSummary: string;
  fortunePlacement: string;
  wealthTips: string[];
}

export interface KarmicAnalysis {
  northNodeSignVi: string;
  northNodeHouse: number;
  southNodeSignVi: string;
  southNodeHouse: number;
  soulMission: string;
  pastLifePatterns: string[];
  karmicLessons: string[];
  draconicPlanets: Array<{
    nameVi: string;
    symbol: string;
    draconicSignVi: string;
    draconicDegree: number;
  }>;
}

export interface RelationshipProfileAnalysis {
  loveStyle: string;
  seventhHouseSummary: string;
  venusMarsChemistry: string;
  emotionalNeeds: string;
  idealPartnerTraits: string[];
}

export interface ParentingChildAnalysis {
  childArchetype: string;
  emotionalSecurityNeed: string;
  cognitiveLearningStyle: string;
  temperAndWillpower: string;
  parentingAdvice: string[];
}

export interface ThematicAnalysisResult {
  vocational: VocationalAnalysis;
  financial: FinancialAnalysis;
  karmic: KarmicAnalysis;
  relationship: RelationshipProfileAnalysis;
  parenting: ParentingChildAnalysis;
}

const SIGN_CAREER_MAP: Record<string, { archetype: string; strengths: string[]; fields: string[] }> = {
  'Bạch Dương': {
    archetype: 'Người Tiên Phong & Khởi Nghiệp (Pioneer / Leader)',
    strengths: ['Dám nghĩ dám làm', 'Khởi xướng dự án', 'Quyết đoán dưới áp lực'],
    fields: ['Khởi nghiệp', 'Quản lý dự án', 'Thể thao & quân sự', 'Kỹ thuật cơ khí', 'Kinh doanh độc lập'],
  },
  'Kim Ngưu': {
    archetype: 'Chuyên Gia Kiến Tạo & Tài Chính (Builder / Financier)',
    strengths: ['Kiên định, bền bỉ', 'Quản trị nguồn vốn', 'Thực tế và thẩm mỹ cao'],
    fields: ['Tài chính ngân hàng', 'Bất động sản', 'Ẩm thực & khách sạn', 'Thiết kế kiến trúc', 'Đầu tư giá trị'],
  },
  'Song Tử': {
    archetype: 'Bậc Thầy Truyền Thông & Kết Nối (Communicator / Networker)',
    strengths: ['Đa nhiệm linh hoạt', 'Giao tiếp thuyết phục', 'Thu thập thông tin nhạy bén'],
    fields: ['Truyền thông & PR', 'Báo chí & Viết lách', 'Marketing số', 'Giáo dục & Đào tạo', 'Thương mại điện tử'],
  },
  'Cự Giải': {
    archetype: 'Người Chăm Sóc & Nuôi Dưỡng (Nurturer / Strategist)',
    strengths: ['Trực giác sâu sắc', 'Quản lý con người', 'Bảo vệ tài nguyên'],
    fields: ['Y tế & Sức khỏe', 'Tâm lý & Trị liệu', 'Bất động sản & Nội thất', 'Nhân sự (HR)', 'Khách sạn & Dịch vụ'],
  },
  'Sư Tử': {
    archetype: 'Nhà Lãnh Đạo & Nghệ Sĩ Biểu Diễn (Executive / Creator)',
    strengths: ['Truyền cảm hứng', 'Tầm nhìn chiến lược', 'Tự tin và thần thái xuất chúng'],
    fields: [
      'CEO / Quản trị cấp cao',
      'Nghệ thuật & Giải trí',
      'Tổ chức sự kiện',
      'Chính trị & Ngoại giao',
      'Thương hiệu cá nhân',
    ],
  },
  'Xử Nữ': {
    archetype: 'Chuyên Gia Tinh Chỉnh & Phân Tích (Analyst / Specialist)',
    strengths: ['Tỉ mỉ, chuẩn xác', 'Tối ưu hóa quy trình', 'Kỷ luật và phụng sự'],
    fields: [
      'Công nghệ thông tin (IT/QA)',
      'Phân tích dữ liệu',
      'Kiểm toán & Kế toán',
      'Y dược & Dinh dưỡng',
      'Nghiên cứu khoa học',
    ],
  },
  'Thiên Bình': {
    archetype: 'Nhà Ngoại Giao & Thẩm Mỹ (Diplomat / Aesthetician)',
    strengths: ['Đàm phán hòa giải', 'Cân bằng các mối quan hệ', 'Tư duy thẩm mỹ tinh tế'],
    fields: [
      'Luật sư & Pháp lý',
      'Quan hệ đối ngoại',
      'Thiết kế thời trang',
      'Tư vấn hòa giải',
      'Nghệ thuật & Trang trí',
    ],
  },
  'Bọ Cạp': {
    archetype: 'Nhà Nghiên Cứu Sâu Sắc & Chuyển Hóa (Investigator / Strategist)',
    strengths: ['Đọc vị tâm lý', 'Nghiên cứu chuyên sâu', 'Tái sinh sau khủng hoảng'],
    fields: [
      'Điều tra & An ninh',
      'Phẫu thuật y khoa',
      'Tài chính mạo hiểm / Quỹ đầu tư',
      'Tâm lý học chuyên sâu',
      'Nghiên cứu huyền học',
    ],
  },
  'Nhân Mã': {
    archetype: 'Nhà Tư Tưởng & Khai Phóng (Philosopher / Explorer)',
    strengths: ['Tầm nhìn quốc tế', 'Tư duy triết học', 'Lạc quan và truyền bá tri thức'],
    fields: [
      'Giảng dạy đại học',
      'Xuất bản & Truyền bá',
      'Du lịch quốc tế',
      'Luật quốc tế & Triết học',
      'Tổ chức phi chính phủ',
    ],
  },
  'Ma Kết': {
    archetype: 'Kiến Trúc Sư Định Chế & Chiến Lược Gia (Architect / Director)',
    strengths: ['Kỷ luật thép', 'Tổ chức bộ máy', 'Kiên trì leo đỉnh thành công'],
    fields: [
      'Quản trị doanh nghiệp',
      'Xây dựng & Kỹ thuật hạ tầng',
      'Cơ quan nhà nước',
      'Tài chính chiến lược',
      'Quy hoạch đô thị',
    ],
  },
  'Bảo Bình': {
    archetype: 'Nhà Đổi Mới & Tiên Tri Tương Lai (Innovator / Visionary)',
    strengths: ['Tư duy đột phá', 'Áp dụng công nghệ mới', 'Đấu tranh vì cộng đồng'],
    fields: [
      'Trí tuệ nhân tạo (AI) & Tech',
      'Hàng không vũ trụ',
      'Hoạt động xã hội',
      'Nghiên cứu phát minh',
      'Mạng xã hội & Web3',
    ],
  },
  'Song Ngư': {
    archetype: 'Nghệ Sĩ Trực Giác & Chữa Lành (Mystic / Healer)',
    strengths: ['Trực giác tâm linh', 'Đồng cảm vô hạn', 'Sáng tạo nghệ thuật bay bổng'],
    fields: [
      'Nghệ thuật & Âm nhạc',
      'Chữa lành & Trị liệu tâm hồn',
      'Công tác thiện nguyện',
      'Điện ảnh & Nhiếp ảnh',
      'Nghiên cứu biển & Tâm linh',
    ],
  },
};

export function analyzeThematicChart(natalResult: SwissNatalChartResult): ThematicAnalysisResult {
  const mc = natalResult.angles.Midheaven;
  const p10 = natalResult.objects.filter((o) => o.house === 10);
  const p2 = natalResult.objects.filter((o) => o.house === 2);
  const p6 = natalResult.objects.filter((o) => o.house === 6);
  const p7 = natalResult.objects.filter((o) => o.house === 7);
  const p8 = natalResult.objects.filter((o) => o.house === 8);

  const sun = natalResult.objects.find((o) => o.id === 'planet:sun');
  const moon = natalResult.objects.find((o) => o.id === 'planet:moon');
  const mercury = natalResult.objects.find((o) => o.id === 'planet:mercury');
  const venus = natalResult.objects.find((o) => o.id === 'planet:venus');
  const mars = natalResult.objects.find((o) => o.id === 'planet:mars');
  const jupiter = natalResult.objects.find((o) => o.id === 'planet:jupiter');
  const northNode = natalResult.objects.find((o) => o.id === 'lunar-point:true-north-node');
  const southNode = natalResult.objects.find((o) => o.id === 'derived:true-south-node');
  const fortune = natalResult.objects.find((o) => o.id === 'derived:part-of-fortune');

  // 1. Vocational
  const mcMapping = SIGN_CAREER_MAP[mc.signVi] || SIGN_CAREER_MAP['Ma Kết'];
  const vocational: VocationalAnalysis = {
    mcSign: mc.sign,
    mcSignVi: mc.signVi,
    planetsIn10th: p10,
    planetsIn2nd: p2,
    planetsIn6th: p6,
    careerArchetype: mcMapping.archetype,
    keyStrengths: mcMapping.strengths,
    recommendedFields: mcMapping.fields,
    workStyle: `Đỉnh Thiên Đỉnh ${mc.signVi} định hướng phong cách làm việc chuyên nghiệp, đòi hỏi sự phát triển bền vững và đóng góp giá trị thực chất cho xã hội.`,
  };

  // 2. Financial
  let wealthScore = 65;
  if (p2.length > 0) wealthScore += p2.length * 5;
  if (p8.length > 0) wealthScore += p8.length * 4;
  if (jupiter?.house === 2 || jupiter?.house === 11 || jupiter?.house === 8) wealthScore += 15;
  wealthScore = Math.min(95, Math.max(40, wealthScore));

  const financial: FinancialAnalysis = {
    wealthScore,
    earningCapacity: `Cung 2 tại ${natalResult.houses[1]?.signVi || 'Kim Ngưu'}: Nguồn thu nhập chính xuất phát từ chuyên môn tích lũy và khả năng quản lý tài sản thực tế.`,
    investmentStyle: `Cung 8 tại ${natalResult.houses[7]?.signVi || 'Bọ Cạp'}: Thiên hướng đầu tư thông minh qua đối tác, cổ phần hoặc các kênh tài sản dài hạn.`,
    secondHouseSummary:
      p2.length > 0
        ? `Cung 2 có ${p2.map((p) => p.nameVi).join(', ')} mang lại dòng tiền đa dạng.`
        : 'Cung 2 thoáng đãng, dòng tiền ổn định theo chu kỳ công việc.',
    eighthHouseSummary:
      p8.length > 0
        ? `Cung 8 hội tụ ${p8.map((p) => p.nameVi).join(', ')} cho thấy tiềm năng đòn bẩy tài chính lớn.`
        : 'Cung 8 độc lập, ít bị phụ thuộc vào nợ nần bên ngoài.',
    fortunePlacement: fortune
      ? `Điểm May Mắn (Lot of Fortune) tại ${fortune.signVi} (Cung ${fortune.house}): Đây là lĩnh vực thu hút thịnh vượng và phúc lộc dồi dào nhất.`
      : '',
    wealthTips: [
      'Tập trung phát triển kỹ năng lõi để nâng cao giá trị bản thân trước khi mở rộng kinh doanh.',
      'Duy trì quỹ dự phòng khẩn cấp tối thiểu 6 tháng sinh hoạt phí.',
      'Khai thác tối đa năng lượng của Điểm May Mắn để chọn đúng thời điểm đầu tư.',
    ],
  };

  // 3. Karmic & Draconic
  const nnLong = northNode?.longitude ?? 0;
  const draconicPlanets = natalResult.objects
    .filter((o) =>
      [
        'planet:sun',
        'planet:moon',
        'planet:mercury',
        'planet:venus',
        'planet:mars',
        'planet:jupiter',
        'planet:saturn',
      ].includes(o.id),
    )
    .map((o) => {
      const dracLong = (((o.longitude - nnLong) % 360) + 360) % 360;
      const dracSignIdx = Math.floor(dracLong / 30);
      const ZODIAC_VI = [
        'Bạch Dương',
        'Kim Ngưu',
        'Song Tử',
        'Cự Giải',
        'Sư Tử',
        'Xử Nữ',
        'Thiên Bình',
        'Bọ Cạp',
        'Nhân Mã',
        'Ma Kết',
        'Bảo Bình',
        'Song Ngư',
      ];
      return {
        nameVi: o.nameVi,
        symbol: o.symbol,
        draconicSignVi: ZODIAC_VI[dracSignIdx],
        draconicDegree: Math.floor(dracLong % 30),
      };
    });

  const karmic: KarmicAnalysis = {
    northNodeSignVi: northNode?.signVi ?? 'Bạch Dương',
    northNodeHouse: northNode?.house ?? 1,
    southNodeSignVi: southNode?.signVi ?? 'Thiên Bình',
    southNodeHouse: southNode?.house ?? 7,
    soulMission: `La Hầu tại ${northNode?.signVi ?? 'Bạch Dương'} (Cung ${northNode?.house ?? 1}): Hướng linh hồn đến việc rèn luyện sự tự chủ, khám phá tiềm năng độc bản và dám bước ra khỏi vùng an toàn.`,
    pastLifePatterns: [
      `Kế Đô tại ${southNode?.signVi ?? 'Thiên Bình'}: Thói quen từ tiền kiếp thiên về việc nhượng bộ hoặc quá phụ thuộc vào đánh giá của người khác.`,
      'Xu hướng tìm kiếm sự an toàn quen thuộc thay vì dấn thân đón nhận thử thách mới.',
    ],
    karmicLessons: [
      'Học cách thiết lập ranh giới cá nhân lành mạnh mà không cảm thấy tội lỗi.',
      'Tin tưởng vào trực giác và năng lực nội tại để làm chủ hành trình cuộc đời.',
    ],
    draconicPlanets,
  };

  // 4. Relationship
  const relationship: RelationshipProfileAnalysis = {
    loveStyle: `Sao Kim tại ${venus?.signVi ?? 'Kim Ngưu'}: Phong cách yêu thương chân thành, coi trọng sự gắn kết bền chặt và trân trọng những giá trị giản dị.`,
    seventhHouseSummary:
      p7.length > 0
        ? `Cung 7 có ${p7.map((p) => p.nameVi).join(', ')} tại ${natalResult.houses[6]?.signVi ?? 'Thiên Bình'}: Năng lượng các hành tinh tọa thủ kích hoạt mạnh mẽ duyên nợ và sự tương tác đối tác.`
        : `Cung 7 (Hôn phối & Đối tác) tại ${natalResult.houses[6]?.signVi ?? 'Thiên Bình'}: Thu hút đối tác có tính cách hài hòa, hiểu biết và biết lắng nghe.`,
    venusMarsChemistry: `Sự kết hợp giữa Sao Kim (${venus?.signVi}) và Sao Hỏa (${mars?.signVi}) tạo nên sức hút duyên dáng, hòa quyện giữa tình cảm dịu dàng và đam mê nhiệt huyết.`,
    emotionalNeeds: `Mặt Trăng tại ${moon?.signVi ?? 'Cự Giải'} (Cung ${moon?.house ?? 4}): Nhu cầu cảm xúc cốt lõi là sự an tâm, thấu hiểu và một mái ấm bình yên sau những bộn bề.`,
    idealPartnerTraits: [
      'Có sự đồng điệu sâu sắc về mặt giá trị sống và thế giới quan.',
      'Biết lắng nghe, tôn trọng không gian riêng và luôn đồng hành trong mọi hoàn cảnh.',
      'Trung thực, chung thủy và có tinh thần trách nhiệm cao.',
    ],
  };

  // 5. Parenting
  const parenting: ParentingChildAnalysis = {
    childArchetype: `Tính cách nền tảng: Mặt Trời ${sun?.signVi ?? 'Bạch Dương'} kết hợp Cung Mọc ${natalResult.angles.Ascendant.signVi}.`,
    emotionalSecurityNeed: `Mặt Trăng ${moon?.signVi ?? 'Cự Giải'}: Trẻ cần sự ôm ấp vỗ về, lắng nghe cảm xúc và một không gian gia đình ấm cúng không căng thẳng.`,
    cognitiveLearningStyle: `Sao Thủy ${mercury?.signVi ?? 'Song Tử'}: Trẻ tiếp thu kiến thức nhanh qua hình ảnh, trò chơi tương tác và câu hỏi gợi mở tư duy.`,
    temperAndWillpower: `Sao Hỏa ${mars?.signVi ?? 'Bạch Dương'}: Khi tức giận trẻ cần được thừa nhận cảm xúc trước khi hướng dẫn giải pháp bình tĩnh.`,
    parentingAdvice: [
      'Khuyến khích trẻ tự do biểu đạt ý kiến cá nhân và tôn trọng sự khác biệt của con.',
      'Tạo cho con môi trường học tập vừa chơi vừa học, tránh áp đặt thành tích cứng nhắc.',
      'Dành thời gian chất lượng mỗi ngày để trò chuyện và kết nối cảm xúc cùng con.',
    ],
  };

  return {
    vocational,
    financial,
    karmic,
    relationship,
    parenting,
  };
}
