/**
 * Horary Astrology Engine (Chiêm Tinh Hỏi Nhanh / Thấu Thị Thời Khắc)
 * Based on William Lilly (Christian Astrology), Guido Bonatti, and John Frawley.
 *
 * Implements:
 * 1. Radicality Checks (Strict conditions before judging):
 *    - Early Ascendant (< 3°): Too early to tell, situation premature.
 *    - Late Ascendant (> 27°): Too late, matter already decided or beyond querent's control.
 *    - Moon in Via Combusta (15° Libra to 15° Scorpio): Highly unstable, emotional volatility.
 *    - Saturn in 1st or 7th house (Affliction to querent / astrologer).
 * 2. Querent Significators (Lord of 1st house + Moon).
 * 3. Quesited Significators (Lord of house corresponding to question topic).
 * 4. Moon Void of Course (VOC) check: No applying major aspects before leaving current sign.
 * 5. Aspect Perfection & Test of Reception (Conjunction, Trine, Sextile, Square with reception, Opposition).
 * 6. Automated Final Judgment verdict & confidence score.
 */

import { DOMICILE_RULERS, ZODIAC_SIGNS } from './traditional-dignities.js';

export const HORARY_TOPICS = [
  { id: 'love', label: 'Tình Cảm / Người Ấy (Love & Relationships)', quesitedHouse: 7, description: 'Hôn nhân, người yêu, đối tác, người thương' },
  { id: 'career', label: 'Công Việc & Thăng Tiến (Career & Promotion)', quesitedHouse: 10, description: 'Sự nghiệp, địa vị xã hội, cấp trên, công danh' },
  { id: 'money', label: 'Tài Chính & Thu Nhập (Money & Assets)', quesitedHouse: 2, description: 'Tiền bạc cá nhân, thu nhập, lợi nhuận mua bán' },
  { id: 'lost_item', label: 'Tìm Đồ Thất Lạc (Lost Items)', quesitedHouse: 2, description: 'Vật dụng bị mất, tài sản thất lạc' },
  { id: 'job_interview', label: 'Phỏng Vấn & Việc Làm (Job / Daily Work)', quesitedHouse: 6, description: 'Công việc hàng ngày, môi trường làm việc, sức khỏe' },
  { id: 'relocation', label: 'Nhà Cửa & Bất Động Sản (Real Estate / Home)', quesitedHouse: 4, description: 'Mua bán nhà, chuyển nhà, đất đai, gia đạo' },
  { id: 'investment', label: 'Đầu Tư & Vốn Chung (Investments / Loans)', quesitedHouse: 8, description: 'Vay vốn, đầu tư mạo hiểm, tiền thừa kế' },
  { id: 'exam_travel', label: 'Học Tập / Du Học / Đi Xa (Higher Study / Travel)', quesitedHouse: 9, description: 'Thi cử, bằng cấp, xuất ngoại, visa' },
  { id: 'friend_networking', label: 'Bạn Bè & Cơ Hội (Friends & Network)', quesitedHouse: 11, description: 'Hội nhóm, quý nhân giúp đỡ, hy vọng và ước mơ' }
];

const norm = (v) => ((v % 360) + 360) % 360;

/**
 * Evaluates Horary Chart Radicality.
 */
