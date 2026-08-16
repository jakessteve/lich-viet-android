/**
 * Tử Vi Chart Classification Tree Engine — Lịch Việt v4
 *
 * Implements the academic classification tree (Cây phân loại lá số) based on
 * cohoc.net and classical canons, classifying charts by Yin-Yang Gender,
 * Element Bureau (Cục), Mệnh Palace position, Major Star pattern, and Thân alignment.
 */

import type { TuViChart, TuViChartClassification, TuViGender } from '../../types/tuvi';

/**
 * Determines the canonical major star pattern at Mệnh palace.
 */
function identifyMenhStructure(majorStarNames: string[], menhChi: string): string {
  if (majorStarNames.length === 0) {
    return 'Mệnh Vô Chính Diệu';
  }

  // 1. Tử Vi constellations
  if (majorStarNames.includes('Tử Vi')) {
    if (majorStarNames.includes('Thiên Phủ')) return 'Tử Phủ Đồng Cung (Đế Tinh Phủ Khố)';
    if (majorStarNames.includes('Phá Quân')) return 'Tử Phá Đồng Cung (Tiên Trở Hậu Thành)';
    if (majorStarNames.includes('Tham Lang')) return 'Tử Tham Đồng Cung (Đào Hoa Phạm Chủ)';
    if (majorStarNames.includes('Thiên Tướng')) return 'Tử Tướng Đồng Cung (Chính Trực Quyền Uy)';
    if (majorStarNames.includes('Thất Sát')) return 'Tử Sát Đồng Cung (Hóa Sát Vi Quyền)';
    if (menhChi === 'Ngọ') return 'Tử Vi Cư Ngọ (Cực Hướng Ly Minh)';
    if (menhChi === 'Tý') return 'Tử Vi Cư Tý (Đế Tọa Bắc Bàn)';
    return 'Tử Vi Tọa Mệnh';
  }

  // 2. Sát Phá Tham grouping
  const hasSatPhaTham = majorStarNames.some((s) => ['Thất Sát', 'Phá Quân', 'Tham Lang'].includes(s));
  const hasTuPhu = majorStarNames.some((s) => ['Thiên Phủ', 'Thiên Tướng', 'Vũ Khúc'].includes(s));
  const hasCoNguyet = majorStarNames.some((s) => ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].includes(s));
  const hasCuNhat = majorStarNames.some((s) => ['Cự Môn', 'Thái Dương'].includes(s));

  if (hasSatPhaTham && !hasTuPhu) {
    if (majorStarNames.includes('Thất Sát')) return `Thất Sát Triều Đẩu (${majorStarNames.join(' + ')})`;
    if (majorStarNames.includes('Phá Quân')) return `Phá Quân Khai Phá (${majorStarNames.join(' + ')})`;
    if (majorStarNames.includes('Tham Lang')) return `Tham Lang Linh Hoạt (${majorStarNames.join(' + ')})`;
    return 'Cục diện Sát Phá Tham';
  }

  // 3. Phủ Tướng / Vũ Khúc
  if (hasTuPhu && !hasSatPhaTham) {
    if (majorStarNames.includes('Vũ Khúc') && majorStarNames.includes('Thiên Phủ'))
      return 'Vũ Phủ Đồng Cung (Cự Phú Chi Gia)';
    if (majorStarNames.includes('Vũ Khúc') && majorStarNames.includes('Thiên Tướng'))
      return 'Vũ Tướng Đồng Cung (Tài Lộc Uy Dũng)';
    if (majorStarNames.includes('Thiên Phủ')) return 'Thiên Phủ Độc Tọa (Hiền Hòa Điềm Đạm)';
    if (majorStarNames.includes('Thiên Tướng')) return 'Thiên Tướng Độc Tọa (Tướng Tinh Trợ Mệnh)';
    return 'Cục diện Tử Phủ Vũ Tướng';
  }

  // 4. Cơ Nguyệt Đồng Lương
  if (hasCoNguyet && !hasSatPhaTham) {
    if (majorStarNames.includes('Thiên Đồng') && majorStarNames.includes('Thiên Lương'))
      return 'Đồng Lương Thân Tỵ (Phúc Thọ Song Toàn)';
    if (majorStarNames.includes('Thiên Cơ') && majorStarNames.includes('Thái Âm'))
      return 'Cơ Nguyệt Dần Thân (Mưu Trí Thâm Trầm)';
    if (majorStarNames.includes('Thái Âm')) return 'Thái Âm Tọa Mệnh (Nguyệt Lãng Thiên Môn)';
    if (majorStarNames.includes('Thiên Lương')) return 'Thiên Lương Tọa Mệnh (Ấm Tinh Hộ Thân)';
    return 'Cục diện Cơ Nguyệt Đồng Lương';
  }

  // 5. Cự Nhật
  if (hasCuNhat) {
    if (majorStarNames.includes('Cự Môn') && majorStarNames.includes('Thái Dương'))
      return 'Cự Nhật Đồng Cung (Quang Minh Lỗi Lạc)';
    if (majorStarNames.includes('Thái Dương')) return 'Thái Dương Tọa Mệnh (Nhật Lệ Trung Thiên)';
    if (majorStarNames.includes('Cự Môn')) return 'Cự Môn Tọa Mệnh (Thạch Trung Ẩn Ngọc)';
    return 'Cục diện Cự Nhật';
  }

  return `Chính Tinh Tọa Mệnh (${majorStarNames.join(', ')})`;
}

