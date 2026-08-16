/**
 * Tử Vi Phi Tinh Tứ Hóa (Flying Stars) Engine — Lịch Việt v4
 *
 * Implements the Flying Star methodology where each of the 12 palaces
 * acts as an origin to project 4 Transformations (Lộc, Quyền, Khoa, Kỵ)
 * based on its palace Can, detecting Tự Hóa, Phi Nhập, and Phi Xung dynamics.
 */

import type { Can } from '../../types/calendar';
import type {
  TuHoaType,
  TuViChart,
  TuViPalace,
  FlyingTuHoa,
  PalaceFlyingStars,
  FlyingStarSummary,
} from '../../types/tuvi';
import { DOI_CUNG_MAP } from './constants';
import { TU_VI_SCHOOL_PROFILES } from './schoolProfiles';

const TU_HOA_NATURE: Record<TuHoaType, { keyword: string; energy: string; verb: string }> = {
  Lộc: {
    keyword: 'Tài Lộc & Duyên May',
    energy: 'Tình cảm, duyên lành, nguồn thu nhập và cơ hội rộng mở',
    verb: 'mang lại phúc lộc và thiện duyên cho',
  },
  Quyền: {
    keyword: 'Quyền Lực & Nỗ Lực',
    energy: 'Uy quyền, sự chủ động, tranh đấu, chi phối và mở rộng',
    verb: 'thúc đẩy động lực, quyền quyết định và sự chi phối tại',
  },
  Khoa: {
    keyword: 'Danh Tiếng & Cứu Giải',
    energy: 'Học vấn, uy tín, sự quý mến, hòa nhã và giải trừ tai ương',
    verb: 'đem lại danh tiếng, sự bình ổn và khả năng hóa giải cho',
  },
  Kỵ: {
    keyword: 'Ràng Buộc & Trở Ngại',
    energy: 'Tâm tư dồn nén, ràng buộc, mắc nợ, lo âu hoặc biến động',
    verb: 'dồn tâm huyết ràng buộc hoặc gây áp lực/lo toan tại',
  },
};

/**
 * Finds the palace in the chart that contains a given star.
 */
function findPalaceWithStar(chart: TuViChart, starName: string): TuViPalace | undefined {
  return chart.palaces.find(
    (p) =>
      p.chinhTinh.some((s) => s.name === starName) ||
      p.phuTinh.some((s) => s.name === starName) ||
      p.satTinh.some((s) => s.name === starName),
  );
}

/**
 * Calculates all Flying Stars (Tứ Hóa Phi Tinh) for the entire 12-palace chart.
 */
