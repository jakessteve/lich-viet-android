export type VedicCombinationType = 'yoga' | 'dosha' | 'neutral';

export interface VedicYogaDoshaItem {
  id: string;
  nameVi: string;
  nameSanskrit: string;
  type: VedicCombinationType;
  categoryVi: 'Cát Cách (Yoga)' | 'Khắc Kỵ (Dosha)' | 'Đặc Biệt';
  severityOrStrength: 'Tối Cao' | 'Cao' | 'Trung Bình' | 'Nhẹ';
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

  // 3. Manglik / Kuja Dosha with Classical Parashara Cancellations
  if (mars) {
    const manglikHouses = [1, 4, 7, 8, 12];
    if (manglikHouses.includes(mars.house)) {
      const cancellations: string[] = [];
      if (mars.house === 1 && mars.signIndex === 0) {
        cancellations.push('Hỏa Tinh cư Bạch Dương tại Cung 1 (Nhà của chính mình / Ruchaka Yoga)');
      }
      if (mars.house === 4 && mars.signIndex === 7) {
        cancellations.push('Hỏa Tinh cư Bọ Cạp tại Cung 4 (Tự vượng bản cung)');
      }
      if (mars.house === 7 && mars.signIndex === 9) {
        cancellations.push('Hỏa Tinh đắc địa Ma Kết tại Cung 7 (Uchcha / Tối Thượng Exalted)');
      }
      if (mars.house === 8 && (mars.signIndex === 8 || mars.signIndex === 11)) {
        cancellations.push('Hỏa Tinh cư Nhân Mã/Song Ngư tại Cung 8 (Nhà Sao Mộc bảo bọc)');
      }
      if (mars.house === 12 && (mars.signIndex === 3 || mars.signIndex === 4)) {
        cancellations.push('Hỏa Tinh cư Cự Giải/Sư Tử tại Cung 12 (Hóa giải sát tính)');
      }
      if (jupiter && (jupiter.signIndex === mars.signIndex || (((jupiter.house - mars.house) % 12) + 12) % 12 === 6)) {
        cancellations.push('Được Sao Mộc (Guru) đồng cung hoặc đối chiếu che chở');
      }
      if (moon && moon.signIndex === mars.signIndex) {
        cancellations.push('Đồng cung với Mặt Trăng (Chandra-Mangala hóa sát thành tài)');
      }

      const isCancelled = cancellations.length > 0;
      const severity = isCancelled ? 'Nhẹ' : (mars.house === 7 || mars.house === 8 ? 'Cao' : 'Trung Bình');
      const bhavaClass = classifyBhava([mars.house]);

      items.push({
        id: 'manglik_dosha',
        nameVi: isCancelled ? 'Kuja Dosha (Đã Hóa Giải - Manglik Cancelled)' : 'Manglik Dosha (Hỏa Tinh Chiếu Mệnh/Hôn Nhân)',
        nameSanskrit: isCancelled ? 'Kuja Dosha Nivaran' : 'Kuja Dosha',
        type: isCancelled ? 'neutral' : 'dosha',
        categoryVi: isCancelled ? 'Đặc Biệt' : 'Khắc Kỵ (Dosha)',
        severityOrStrength: severity,
        planetsInvolved: ['Sao Hỏa (Mangala)'],
        bhavaHouses: [mars.house],
        bhavaClassificationVi: bhavaClass,
        dashaActivationVi:
          'Cần chú ý giữ hòa khí trong gia đạo trong các giai đoạn Mahadasha/Antardasha của Sao Hỏa (Mangala).',
        descriptionVi: isCancelled
          ? `Sao Hỏa đóng tại Nhà ${mars.house} (${SIGN_NAMES_VI[mars.signIndex]}) cấu thành thế Manglik nhưng ĐÃ ĐƯỢC HÓA GIẢI theo kinh điển Parashara: ${cancellations.join('; ')}.`
          : `Sao Hỏa đóng tại Nhà ${mars.house} (${SIGN_NAMES_VI[mars.signIndex]}), tạo ra năng lượng nhiệt huyết, bộc trực nhưng có thể gây ra những thử thách về tính kiên nhẫn trong các mối quan hệ tình cảm và hôn nhân.`,
        personalizedSynthesisVi: isCancelled
          ? `Thế Hỏa Tinh tại Nhà ${mars.house} đã được hóa giải nhờ: ${cancellations.join('; ')}. Năng lượng Hỏa chuyển hóa thành ý chí kiên định và bản lĩnh vượt khó.`
          : `Sao Hỏa tọa thủ tại Nhà ${mars.house} (${SIGN_NAMES_VI[mars.signIndex]}). Đương số có cá tính mạnh mẽ, dám nghĩ dám làm và ý chí kiên định; tuy nhiên cần học cách làm dịu năng lượng Hỏa để xây dựng mối quan hệ đối tác và hôn nhân bền vững.`,
        remedyOrAdviceVi: isCancelled
          ? 'Phát huy năng lực lãnh đạo và sự kiên cường trong công việc; duy trì lối ứng xử hòa nhã, bao dung trong tình cảm.'
          : 'Học cách kiềm chế sự nóng nảy, tôn trọng không gian riêng của đối phương, tập thể thao lành mạnh và kết hôn khi đã đủ chín chắn.',
      });
    }
  }

