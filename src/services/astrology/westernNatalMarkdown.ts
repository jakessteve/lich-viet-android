import type { SwissNatalChartResult } from './swissNatalChart';
import { synthesizeWesternReading } from './westernSynthesisEngine';
import { calculateBirthMoonPhase } from './moonPhase';
import { calculateElementModalityBalance } from './elementBalance';
import { detectAspectPatterns } from './aspectPatterns';

function formatDegMin(degree: number, minute: number): string {
  return `${degree}°${minute.toString().padStart(2, '0')}′`;
}

export function formatWesternNatalAsMarkdown(result: SwissNatalChartResult): string {
  const sunObj = result.objects.find((o) => o.id === 'planet:sun');
  const moonObj = result.objects.find((o) => o.id === 'planet:moon');

  // Ensure element balance, moon phase, and aspect patterns exist even if not attached to raw fixture
  const elementBalance =
    result.elementBalance ??
    (result.objects ? calculateElementModalityBalance(result.objects) : null);

  const moonPhase =
    result.moonPhase ??
    (sunObj && moonObj
      ? calculateBirthMoonPhase(sunObj.longitude, moonObj.longitude)
      : null);

  const aspectPatterns =
    result.aspectPatterns ??
    (result.objects ? detectAspectPatterns(result.objects) : []);


  const houseRulers = result.houseRulers ?? [];

  const completeResult: SwissNatalChartResult = {
    ...result,
    elementBalance: elementBalance ?? result.elementBalance,
    moonPhase: moonPhase ?? result.moonPhase,
    aspectPatterns: aspectPatterns ?? result.aspectPatterns,
    houseRulers,
  };

  const synthesis = synthesizeWesternReading(completeResult);
  const parts: string[] = [];

  // Header
  parts.push('# Lá Số Chiêm Tinh Tây Phương (Natal Chart)');

  // 1. Basic Info & Big Three
  const ascAngle = result.angles?.Ascendant;
  const mcAngle = result.angles?.Midheaven;
  const icAngle = result.angles?.['Imum Coeli'];
  const dcAngle = result.angles?.Descendant;

  const linesBasic = ['## Thông Tin Cơ Bản & Trọng Tâm Bản Mệnh'];
  linesBasic.push(`- **Thời gian sinh (UTC)**: ${result.birth.utc} (JD: ${result.birth.julianDayUt.toFixed(4)})`);
  linesBasic.push(
    `- **Tọa độ địa lý**: ${result.birth.latitude.toFixed(4)}°, ${result.birth.longitude.toFixed(4)}° (Múi giờ UTC${result.birth.fixedUtcOffsetHours >= 0 ? '+' : ''}${result.birth.fixedUtcOffsetHours})`,
  );
  linesBasic.push(`- **Hệ thống nhà (House System)**: ${result.birth.houseSystem.toUpperCase()}`);

  if (sunObj && moonObj && ascAngle) {
    linesBasic.push(
      `- **The Big Three (Bộ Ba Cốt Lõi)**: Mặt Trời ${sunObj.signVi} (${formatDegMin(sunObj.degree, sunObj.minute)}, Nhà ${sunObj.house}) · Mặt Trăng ${moonObj.signVi} (${formatDegMin(moonObj.degree, moonObj.minute)}, Nhà ${moonObj.house}) · Cung Mọc ${ascAngle.signVi} (${formatDegMin(ascAngle.degree, ascAngle.minute)})`,
    );
  }

  if (mcAngle) {
    linesBasic.push(`- **Thiên Đỉnh (Midheaven - MC)**: ${mcAngle.signVi} (${formatDegMin(mcAngle.degree, mcAngle.minute)})`);
  }
  if (dcAngle) {
    linesBasic.push(`- **Cung Lặn (Descendant - DC)**: ${dcAngle.signVi} (${formatDegMin(dcAngle.degree, dcAngle.minute)})`);
  }
  if (icAngle) {
    linesBasic.push(`- **Thiên Đáy (Imum Coeli - IC)**: ${icAngle.signVi} (${formatDegMin(icAngle.degree, icAngle.minute)})`);
  }

  // Sect & Moon Phase
  linesBasic.push(
    `- **Phân loại Ngày / Đêm (Chart Sect)**: ${synthesis.sect.isDiurnal ? 'Ban Ngày (Diurnal)' : 'Ban Đêm (Nocturnal)'} - ${synthesis.sect.descriptionVi}`,
  );

  if (moonPhase) {
    linesBasic.push(
      `- **Pha Mặt Trăng lúc sinh**: ${moonPhase.nameVi} (${moonPhase.symbol ?? ''} góc ${moonPhase.phaseAngle?.toFixed(1) ?? '0.0'}°, sáng ${moonPhase.illuminationPercentage?.toFixed(0) ?? '0'}%) - ${moonPhase.personalityTraitsVi || moonPhase.descriptionVi || ''}`,
    );
  }


  if (result.legacyResult?.chartShape) {
    linesBasic.push(
      `- **Hình dáng biểu đồ (Chart Shape)**: ${result.legacyResult.chartShape.shape} (${result.legacyResult.chartShape.reason})`,
    );
  }

  parts.push(linesBasic.join('\n'));


  // 2. Objects & Planetary Dignities Table
  const linesObjects = ['## Bảng Tọa Độ & Phẩm Giá Hành Tinh'];
  linesObjects.push('| Thiên Thể | Ký Hiệu | Cung Hoàng Đạo | Tọa Độ | Nhà | Vận Hành | Phẩm Giá Cốt Lõi |');
  linesObjects.push('|---|:---:|---|---:|:---:|:---:|---|');

  for (const obj of result.objects) {
    const rxText = obj.retrograde ? 'Nghịch hành (Rx)' : 'Thuận hành';
    const dignityText = obj.dignity ? `${obj.dignity.labelVi} (${obj.dignity.symbol})` : '-';
    linesObjects.push(
      `| ${obj.nameVi} | ${obj.symbol} | ${obj.signVi} | ${formatDegMin(obj.degree, obj.minute)} | Nhà ${obj.house} | ${rxText} | ${dignityText} |`,
    );
  }
  parts.push(linesObjects.join('\n'));

  // 3. Elements and Modalities Balance
  const eb = completeResult.elementBalance;
  if (eb) {
    const linesBalance = ['## Cân Bằng Nguyên Tố & Tính Chất'];
    linesBalance.push(
      `- **Nguyên Tố Trội**: **${eb.dominantElementLabelVi}** (${eb.elements[eb.dominantElement]?.percentage.toFixed(0) ?? 0}%) · **Tính Chất Trội**: **${eb.dominantModalityLabelVi}** (${eb.modalities[eb.dominantModality]?.percentage.toFixed(0) ?? 0}%)`,
    );
    linesBalance.push(`- **Phân bổ 4 Nguyên Tố**:`);
    linesBalance.push(
      `  - **Lửa (Fire)**: ${eb.elements.fire.points} điểm (${eb.elements.fire.percentage.toFixed(0)}%) - ${eb.elements.fire.planets.map((p) => p.nameVi).join(', ') || 'Không có'}`,
    );
    linesBalance.push(
      `  - **Đất (Earth)**: ${eb.elements.earth.points} điểm (${eb.elements.earth.percentage.toFixed(0)}%) - ${eb.elements.earth.planets.map((p) => p.nameVi).join(', ') || 'Không có'}`,
    );
    linesBalance.push(
      `  - **Khí (Air)**: ${eb.elements.air.points} điểm (${eb.elements.air.percentage.toFixed(0)}%) - ${eb.elements.air.planets.map((p) => p.nameVi).join(', ') || 'Không có'}`,
    );
    linesBalance.push(
      `  - **Nước (Water)**: ${eb.elements.water.points} điểm (${eb.elements.water.percentage.toFixed(0)}%) - ${eb.elements.water.planets.map((p) => p.nameVi).join(', ') || 'Không có'}`,
    );
    linesBalance.push(`- **Phân bổ 3 Tính Chất**:`);
    linesBalance.push(
      `  - **Thống Lĩnh (Cardinal)**: ${eb.modalities.cardinal.points} điểm (${eb.modalities.cardinal.percentage.toFixed(0)}%)`,
    );
    linesBalance.push(
      `  - **Kiên Định (Fixed)**: ${eb.modalities.fixed.points} điểm (${eb.modalities.fixed.percentage.toFixed(0)}%)`,
    );
    linesBalance.push(
      `  - **Biến Đổi (Mutable)**: ${eb.modalities.mutable.points} điểm (${eb.modalities.mutable.percentage.toFixed(0)}%)`,
    );
    linesBalance.push(`- **Nhận xét tổng hòa**: ${eb.summaryVi}`);
    parts.push(linesBalance.join('\n'));
  }


  // 4. 12 Houses and Rulerships Table
  const linesHouses = ['## Cấu Trúc 12 Nhà Địa Bàn & Chủ Quản'];
  linesHouses.push('| Nhà | Cung Đỉnh Nhà | Tọa Độ Đỉnh | Chủ Tinh Quản Nhà | Vị Trí Chủ Tinh |');
  linesHouses.push('|:---:|---|---:|---|---|');

  for (const house of result.houses) {
    const ruler = houseRulers.find((hr) => hr.houseNumber === house.number);
    const rulerText = ruler ? `${ruler.traditionalRulerVi} ${ruler.traditionalRulerSymbol}` : '-';
    const rulerPos =
      ruler && ruler.rulerHouse
        ? `Ngự tại Nhà ${ruler.rulerHouse} (${ruler.rulerSignVi ?? ''})`
        : '-';
    linesHouses.push(
      `| Nhà ${house.number} | ${house.signVi} | ${formatDegMin(house.degree, house.minute)} | ${rulerText} | ${rulerPos} |`,
    );
  }
  parts.push(linesHouses.join('\n'));

  // 5. Aspects Table
  const linesAspects = ['## Các Góc Chiếu Chính (Major Aspects)'];
  if (!result.aspects || result.aspects.length === 0) {
    linesAspects.push('Không phát hiện góc chiếu chính trong phạm vi orb cho phép.');
  } else {
    linesAspects.push('| Thiên Thể A | Thiên Thể B | Góc Chiếu | Góc Chính Xác | Sai Số Orb | Trạng Thái |');
    linesAspects.push('|---|---|:---:|---:|---:|:---:|');
    for (const aspect of result.aspects) {
      const stateText = aspect.state === 'applying' ? 'Áp sát (Applying)' : aspect.state === 'separating' ? 'Tách rời (Separating)' : '-';
      linesAspects.push(
        `| ${aspect.objectAName} | ${aspect.objectBName} | ${aspect.name} | ${aspect.exactAngle}° | ${aspect.orbDifference.toFixed(1)}° | ${stateText} |`,
      );
    }
  }
  parts.push(linesAspects.join('\n'));

  // 6. Aspect Patterns (Mô Hình Góc Đặc Biệt)
  if (aspectPatterns && aspectPatterns.length > 0) {
    const linesPatterns = ['## Mô Hình Góc Đặc Biệt (Aspect Patterns)'];
    for (const pattern of aspectPatterns) {
      linesPatterns.push(`\n### ${pattern.nameVi} (${pattern.nameEn})`);

      linesPatterns.push(`- **Hành tinh cấu thành**: ${pattern.planets.map((p) => `${p.nameVi} (${p.signVi})`).join(', ')}`);
      linesPatterns.push(`- **Bản chất mô hình**: ${pattern.descriptionVi}`);
      if (pattern.apexPlanet) {
        linesPatterns.push(`- **Đỉnh tiêu điểm (Apex)**: ${pattern.apexPlanet.nameVi} tại Cung ${pattern.apexPlanet.signVi}`);
      }
      if (pattern.resolutionPoint) {
        linesPatterns.push(`- **Điểm giải tỏa căng thẳng**: Cung đối diện ${pattern.resolutionPoint.oppositeSignVi}: ${pattern.resolutionPoint.adviceVi}`);
      }
      if (pattern.personalizedSynthesis) {
        linesPatterns.push(`- **Thử thách cốt lõi**: ${pattern.personalizedSynthesis.coreChallengeVi}`);
        linesPatterns.push(`- **Món quà tiềm năng**: ${pattern.personalizedSynthesis.uniqueGiftVi}`);
        linesPatterns.push(`- **Lời khuyên hành động**: ${pattern.personalizedSynthesis.actionableAdviceVi}`);
      }
    }
    parts.push(linesPatterns.join('\n'));
  }

  // 7. Holistic Synthesis & Actionable Guidance
  const linesSynthesis = ['## Tổng Hợp Luận Giải Toàn Diện'];
  linesSynthesis.push(`- **Luận giải The Big Three**: ${synthesis.bigThreeSynthesisVi}`);
  linesSynthesis.push(`- **Luận giải Chủ Tinh Lá Số (Chart Ruler)**: ${synthesis.chartRulerSynthesisVi}`);
  if (synthesis.dominantPatternsVi.length > 0) {
    linesSynthesis.push(`- **Mô hình hành tinh nổi bật**: ${synthesis.dominantPatternsVi.join('; ')}`);
  }
  if (synthesis.growthTensionsVi.length > 0) {
    linesSynthesis.push(`- **Điểm căng thẳng & Cơ hội chuyển hóa**:`);
    for (const tension of synthesis.growthTensionsVi) {
      linesSynthesis.push(`  - ${tension}`);
    }
  }
  linesSynthesis.push(`- **Lời khuyên chiến lược & Phát triển bản thân**: ${synthesis.actionableGuidanceVi}`);
  parts.push(linesSynthesis.join('\n'));

  // Footer
  parts.push('---');
  parts.push('*Lá số được tính toán chính xác cao bởi Lịch Việt - sử dụng Swiss Ephemeris chuẩn quốc tế.*');

  return parts.join('\n\n');
}