export function calculateFlyingStars(chart: TuViChart): FlyingStarSummary {
  const schoolProfile = TU_VI_SCHOOL_PROFILES['phi-tinh'] ?? TU_VI_SCHOOL_PROFILES['thien-luong'];
  const tuHoaTable = schoolProfile.tuHoaTable;

  const palacesFlyingMap: PalaceFlyingStars[] = chart.palaces.map((palace) => ({
    palaceId: palace.id,
    palaceName: palace.name,
    can: palace.can as Can,
    chi: palace.chi,
    flyingHuas: {} as Record<TuHoaType, FlyingTuHoa>,
    tuHuas: [],
    receivedHuas: [],
    xungHuas: [],
  }));

  const allTuHuas: FlyingTuHoa[] = [];

  // 1. Calculate Flying Tứ Hóa from each palace
  chart.palaces.forEach((sourcePalace) => {
    const sourceCan = sourcePalace.can as Can;
    const huaMapping = tuHoaTable[sourceCan] ?? tuHoaTable['Giáp'];
    const palaceEntry = palacesFlyingMap[sourcePalace.id];

    const types: TuHoaType[] = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'];

    types.forEach((type) => {
      const starName = huaMapping[type];
      const targetPalace = findPalaceWithStar(chart, starName) ?? sourcePalace;
      const isTuHoa = targetPalace.id === sourcePalace.id;

      let descriptionVi = '';
      if (isTuHoa) {
        const doiCungId = DOI_CUNG_MAP[sourcePalace.id];
        const doiCungName = doiCungId !== undefined ? chart.palaces[doiCungId]?.name : 'Đối Cung';

        if (type === 'Lộc') {
          descriptionVi = `Tự Hóa Lộc tại Cung ${sourcePalace.name} (${starName}): Duyên lành và tài khí tự sinh tự phát. Đương số hào sảng, cởi mở, không so đo tính toán; tuy nhiên lộc đến nhanh thì cũng dễ tiêu tán, cần chủ động tích lũy và giữ vững kỷ luật để bảo toàn thành quả.`;
        } else if (type === 'Quyền') {
          descriptionVi = `Tự Hóa Quyền tại Cung ${sourcePalace.name} (${starName}): Năng lực hành động và lòng tự tôn bộc phát mạnh mẽ. Đương số giàu ý chí, dám gánh vác, thích tự chủ nhưng dễ nóng vội hoặc độc đoán nhất thời; cần rèn luyện tính kiên trì bền bỉ.`;
        } else if (type === 'Khoa') {
          descriptionVi = `Tự Hóa Khoa tại Cung ${sourcePalace.name} (${starName}): Khả năng tự điều hòa và giải trừ khó khăn nội tại. Đương số coi trọng danh dự, phong thái nho nhã, dễ được người quý mến nhưng đôi khi thiếu quyết đoán hoặc quá chú trọng thể diện bên ngoài.`;
        } else {
          descriptionVi = `Tự Hóa Kỵ tại Cung ${sourcePalace.name} (${starName}): Trọng tâm dồn nén tâm tư và áp lực nội tâm. Dễ tự trách, đa nghi hoặc chịu thiệt thòi tại phương diện này; xung lực xả thẳng sang Cung ${doiCungName} đòi hỏi đương số phải học cách buông bỏ và cân bằng cảm xúc.`;
        }
      } else {
        descriptionVi = `Cung ${sourcePalace.name} Can ${sourceCan} phi Hóa ${type} (${starName}) nhập Cung ${targetPalace.name}: ${sourcePalace.name} ${TU_HOA_NATURE[type].verb} ${targetPalace.name}.`;
      }

      const flyingHua: FlyingTuHoa = {
        type,
        starName,
        sourcePalaceId: sourcePalace.id,
        sourcePalaceName: sourcePalace.name,
        sourceCan,
        targetPalaceId: targetPalace.id,
        targetPalaceName: targetPalace.name,
        isTuHoa,
        isXung: false,
        descriptionVi,
      };

      palaceEntry.flyingHuas[type] = flyingHua;
      allTuHuas.push(flyingHua);

      if (isTuHoa) {
        palaceEntry.tuHuas.push(flyingHua);
      }

      // Add to target palace's received list
      palacesFlyingMap[targetPalace.id].receivedHuas.push(flyingHua);

      // If Hóa Kỵ, check opposite palace for Kỵ Xung
      if (type === 'Kỵ') {
        const oppositeTargetId = DOI_CUNG_MAP[targetPalace.id];
        if (oppositeTargetId !== undefined) {
          const oppositePalace = chart.palaces[oppositeTargetId];
          const xungHua: FlyingTuHoa = {
            ...flyingHua,
            isXung: true,
            targetPalaceId: oppositeTargetId,
            targetPalaceName: oppositePalace.name,
            descriptionVi: `Cung ${sourcePalace.name} phi Hóa Kỵ nhập ${targetPalace.name} -> Trực xung Cung ${oppositePalace.name} (${oppositePalace.chi}): Gây biến động, áp lực và thử thách đối chiếu.`,
          };
          palacesFlyingMap[oppositeTargetId].xungHuas.push(xungHua);
        }
      }
    });
  });

  // 2. Extract Key Interactions
  const menhPalace = chart.palaces.find((p) => p.isMenh) ?? chart.palaces[0];
  const menhEntry = palacesFlyingMap[menhPalace.id];

  const menhFlying = Object.values(menhEntry.flyingHuas);
  const menhReceived = menhEntry.receivedHuas.filter((h) => h.sourcePalaceId !== menhPalace.id);

  const quanPalace = chart.palaces.find((p) => p.name === 'Quan Lộc');
  const taiPalace = chart.palaces.find((p) => p.name === 'Tài Bạch');
  const phuThePalace = chart.palaces.find((p) => p.name === 'Phu Thê');

  const taiQuanFlying: FlyingTuHoa[] = [];
  if (taiPalace) taiQuanFlying.push(...Object.values(palacesFlyingMap[taiPalace.id].flyingHuas));
  if (quanPalace) taiQuanFlying.push(...Object.values(palacesFlyingMap[quanPalace.id].flyingHuas));

  const phuTheFlying: FlyingTuHoa[] = phuThePalace ? Object.values(palacesFlyingMap[phuThePalace.id].flyingHuas) : [];

  // 3. Filter only actual Tự Hóa occurrences (not all 48 flying stars)
  const actualTuHuas = allTuHuas.filter((h) => h.isTuHoa);
  const tuHoaCount = actualTuHuas.length;

  // 4. Multi-angle Overall Synthesis
  const menhLoc = menhFlying.find((h) => h.type === 'Lộc');
  const menhQuyen = menhFlying.find((h) => h.type === 'Quyền');
  const menhKhoa = menhFlying.find((h) => h.type === 'Khoa');
  const menhKy = menhFlying.find((h) => h.type === 'Kỵ');

  const synthesisItems: Array<{ title: string; content: string }> = [];
  const synthesisParts: string[] = [];

  const introText = `Phái Phi Tinh Tứ Hóa xác định toàn diện mạng lưới tương tác giữa 12 cung vị (toàn bàn có ${tuHoaCount} vị trí Tự Hóa nội cung).`;
  synthesisParts.push(introText);
  synthesisItems.push({
    title: 'Tổng quan tương tác toàn bàn',
    content: introText,
  });

  // Mệnh xuất tứ hóa
  if (menhLoc) {
    const title = 'Tâm thế hướng ngoại & thiện duyên';
    const content = `Mệnh phi Hóa Lộc nhập Cung ${menhLoc.targetPalaceName} (${menhLoc.starName}) biểu thị đương số luôn dành tình cảm, sự kỳ vọng và nguồn lực tích cực vào ${menhLoc.targetPalaceName.toLowerCase()}.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }
  if (menhQuyen) {
    const title = 'Khát vọng chi phối';
    const content = `Mệnh phi Hóa Quyền nhập Cung ${menhQuyen.targetPalaceName} (${menhQuyen.starName}) thể hiện ý chí muốn khẳng định tầm ảnh hưởng, sự quyết đoán và chủ động dẫn dắt tại ${menhQuyen.targetPalaceName.toLowerCase()}.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }
  if (menhKhoa) {
    const title = 'Cầu thị & thanh danh';
    const content = `Mệnh phi Hóa Khoa nhập Cung ${menhKhoa.targetPalaceName} (${menhKhoa.starName}) cho thấy phong thái hòa nhã, chú trọng uy tín và tìm kiếm sự thấu hiểu từ ${menhKhoa.targetPalaceName.toLowerCase()}.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }
  if (menhKy) {
    const title = 'Trọng tâm ràng buộc & duyên nợ';
    const content = `Mệnh phi Hóa Kỵ nhập Cung ${menhKy.targetPalaceName} (${menhKy.starName}) thể hiện mối bận tâm sâu sắc, trách nhiệm và tâm tư cống hiến lớn nhất gắn liền với ${menhKy.targetPalaceName.toLowerCase()}.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }

  // Cung phi nhập Mệnh
  const receivedLoc = menhReceived.filter((h) => h.type === 'Lộc');
  const receivedKy = menhReceived.filter((h) => h.type === 'Kỵ');
  if (receivedLoc.length > 0) {
    const locNames = receivedLoc.map((h) => h.sourcePalaceName).join(', ');
    const title = 'Nguồn trợ lực';
    const content = `Cung ${locNames} phi Hóa Lộc nhập Mệnh mang lại may mắn, quý nhân phù trợ và thiện cảm tự nhiên.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }
  if (receivedKy.length > 0) {
    const kyNames = receivedKy.map((h) => h.sourcePalaceName).join(', ');
    const title = 'Thử thách & áp lực';
    const content = `Cung ${kyNames} phi Hóa Kỵ nhập Mệnh tạo nên những ràng buộc, trách nhiệm hoặc áp lực mà đương số cần chủ động hóa giải.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }

  // Kỵ Xung đối chiếu trọng yếu
  const allXungs = palacesFlyingMap.flatMap((p) => p.xungHuas);
  if (allXungs.length > 0) {
    const xungUnique = Array.from(
      new Set(allXungs.map((x) => `trục ${x.sourcePalaceName} → xung ${x.targetPalaceName}`)),
    );
    const title = 'Cảnh báo Kỵ Xung';
    const content = `Cần lưu tâm ${xungUnique.slice(0, 3).join(', ')} để phòng ngừa biến động.`;
    synthesisParts.push(`${title}: ${content}`);
    synthesisItems.push({ title, content });
  }

  const overallSynthesisVi = synthesisParts.join('\n\n');

  return {
    palaces: palacesFlyingMap,
    tuHuaList: actualTuHuas,
    keyInteractions: {
      menhFlying,
      menhReceived,
      taiQuanFlying,
      phuTheFlying,
    },
    overallSynthesisVi,
    synthesisItems,
  };
}
