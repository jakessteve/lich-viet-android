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
}

export interface VedicPlanetPosition {
  body: string;
  siderealLongitude: number;
  house: number;
  signIndex: number;
}

export function detectVedicYogasAndDoshas(
  planets: VedicPlanetPosition[],
  ascendantLongitude: number
): VedicYogaDoshaItem[] {
  const items: VedicYogaDoshaItem[] = [];

  const sun = planets.find((p) => p.body === 'sun');
  const moon = planets.find((p) => p.body === 'moon');
  const mars = planets.find((p) => p.body === 'mars');
  const mercury = planets.find((p) => p.body === 'mercury');
  const jupiter = planets.find((p) => p.body === 'jupiter');
  const saturn = planets.find((p) => p.body === 'saturn');

  const ascSign = Math.floor((((ascendantLongitude % 360) + 360) % 360) / 30);

  // 1. Gaja Kesari Yoga (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  if (moon && jupiter) {
    const houseDiff = (((jupiter.house - moon.house) % 12) + 12) % 12 + 1;
    if ([1, 4, 7, 10].includes(houseDiff)) {
      items.push({
        id: 'gaja_kesari_yoga',
        nameVi: 'Gaja Kesari Yoga (Voi Vàng & Sư Tử)',
        nameSanskrit: 'Gaja Kesari Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: 'Cao',
        planetsInvolved: ['Mặt Trăng (Chandra)', 'Sao Mộc (Guru)'],
        descriptionVi:
          'Một trong những đại cát cách quý giá nhất trong Chiêm tinh Vệ Đà. Sao Mộc và Mặt Trăng tương hỗ tạo nên trí tuệ uyên bác, danh tiếng lẫy lừng, tấm lòng nhân hậu và cuộc sống vương giả.',
        remedyOrAdviceVi: 'Hãy phát huy tối đa tinh thần học hỏi, mở rộng tri thức và làm việc thiện nguyện.',
      });
    }
  }

  // 2. Budhaditya Yoga (Sun + Mercury conjunct in same sign)
  if (sun && mercury) {
    if (sun.signIndex === mercury.signIndex) {
      items.push({
        id: 'budhaditya_yoga',
        nameVi: 'Budhaditya Yoga (Nhật Thủy Đồng Cung)',
        nameSanskrit: 'Budhaditya Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: 'Cao',
        planetsInvolved: ['Mặt Trời (Surya)', 'Sao Thủy (Budha)'],
        descriptionVi:
          'Mặt Trời ban sự tự tin và danh tiếng, Sao Thủy ban trí tuệ và tài giao tiếp. Người có cách cục này có tư duy nhanh nhạy, tài hùng biện và dễ thành công trong học thuật, kinh doanh.',
        remedyOrAdviceVi: 'Tận dụng khả năng giao tiếp và tư duy phân tích trong đàm phán, hoạch định chiến lược.',
      });
    }
  }

  // 3. Manglik / Kuja Dosha (Mars in 1st, 4th, 7th, 8th, 12th house from Lagna)
  if (mars) {
    const manglikHouses = [1, 4, 7, 8, 12];
    if (manglikHouses.includes(mars.house)) {
      items.push({
        id: 'manglik_dosha',
        nameVi: 'Manglik Dosha (Hỏa Tinh Chiếu Mệnh/Hôn Nhân)',
        nameSanskrit: 'Kuja Dosha',
        type: 'dosha',
        categoryVi: 'Khắc Kỵ (Dosha)',
        severityOrStrength: mars.house === 7 || mars.house === 8 ? 'Cao' : 'Trung Bình',
        planetsInvolved: ['Sao Hỏa (Mangala)'],
        descriptionVi:
          `Sao Hỏa đóng tại Nhà ${mars.house}, tạo ra năng lượng nhiệt huyết, bộc trực nhưng có thể gây ra những thử thách về tính kiên nhẫn trong các mối quan hệ tình cảm và hôn nhân.`,
        remedyOrAdviceVi: 'Học cách kiềm chế sự nóng nảy, tôn trọng không gian riêng của đối phương và kết hôn khi đã đủ trưởng thành.',
      });
    }
  }

  // 4. Chandra-Mangala Yoga (Moon + Mars conjunction or mutual aspect)
  if (moon && mars) {
    if (moon.signIndex === mars.signIndex || (((mars.house - moon.house) % 12) + 12) % 12 === 6) {
      items.push({
        id: 'chandra_mangala_yoga',
        nameVi: 'Chandra-Mangala Yoga (Tài Lộc & Quyết Đoán)',
        nameSanskrit: 'Chandra-Mangala Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: 'Trung Bình',
        planetsInvolved: ['Mặt Trăng (Chandra)', 'Sao Hỏa (Mangala)'],
        descriptionVi:
          'Sự kết hợp giữa cảm xúc trực giác và ý chí hành động dũng cảm giúp người sở hữu có năng lực kiếm tiền vượt trội, nhạy bén trong kinh doanh và đầu tư bất động sản.',
        remedyOrAdviceVi: 'Kiểm soát cảm xúc bốc đồng khi tiêu xài hoặc đầu tư mạo hiểm.',
      });
    }
  }

  // 5. Guru-Mangala Yoga (Jupiter + Mars in conjunction or mutual trine/kendra)
  if (jupiter && mars) {
    if (jupiter.signIndex === mars.signIndex) {
      items.push({
        id: 'guru_mangala_yoga',
        nameVi: 'Guru-Mangala Yoga (Chính Khí & Danh Tiếng)',
        nameSanskrit: 'Guru-Mangala Yoga',
        type: 'yoga',
        categoryVi: 'Cát Cách (Yoga)',
        severityOrStrength: 'Cao',
        planetsInvolved: ['Sao Mộc (Guru)', 'Sao Hỏa (Mangala)'],
        descriptionVi:
          'Năng lượng hành động mạnh mẽ của Hỏa Tinh được dẫn dắt bởi trí tuệ và đạo đức của Mộc Tinh, tạo nên phong thái chính trực, thành công trong quản lý và tổ chức.',
      });
    }
  }

  // 6. Shani-Chandra (Visha Yoga - Saturn & Moon conjunction)
  if (saturn && moon) {
    if (saturn.signIndex === moon.signIndex) {
      items.push({
        id: 'visha_dosha',
        nameVi: 'Visha Yoga (Nội Tâm Chiêm Nghiệm & Trầm Mặc)',
        nameSanskrit: 'Punraphoo / Visha Yoga',
        type: 'dosha',
        categoryVi: 'Khắc Kỵ (Dosha)',
        severityOrStrength: 'Trung Bình',
        planetsInvolved: ['Sao Thổ (Shani)', 'Mặt Trăng (Chandra)'],
        descriptionVi:
          'Thổ Tinh và Mặt Trăng đồng cung tạo ra một thế giới nội tâm sâu sắc nhưng đôi khi có xu hướng lo âu, cảm thấy cô đơn hoặc gánh nặng trách nhiệm đè nặng.',
        remedyOrAdviceVi: 'Thực hành thiền định, hòa mình vào thiên nhiên và chia sẻ tâm sự với những người thân tín.',
      });
    }
  }

  return items;
}