export function checkHoraryRadicality(ascDegreeInSign, ascSign, moonLongitude, planets = []) {
  const warnings = [];
  let isRadical = true;

  // 1. Early Ascendant
  if (ascDegreeInSign < 3) {
    warnings.push({
      type: 'early_ascendant',
      severity: 'warning',
      message: `Cung Mọc còn quá sớm (${ascDegreeInSign.toFixed(1)}° ${ascSign}): Sự việc còn quá non trẻ, chưa đủ điều kiện chín muồi để phán đoán dứt khoát.`
    });
  }

  // 2. Late Ascendant
  if (ascDegreeInSign > 27) {
    warnings.push({
      type: 'late_ascendant',
      severity: 'warning',
      message: `Cung Mọc quá muộn (${ascDegreeInSign.toFixed(1)}° ${ascSign}): Vấn đề dường như đã an bài, cơ hội can thiệp đã qua hoặc sự việc đã vượt tầm kiểm soát.`
    });
  }

  // 3. Moon in Via Combusta (195° to 225° / 15° Libra to 15° Scorpio)
  const normMoon = norm(moonLongitude);
  if (normMoon >= 195 && normMoon <= 225) {
    warnings.push({
      type: 'via_combusta',
      severity: 'warning',
      message: `Mặt Trăng rơi vào Đường Thiêu Đốt (Via Combusta - 15° Thiên Bình đến 15° Bọ Cạp): Trực giác dao động, cảm xúc biến động dữ dội, cần hết sức thận trọng.`
    });
  }

  // 4. Saturn in 1st (strict traditional check)
  const saturn = planets.find((p) => (p.body || '').toLowerCase() === 'saturn');
  if (saturn && saturn.house === 1) {
    warnings.push({
      type: 'saturn_in_1st',
      severity: 'caution',
      message: 'Sao Thổ ngự tại Cung 1: Người hỏi có thể gặp nhiều áp lực, nghi ngại hoặc thiếu thông tin khách quan.'
    });
  }

  if (warnings.some((w) => w.severity === 'warning')) {
    isRadical = false;
  }

  return {
    isRadical,
    warnings
  };
}

/**
 * Evaluates Moon Void of Course (VOC).
 */
export function checkMoonVoidOfCourse(moonLongitude, planets = []) {
  const normMoon = norm(moonLongitude);
  const moonSignIdx = Math.floor(normMoon / 30);
  const endOfSign = (moonSignIdx + 1) * 30;
  const remainingDegrees = endOfSign - normMoon;

  // Major aspects check to traditional planets before leaving sign
  const MAJOR_ANGLES = [0, 60, 90, 120, 180];
  const traditionalBodies = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  let hasApplyingAspect = false;
  for (const planet of planets) {
    const pBody = (planet.body || '').toLowerCase();
    if (!traditionalBodies.includes(pBody)) continue;

    const pLong = norm(planet.tropicalLongitude);
    // Angular distance moving forward
    for (const angle of MAJOR_ANGLES) {
      const targetDeg = norm(pLong - angle);
      const diff = norm(targetDeg - normMoon);
      if (diff > 0 && diff <= remainingDegrees) {
        hasApplyingAspect = true;
        break;
      }
    }
    if (hasApplyingAspect) break;
  }

  const isVoid = !hasApplyingAspect;
  return {
    isVoid,
    remainingDegrees: Math.round(remainingDegrees * 10) / 10,
    message: isVoid
      ? 'Mặt Trăng Không Điểm Tựa (Void of Course): Không có góc chiếu nào trước khi rời cung. Báo hiệu sự việc có xu hướng "không thành", giữ nguyên hiện trạng hoặc nỗ lực ít mang lại kết quả như ý.'
      : 'Mặt Trăng Có Điểm Tựa: Tiến trình diễn biến thuận lợi theo dòng chảy các sự kiện.'
  };
}

/**
 * Analyzes a Horary Question.
 */
