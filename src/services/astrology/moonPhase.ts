export type MoonPhaseKey =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonPhaseResult {
  key: MoonPhaseKey;
  nameVi: string;
  nameEn: string;
  symbol: string;
  phaseAngle: number;
  illuminationPercentage: number;
  descriptionVi: string;
  personalityTraitsVi: string;
}

const PHASES: Array<{
  key: MoonPhaseKey;
  nameVi: string;
  nameEn: string;
  symbol: string;
  minAngle: number;
  maxAngle: number;
  descriptionVi: string;
  personalityTraitsVi: string;
}> = [
  {
    key: 'new_moon',
    nameVi: 'Trăng Non (New Moon)',
    nameEn: 'New Moon',
    symbol: '🌑',
    minAngle: 0,
    maxAngle: 45,
    descriptionVi: 'Mặt Trời và Mặt Trăng trùng tụ, khởi đầu chu kỳ mới trong bóng tối tĩnh lặng.',
    personalityTraitsVi:
      'Bản tính tiên phong, thuần khiết và hành động theo bản năng. Bạn mang tâm thế của người khai phá những khởi đầu mới.',
  },
  {
    key: 'waxing_crescent',
    nameVi: 'Trăng Lưỡi Liềm Đầu Tháng (Waxing Crescent)',
    nameEn: 'Waxing Crescent',
    symbol: '🌒',
    minAngle: 45,
    maxAngle: 90,
    descriptionVi: 'Ánh trăng dần xuất hiện, mầm sống bắt đầu vươn mình đón ánh sáng.',
    personalityTraitsVi:
      'Nhiệt huyết, kiên trì và luôn hướng về tương lai. Bạn có khát vọng mạnh mẽ để vượt qua những định kiến cũ và khẳng định bản thân.',
  },
  {
    key: 'first_quarter',
    nameVi: 'Trăng Bán Nguyệt Đầu Tháng (First Quarter)',
    nameEn: 'First Quarter',
    symbol: '🌓',
    minAngle: 90,
    maxAngle: 135,
    descriptionVi: 'Mặt Trăng vuông góc Mặt Trời, thời điểm của hành động quyết liệt và vượt chướng ngại vật.',
    personalityTraitsVi:
      'Ý chí kiên cường, dũng cảm đối mặt với thử thách và khủng hoảng để định hình con đường riêng.',
  },
  {
    key: 'waxing_gibbous',
    nameVi: 'Trăng Khuyết Đầu Tháng (Waxing Gibbous)',
    nameEn: 'Waxing Gibbous',
    symbol: '🌔',
    minAngle: 135,
    maxAngle: 180,
    descriptionVi: 'Ánh trăng gần tròn, giai đoạn tích lũy, hoàn thiện và trau chuốt.',
    personalityTraitsVi:
      'Tư duy hoàn thiện, tinh thần học hỏi không ngừng và khát khao đóng góp giá trị hữu ích cho cộng đồng.',
  },
  {
    key: 'full_moon',
    nameVi: 'Trăng Tròn (Full Moon)',
    nameEn: 'Full Moon',
    symbol: '🌕',
    minAngle: 180,
    maxAngle: 225,
    descriptionVi: 'Mặt Trăng và Mặt Trời đối đỉnh, ánh sáng rực rỡ và đỉnh cao nhận thức.',
    personalityTraitsVi:
      'Cảm xúc phong phú, trực giác thấu suốt và nhận thức sâu sắc về sự cân bằng giữa bản thân và các mối quan hệ.',
  },
  {
    key: 'waning_gibbous',
    nameVi: 'Trăng Khuyết Cuối Tháng (Disseminating Moon)',
    nameEn: 'Disseminating Moon',
    symbol: '🌖',
    minAngle: 225,
    maxAngle: 270,
    descriptionVi: 'Ánh trăng bắt đầu thu lại, thời điểm chia sẻ tri thức và gieo mầm bài học.',
    personalityTraitsVi:
      'Tố chất người thầy, thích truyền cảm hứng, lan tỏa kiến thức và chia sẻ kinh nghiệm sống cho người khác.',
  },
  {
    key: 'last_quarter',
    nameVi: 'Trăng Bán Nguyệt Cuối Tháng (Last Quarter)',
    nameEn: 'Last Quarter',
    symbol: '🌗',
    minAngle: 270,
    maxAngle: 315,
    descriptionVi: 'Mặt Trăng vuông góc Mặt Trời chiều tàn, thời điểm buông bỏ và đánh giá lại.',
    personalityTraitsVi:
      'Tư duy phản biện độc lập, khả năng buông bỏ những điều không còn phù hợp để tái định hình giá trị cuộc sống.',
  },
  {
    key: 'waning_crescent',
    nameVi: 'Trăng Lưỡi Liềm Cuối Tháng (Balsamic Moon)',
    nameEn: 'Balsamic Moon',
    symbol: '🌘',
    minAngle: 315,
    maxAngle: 360,
    descriptionVi: 'Ánh trăng mỏng manh cuối chu kỳ, thời khắc chiêm nghiệm và tĩnh lặng tâm linh.',
    personalityTraitsVi:
      'Trực giác tâm linh sâu sắc, trí tuệ già dặn trước tuổi và khả năng khép lại những chu kỳ cũ để chuẩn bị cho tương lai.',
  },
];

export function calculateBirthMoonPhase(sunLongitude: number, moonLongitude: number): MoonPhaseResult {
  const normSun = ((sunLongitude % 360) + 360) % 360;
  const normMoon = ((moonLongitude % 360) + 360) % 360;

  const phaseAngle = (normMoon - normSun + 360) % 360;
  const illuminationPercentage = Math.round(((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100);

  const matched = PHASES.find((p) => phaseAngle >= p.minAngle && phaseAngle < p.maxAngle) ?? PHASES[0];

  return {
    key: matched.key,
    nameVi: matched.nameVi,
    nameEn: matched.nameEn,
    symbol: matched.symbol,
    phaseAngle: Math.round(phaseAngle * 10) / 10,
    illuminationPercentage,
    descriptionVi: matched.descriptionVi,
    personalityTraitsVi: matched.personalityTraitsVi,
  };
}
