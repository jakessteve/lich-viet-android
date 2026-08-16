export type VedicCombinationType = 'yoga' | 'dosha' | 'neutral';

export interface VedicYogaDoshaItem {
  id: string;
  nameVi: string;
  nameSanskrit: string;
  type: VedicCombinationType;
  categoryVi: 'Cát Cách (Yoga)' | 'Khắc Kỵ (Dosha)' | 'Đặc Biệt';
  severityOrStrength: 'Cao' | 'Trung Bình' | 'Nhẹ';
  planetsInvolved: string[];
  descriptionVi: string;
  remedyOrAdviceVi?: string;
  bhavaHouses?: number[];
  bhavaClassificationVi?: string;
  isCombust?: boolean;
  dashaActivationVi?: string;
  personalizedSynthesisVi?: string;
}

export interface VedicPlanetPosition {
  body: string;
  siderealLongitude: number;
  house: number;
  signIndex: number;
}

const SIGN_NAMES_VI = [
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

function classifyBhava(houses: number[]): string {
  const isAllKendra = houses.every((h) => [1, 4, 7, 10].includes(h));
  const isAllTrikona = houses.every((h) => [1, 5, 9].includes(h));
  const hasDusthana = houses.some((h) => [6, 8, 12].includes(h));

  if (isAllKendra) return 'Cung Kendra (1, 4, 7, 10) — Vị thế hành động & quyền lực tối thượng';
  if (isAllTrikona) return 'Cung Trikona (1, 5, 9) — Phước đức & tài lộc cát lành';
  if (hasDusthana) return 'Cung Dusthana (6, 8, 12) — Trở ngại cần chuyển hóa & tôi luyện ý chí';
  return 'Cung vị phối hợp — Tác động đa chiều trong vận trình';
}

function checkCombustion(planet: VedicPlanetPosition, sun?: VedicPlanetPosition, maxOrb = 3): boolean {
  if (!sun) return false;
  const diff = Math.abs(planet.siderealLongitude - sun.siderealLongitude);
  const minDiff = Math.min(diff, 360 - diff);
  return minDiff <= maxOrb;
}

export function detectVedicYogasAndDoshas(
  planets: VedicPlanetPosition[],
  _ascendantLongitude: number,
): VedicYogaDoshaItem[] {
  const items: VedicYogaDoshaItem[] = [];

  const sun = planets.find((p) => p.body === 'sun');
  const moon = planets.find((p) => p.body === 'moon');
  const mars = planets.find((p) => p.body === 'mars');
  const mercury = planets.find((p) => p.body === 'mercury');
  const jupiter = planets.find((p) => p.body === 'jupiter');
  const saturn = planets.find((p) => p.body === 'saturn');

  // 1. Gaja Kesari Yoga (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  if (moon && jupiter) {
    const houseDiff = ((((jupiter.house - moon.house) % 12) + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(houseDiff)) {
      const involvedHouses = [moon.house, jupiter.house];
      const bhavaClass = classifyBhava(involvedHouses);
      const isJupiterInKendraFromLagna = [1, 4, 7, 10].includes(jupiter.house);
      const strength = isJupiterInKendraFromLagna ? 'Cao' : 'Trung Bình';

      items.push({
        id: 'gaja_kesari_yoga',
        nameVi: 'Gaja Kesari Yoga (Voi Vàng & Sư Tử)',
        nameSanskrit: 'Gaja Kesari Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: strength,
        planetsInvolved: ['Mặt Trăng (Chandra)', 'Sao Mộc (Guru)'],
        bhavaHouses: involvedHouses,
        bhavaClassificationVi: bhavaClass,
        dashaActivationVi: 'Hiệu lực bùng nổ trong Mahadasha/Antardasha của Sao Mộc (Guru) hoặc Mặt Trăng (Chandra).',
        descriptionVi:
          'Một trong những đại cát cách quý giá nhất trong Chiêm tinh Vệ Đà. Sao Mộc và Mặt Trăng tương hỗ tạo nên trí tuệ uyên bác, danh tiếng lẫy lừng, tấm lòng nhân hậu và cuộc sống vương giả.',
        personalizedSynthesisVi: `Định hình tại Nhà ${moon.house} (${SIGN_NAMES_VI[moon.signIndex]}) và Nhà ${jupiter.house} (${SIGN_NAMES_VI[jupiter.signIndex]}). ${
          isJupiterInKendraFromLagna
            ? 'Sao Mộc nằm tại góc Kendra của Cung Mọc giúp kích hoạt năng lực lãnh đạo, danh vọng và tài năng học thuật xuất sắc.'
            : 'Vị trí tương hỗ giữa Trăng và Mộc mang lại sự bình an nội tâm, trực giác cao quý và hậu vận thịnh vượng.'
        }`,
        remedyOrAdviceVi:
          'Hãy phát huy tối đa tinh thần học hỏi, mở rộng tri thức, làm việc thiện nguyện và giữ gìn phẩm hạnh chính trực.',
      });
    }
  }

  // 2. Budhaditya Yoga (Sun + Mercury conjunct in same sign)
  if (sun && mercury) {
    if (sun.signIndex === mercury.signIndex) {
      const isCombust = checkCombustion(mercury, sun, 3);
      const bhavaClass = classifyBhava([sun.house]);

      items.push({
        id: 'budhaditya_yoga',
        nameVi: 'Budhaditya Yoga (Nhật Thủy Đồng Cung)',
        nameSanskrit: 'Budhaditya Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: isCombust ? 'Trung Bình' : 'Cao',
        planetsInvolved: ['Mặt Trời (Surya)', 'Sao Thủy (Budha)'],
        bhavaHouses: [sun.house],
        bhavaClassificationVi: bhavaClass,
        isCombust,
        dashaActivationVi: 'Kích hoạt mạnh mẽ trong chu kỳ vận hành của Mặt Trời (Surya) và Sao Thủy (Budha).',
        descriptionVi:
          'Mặt Trời ban sự tự tin và danh tiếng, Sao Thủy ban trí tuệ và tài giao tiếp. Người có cách cục này có tư duy nhanh nhạy, tài hùng biện và dễ thành công trong học thuật, kinh doanh.',
        personalizedSynthesisVi: `Đồng cung tại Cung ${SIGN_NAMES_VI[sun.signIndex]} (Nhà ${sun.house}). ${
          isCombust
            ? 'Sao Thủy ở vị trí rất gần Mặt Trời (Astangata), đòi hỏi đương số rèn luyện sự khiêm tốn và lắng nghe để trí tuệ đạt đến độ chín muồi.'
            : 'Sao Thủy được Mặt Trời chiếu rọi rực rỡ, ban tặng tư duy sắc bén, khả năng đàm phán xuất chúng và năng lực phân tích chiến lược vượt bậc.'
        }`,
        remedyOrAdviceVi:
          'Tận dụng khả năng giao tiếp và tư duy phân tích trong đàm phán, hoạch định chiến lược và quản lý tài chính.',
      });
    }
  }

  // 3. Manglik / Kuja Dosha (Mars in 1st, 4th, 7th, 8th, 12th house from Lagna)
  if (mars) {
    const manglikHouses = [1, 4, 7, 8, 12];
    if (manglikHouses.includes(mars.house)) {
      const severity = mars.house === 7 || mars.house === 8 ? 'Cao' : 'Trung Bình';
      const bhavaClass = classifyBhava([mars.house]);

      items.push({
        id: 'manglik_dosha',
        nameVi: 'Manglik Dosha (Hỏa Tinh Chiếu Mệnh/Hôn Nhân)',
        nameSanskrit: 'Kuja Dosha',
        type: 'dosha',
        categoryVi: 'Khắc Kỵ (Dosha)',
        severityOrStrength: severity,
        planetsInvolved: ['Sao Hỏa (Mangala)'],
        bhavaHouses: [mars.house],
        bhavaClassificationVi: bhavaClass,
        dashaActivationVi:
          'Cần chú ý giữ hòa khí trong gia đạo trong các giai đoạn Mahadasha/Antardasha của Sao Hỏa (Mangala).',
        descriptionVi: `Sao Hỏa đóng tại Nhà ${mars.house} (${SIGN_NAMES_VI[mars.signIndex]}), tạo ra năng lượng nhiệt huyết, bộc trực nhưng có thể gây ra những thử thách về tính kiên nhẫn trong các mối quan hệ tình cảm và hôn nhân.`,
        personalizedSynthesisVi: `Sao Hỏa tọa thủ tại Nhà ${mars.house} (${SIGN_NAMES_VI[mars.signIndex]}). Đương số có cá tính mạnh mẽ, dám nghĩ dám làm và ý chí kiên định; tuy nhiên cần học cách làm dịu năng lượng Hỏa để xây dựng mối quan hệ đối tác và hôn nhân bền vững.`,
        remedyOrAdviceVi:
          'Học cách kiềm chế sự nóng nảy, tôn trọng không gian riêng của đối phương, tập thể thao lành mạnh và kết hôn khi đã đủ chín chắn.',
      });
    }
  }

  // 4. Chandra-Mangala Yoga (Moon + Mars conjunction or mutual aspect)
  if (moon && mars) {
    if (moon.signIndex === mars.signIndex || (((mars.house - moon.house) % 12) + 12) % 12 === 6) {
      const involvedHouses = [moon.house, mars.house];
      items.push({
        id: 'chandra_mangala_yoga',
        nameVi: 'Chandra-Mangala Yoga (Tài Lộc & Quyết Đoán)',
        nameSanskrit: 'Chandra-Mangala Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: 'Trung Bình',
        planetsInvolved: ['Mặt Trăng (Chandra)', 'Sao Hỏa (Mangala)'],
        bhavaHouses: involvedHouses,
        bhavaClassificationVi: classifyBhava(involvedHouses),
        dashaActivationVi: 'Kích hoạt khả năng sinh tài lớn trong đại vận của Mặt Trăng hoặc Sao Hỏa.',
        descriptionVi:
          'Sự kết hợp giữa cảm xúc trực giác và ý chí hành động dũng cảm giúp người sở hữu có năng lực kiếm tiền vượt trội, nhạy bén trong kinh doanh và đầu tư bất động sản.',
        personalizedSynthesisVi: `Liên kết giữa Mặt Trăng tại Nhà ${moon.house} và Sao Hỏa tại Nhà ${mars.house} tạo nên sự nhạy bén thương mại, năng lực xoay chuyển nguồn vốn và khả năng nắm bắt thời cơ nhanh chóng.`,
        remedyOrAdviceVi:
          'Kiểm soát cảm xúc bốc đồng khi tiêu xài hoặc đầu tư mạo hiểm; hướng nguồn lực vào các tài sản mang giá trị thực chất.',
      });
    }
  }

  // 5. Guru-Mangala Yoga (Jupiter + Mars in conjunction or mutual trine/kendra)
  if (jupiter && mars) {
    if (jupiter.signIndex === mars.signIndex) {
      const involvedHouses = [jupiter.house];
      items.push({
        id: 'guru_mangala_yoga',
        nameVi: 'Guru-Mangala Yoga (Chính Khí & Danh Tiếng)',
        nameSanskrit: 'Guru-Mangala Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: 'Cao',
        planetsInvolved: ['Sao Mộc (Guru)', 'Sao Hỏa (Mangala)'],
        bhavaHouses: involvedHouses,
        bhavaClassificationVi: classifyBhava(involvedHouses),
        dashaActivationVi: 'Khai mở vị thế lãnh đạo khi bước vào vận của Sao Mộc hoặc Sao Hỏa.',
        descriptionVi:
          'Năng lượng hành động mạnh mẽ của Hỏa Tinh được dẫn dắt bởi trí tuệ và đạo đức của Mộc Tinh, tạo nên phong thái chính trực, thành công trong quản lý và tổ chức.',
        personalizedSynthesisVi: `Hội tụ tại Nhà ${jupiter.house} (${SIGN_NAMES_VI[jupiter.signIndex]}), mang lại phong thái đĩnh đạc, khả năng tổ chức kỷ luật và được cấp dưới tôn kính.`,
        remedyOrAdviceVi:
          'Duy trì sự công tâm, liêm chính trong quản trị và dùng sức mạnh để bảo vệ, nâng đỡ người khác.',
      });
    }
  }

  // 6. Shani-Chandra (Visha Yoga - Saturn & Moon conjunction)
  if (saturn && moon) {
    if (saturn.signIndex === moon.signIndex) {
      const involvedHouses = [saturn.house];
      items.push({
        id: 'visha_dosha',
        nameVi: 'Visha Yoga (Nội Tâm Chiêm Nghiệm & Trầm Mặc)',
        nameSanskrit: 'Punraphoo / Visha Yoga',
        type: 'dosha',
        categoryVi: 'Khắc Kỵ (Dosha)',
        severityOrStrength: 'Trung Bình',
        planetsInvolved: ['Sao Thổ (Shani)', 'Mặt Trăng (Chandra)'],
        bhavaHouses: involvedHouses,
        bhavaClassificationVi: classifyBhava(involvedHouses),
        dashaActivationVi:
          'Cần chú ý chăm sóc sức khỏe tinh thần trong vận hạn của Sao Thổ (Shani) hoặc Mặt Trăng (Chandra).',
        descriptionVi:
          'Thổ Tinh và Mặt Trăng đồng cung tạo ra một thế giới nội tâm sâu sắc nhưng đôi khi có xu hướng lo âu, cảm thấy cô đơn hoặc gánh nặng trách nhiệm đè nặng.',
        personalizedSynthesisVi: `Đồng cung tại Nhà ${saturn.house} (${SIGN_NAMES_VI[saturn.signIndex]}). Đương số có chiều sâu tâm lý phi thường, khả năng chịu đựng bền bỉ và dễ đạt thành tựu lớn trong nghiên cứu, triết học hoặc tâm linh sau khi vượt qua thử thách nội tâm.`,
        remedyOrAdviceVi:
          'Thực hành thiền định, hòa mình vào thiên nhiên, duy trì suy nghĩ tích cực và chia sẻ tâm sự với những người thân tín.',
      });
    }
  }

  return items;
}