/**
 * Classifies a Tu Vi chart into its academic archetype tree.
 */
export function classifyTuViChart(chart: TuViChart): TuViChartClassification {
  const menhPalace = chart.palaces.find((p) => p.isMenh) ?? chart.palaces[0];
  const thanPalace = chart.palaces.find((p) => p.isThan) ?? menhPalace;

  const gender: TuViGender = chart.centerInfo.gioiTinh.toLowerCase().includes('nữ') ? 'nữ' : 'nam';
  const amDuongNamNu = chart.centerInfo.amDuongLabel ?? '';
  const cucName = chart.centerInfo.cuc;
  const menhChi = menhPalace.chi;
  const thanChi = thanPalace.chi;
  const thanCuCung = `Thân cư ${thanPalace.name}`;

  const menhMajorStars = menhPalace.chinhTinh.map((s) => s.name);
  const menhStructureType = identifyMenhStructure(menhMajorStars, menhChi);

  const classificationPath = [amDuongNamNu, cucName, `Mệnh tại ${menhChi}`, menhStructureType, thanCuCung];

  let patternSummaryVi = `Lá số thuộc diện **${amDuongNamNu} • ${cucName}**, Mệnh an tại ${menhChi} thủ sao ${menhStructureType}, ${thanCuCung} tại ${thanChi}. `;
  if (thanPalace.name === 'Mệnh') {
    patternSummaryVi +=
      'Thân Mệnh đồng cung: Tính cách nhất quán, tự lực cánh sinh, tiền vận và hậu vận cùng chung một chí hướng.';
  } else if (thanPalace.name === 'Phúc Đức') {
    patternSummaryVi +=
      'Thân cư Phúc Đức: Coi trọng đời sống tinh thần, được thụ hưởng phúc ấm gia tộc và có duyên lành với tâm linh, triết lý.';
  } else if (thanPalace.name === 'Quan Lộc') {
    patternSummaryVi +=
      'Thân cư Quan Lộc: Con người của công việc và sự nghiệp, luôn nỗ lực xây dựng vị thế xã hội vững vàng.';
  } else if (thanPalace.name === 'Tài Bạch') {
    patternSummaryVi +=
      'Thân cư Tài Bạch: Rất nhạy bén với cơ hội tài chính, thực tế và luôn chủ động tích lũy giá trị vật chất.';
  } else if (thanPalace.name === 'Thiên Di') {
    patternSummaryVi +=
      'Thân cư Thiên Di: Thích hợp xuất ngoại, hoạt động xa quê, dễ thành danh khi giao lưu và mở rộng quan hệ đối ngoại.';
  } else if (thanPalace.name === 'Phu Thê') {
    patternSummaryVi +=
      'Thân cư Phu Thê: Đời sống và sự nghiệp chịu ảnh hưởng sâu sắc từ người bạn đời; gia đạo thuận hòa là động lực lớn nhất.';
  }

  return {
    gender,
    amDuongNamNu,
    cucName,
    menhChi,
    thanChi,
    thanCuCung,
    menhMajorStars,
    menhStructureType,
    classificationPath,
    patternSummaryVi,
  };
}