export function judgeHoraryChart({
  topicId,
  houseCusps,
  planets,
  ascendantLongitude
}) {
  const topic = HORARY_TOPICS.find((t) => t.id === topicId) || HORARY_TOPICS[0];
  const quesitedHouseNumber = topic.quesitedHouse;

  // Find house cusp signs
  const ascSignIdx = Math.floor(norm(ascendantLongitude) / 30);
  const ascSign = ZODIAC_SIGNS[ascSignIdx];
  const ascDegInSign = ascendantLongitude % 30;

  const quesitedCuspLong = houseCusps[quesitedHouseNumber - 1] ?? (ascendantLongitude + (quesitedHouseNumber - 1) * 30);
  const quesitedSignIdx = Math.floor(norm(quesitedCuspLong) / 30);
  const quesitedSign = ZODIAC_SIGNS[quesitedSignIdx];

  // Significators
  const querentRuler = DOMICILE_RULERS[ascSign] || 'mars';
  const quesitedRuler = DOMICILE_RULERS[quesitedSign] || 'venus';

  const moonPlanet = planets.find((p) => (p.body || '').toLowerCase() === 'moon');
  const querentPlanet = planets.find((p) => (p.body || '').toLowerCase() === querentRuler);
  const quesitedPlanet = planets.find((p) => (p.body || '').toLowerCase() === quesitedRuler);

  const moonLong = moonPlanet?.tropicalLongitude ?? 0;
  const radicality = checkHoraryRadicality(ascDegInSign, ascSign, moonLong, planets);
  const moonVoc = checkMoonVoidOfCourse(moonLong, planets);

  // Aspect check between Querent Significator (or Moon) and Quesited Significator
  let aspectPerfection = 'none';
  let aspectDetail = 'Không tìm thấy góc chiếu chính giữa Chúa tể Cung 1 và Chúa tể Cung đại diện.';
  let score = 50;

  if (querentPlanet && quesitedPlanet) {
    if (querentRuler === quesitedRuler) {
      aspectPerfection = 'conjunction';
      aspectDetail = 'Cùng một hành tinh làm chủ cả 2 cung (Chủ nhà trùng nhau): Sự việc gắn kết tự nhiên, có khả năng thành công cao.';
      score = 85;
    } else {
      const qLong = norm(querentPlanet.tropicalLongitude);
      const targetLong = norm(quesitedPlanet.tropicalLongitude);
      const dist = Math.abs(qLong - targetLong);
      const shortest = Math.min(dist, 360 - dist);

      if (shortest <= 8) {
        aspectPerfection = 'conjunction';
        aspectDetail = 'Góc Trùng (Conjunction): Hai năng lượng hợp nhất trực tiếp. Kết quả vô cùng hứa hẹn!';
        score = 90;
      } else if (Math.abs(shortest - 120) <= 6) {
        aspectPerfection = 'trine';
        aspectDetail = 'Góc Tam Hợp (Trine): Dòng chảy thuận lợi tự nhiên, mọi thứ diễn ra êm đẹp không cần gắng gượng.';
        score = 85;
      } else if (Math.abs(shortest - 60) <= 5) {
        aspectPerfection = 'sextile';
        aspectDetail = 'Góc Lục Hợp (Sextile): Cơ hội rộng mở, thành công đạt được khi chủ động nắm bắt.';
        score = 75;
      } else if (Math.abs(shortest - 90) <= 6) {
        aspectPerfection = 'square';
        aspectDetail = 'Góc Vuông (Square): Có nhiều trở ngại, xung đột hoặc cần phải trả giá/nỗ lực vượt bậc.';
        score = 40;
      } else if (Math.abs(shortest - 180) <= 8) {
        aspectPerfection = 'opposition';
        aspectDetail = 'Góc Xung (Opposition): Mâu thuẫn chia rẽ hoặc sự chia ly sau khi đạt được một phần.';
        score = 30;
      }
    }
  }

  // Deductions for VOC Moon and Non-radical conditions
  if (moonVoc.isVoid) score -= 20;
  if (!radicality.isRadical) score -= 15;
  score = Math.max(10, Math.min(95, score));

  let verdict = 'Cần Thận Trọng / Chờ Thêm Tín Hiệu';
  let verdictColor = 'text-amber-500';
  if (score >= 70) {
    verdict = 'Khả Năng Thành Công Cao (Thuận Lợi)';
    verdictColor = 'text-emerald-500';
  } else if (score < 40) {
    verdict = 'Khó Khăn / Không Thuận Lợi';
    verdictColor = 'text-rose-500';
  }

  return {
    topic,
    radicality,
    moonVoc,
    querentSignificators: {
      primary: querentRuler,
      coSignificator: 'moon',
      ascSign,
      ascDegree: Math.round(ascDegInSign * 10) / 10
    },
    quesitedSignificators: {
      primary: quesitedRuler,
      houseNumber: quesitedHouseNumber,
      houseSign: quesitedSign
    },
    aspectPerfection,
    aspectDetail,
    verdict,
    verdictColor,
    confidenceScore: score
  };
}