  // 4. Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Sasa)
  const venus = planets.find((p) => p.body === 'venus');
  const kendraHouses = [1, 4, 7, 10];

  // Ruchaka (Mars in Kendra in own/exalt sign: Aries 0, Scorpio 7, Capricorn 9)
  if (mars && kendraHouses.includes(mars.house) && [0, 7, 9].includes(mars.signIndex)) {
    items.push({
      id: 'ruchaka_yoga',
      nameVi: 'Ruchaka Yoga (Đại Hùng & Dũng Tướng)',
      nameSanskrit: 'Ruchaka Yoga (Pancha Mahapurusha)',
      type: 'yoga',
      categoryVi: 'Cát Cách (Yoga)',
      severityOrStrength: 'Tối Cao',
      planetsInvolved: ['Sao Hỏa (Mangala)'],
      bhavaHouses: [mars.house],
      bhavaClassificationVi: classifyBhava([mars.house]),
      dashaActivationVi: 'Hiệu lực tột đỉnh trong đại vận Hỏa Tinh (Mangala Mahadasha).',
      descriptionVi: 'Một trong Ngũ Đại Cát Cách (Pancha Mahapurusha). Sao Hỏa đắc địa tại cung Kendra mang lại khí phách hào sảng, uy quyền quân sự, tài năng lãnh đạo và thể lực phi thường.',
      personalizedSynthesisVi: `Hỏa Tinh ngự tại Nhà ${mars.house} thuộc cung ${SIGN_NAMES_VI[mars.signIndex]}. Đương số có tố chất chỉ huy, ý chí sắt đá và khả năng chuyển bại thành thắng.`,
      remedyOrAdviceVi: 'Sử dụng uy quyền và lòng dũng cảm để bảo vệ chính nghĩa và dẫn dắt tập thể.',
    });
  }

  // Bhadra (Mercury in Kendra in own/exalt sign: Gemini 2, Virgo 5)
  if (mercury && kendraHouses.includes(mercury.house) && [2, 5].includes(mercury.signIndex)) {
    items.push({
      id: 'bhadra_yoga',
      nameVi: 'Bhadra Yoga (Trí Tuệ Trác Tuyệt & Hùng Biện)',
      nameSanskrit: 'Bhadra Yoga (Pancha Mahapurusha)',
      type: 'yoga',
      categoryVi: 'Cát Cách (Yoga)',
      severityOrStrength: 'Tối Cao',
      planetsInvolved: ['Sao Thủy (Budha)'],
      bhavaHouses: [mercury.house],
      bhavaClassificationVi: classifyBhava([mercury.house]),
      dashaActivationVi: 'Kích hoạt tài năng kinh doanh và văn chương vượt bậc trong vận Sao Thủy.',
      descriptionVi: 'Một trong Ngũ Đại Cát Cách. Sao Thủy đắc địa tại Kendra ban tặng trí tuệ uyên bác, tài giao tiếp ngoại giao siêu phàm và danh tiếng trong giới học giả/doanh nhân.',
      personalizedSynthesisVi: `Thủy Tinh ngự tại Nhà ${mercury.house} thuộc cung ${SIGN_NAMES_VI[mercury.signIndex]}, mang lại tư duy toán học và ngôn ngữ trác việt.`,
      remedyOrAdviceVi: 'Phát huy năng khiếu nghiên cứu, viết lách, kinh doanh và cố vấn chiến lược.',
    });
  }

  // Hamsa (Jupiter in Kendra in own/exalt sign: Cancer 3, Sagittarius 8, Pisces 11)
  if (jupiter && kendraHouses.includes(jupiter.house) && [3, 8, 11].includes(jupiter.signIndex)) {
    items.push({
      id: 'hamsa_yoga',
      nameVi: 'Hamsa Yoga (Bạch Hạc Thánh Thiện & Đạo Đức)',
      nameSanskrit: 'Hamsa Yoga (Pancha Mahapurusha)',
      type: 'yoga',
      categoryVi: 'Cát Cách (Yoga)',
      severityOrStrength: 'Tối Cao',
      planetsInvolved: ['Sao Mộc (Guru)'],
      bhavaHouses: [jupiter.house],
      bhavaClassificationVi: classifyBhava([jupiter.house]),
      dashaActivationVi: 'Phát huy phước lành, danh dự và tài lộc lớn trong vận Sao Mộc.',
      descriptionVi: 'Một trong Ngũ Đại Cát Cách. Sao Mộc tọa thủ tại Kendra giúp người sở hữu có tâm hồn thánh thiện, trí tuệ tâm linh cao thâm và được xã hội kính trọng.',
      personalizedSynthesisVi: `Mộc Tinh ngự tại Nhà ${jupiter.house} (${SIGN_NAMES_VI[jupiter.signIndex]}), tạo nên phong thái vương giả, uy tín đạo đức và phúc ấm bền vững.`,
      remedyOrAdviceVi: 'Lan tỏa tri thức, làm việc thiện nguyện và giữ gìn chuẩn mực đạo đức trong sáng.',
    });
  }

  // Malavya (Venus in Kendra in own/exalt sign: Taurus 1, Libra 6, Pisces 11)
  if (venus && kendraHouses.includes(venus.house) && [1, 6, 11].includes(venus.signIndex)) {
    items.push({
      id: 'malavya_yoga',
      nameVi: 'Malavya Yoga (Mỹ Lệ, Phú Quý & Nghệ Thuật)',
      nameSanskrit: 'Malavya Yoga (Pancha Mahapurusha)',
      type: 'yoga',
      categoryVi: 'Cát Cách (Yoga)',
      severityOrStrength: 'Tối Cao',
      planetsInvolved: ['Sao Kim (Shukra)'],
      bhavaHouses: [venus.house],
      bhavaClassificationVi: classifyBhava([venus.house]),
      dashaActivationVi: 'Khai mở vận may tài chính và thành tựu nghệ thuật rực rỡ trong vận Sao Kim.',
      descriptionVi: 'Một trong Ngũ Đại Cát Cách. Sao Kim tọa thủ tại Kendra mang lại nét đẹp quý phái, cuộc sống phong lưu, tài hoa nghệ thuật và hạnh phúc gia đạo.',
      personalizedSynthesisVi: `Kim Tinh ngự tại Nhà ${venus.house} (${SIGN_NAMES_VI[venus.signIndex]}), mang lại gu thẩm mỹ tinh tế và duyên may thu hút tài lộc.`,
      remedyOrAdviceVi: 'Tận dụng khiếu thẩm mỹ, sự khéo léo trong quan hệ công chúng và lối sống thanh lịch.',
    });
  }

  // Sasa (Saturn in Kendra in own/exalt sign: Libra 6, Capricorn 9, Aquarius 10)
  if (saturn && kendraHouses.includes(saturn.house) && [6, 9, 10].includes(saturn.signIndex)) {
    items.push({
      id: 'sasa_yoga',
      nameVi: 'Sasa Yoga (Quyền Lực Trầm Tích & Kỷ Luật Thép)',
      nameSanskrit: 'Sasa Yoga (Pancha Mahapurusha)',
      type: 'yoga',
      categoryVi: 'Cát Cách (Yoga)',
      severityOrStrength: 'Tối Cao',
      planetsInvolved: ['Sao Thổ (Shani)'],
      bhavaHouses: [saturn.house],
      bhavaClassificationVi: classifyBhava([saturn.house]),
      dashaActivationVi: 'Gặt hái thành tựu khổng lồ sau thời gian kiên trì rèn luyện trong vận Sao Thổ.',
      descriptionVi: 'Một trong Ngũ Đại Cát Cách. Sao Thổ tọa thủ tại Kendra rèn giũa ý chí phi thường, bản lĩnh chịu đựng bền bỉ và quyền lực tối thượng nơi hậu vận.',
      personalizedSynthesisVi: `Thổ Tinh ngự tại Nhà ${saturn.house} (${SIGN_NAMES_VI[saturn.signIndex]}), giúp đương số xây dựng cơ nghiệp vững chắc như bàn thạch.`,
      remedyOrAdviceVi: 'Kiên trì mục tiêu dài hạn, giữ kỷ luật nghiêm minh và công bằng với cấp dưới.',
    });
  }

  // 5. Chandra-Mangala Yoga (Moon + Mars conjunction or mutual aspect)
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

  // 6. Guru-Mangala Yoga (Jupiter + Mars in conjunction)
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

  // 7. Shani-Chandra (Visha Yoga - Saturn & Moon conjunction)
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
