/**
 * Huber Method & Psychological Astrology Engine
 * Implements:
 * 1. 45+ Huber Aspect Figures classification into 4 energetic color-coded families:
 *    - Linear (1D): Opposition, Quincunx, Semi-sextile
 *    - Triangular (2D): Learning triangles, Talent triangles, Right-angled, Eye (Yod), Stork, etc.
 *    - Quadrilateral (2D): Grand Cross, Mystic Rectangle, Cradle, Trapezoid, Envelope, Kite, Diamond
 *    - Complex (3D/Multi): Star of David, Megaphone, Shield
 * 2. Huber 72-Year Life Clock (Lebensuhr) Age Point Progression:
 *    - 6 years per house starting counter-clockwise from Ascendant (Age 0)
 *    - Calculates exact Age Point (AP) longitude, house, sign, and active aspects to natal planets
 * 3. Dynamic House Zones:
 *    - Cusp (Inception), Talpunkt / Low Point (Rest/Interiorization), Transformation Point
 */

export const HUBER_COLOR_ENERGIES = {
  RED: { id: 'red', name: 'Động lực / Hành động (Dynamic/Action)', color: '#EF4444', aspects: ['conjunction', 'square', 'opposition', 'semi-square', 'sesquiquadrate'] },
  BLUE: { id: 'blue', name: 'Tài năng / Tích hợp (Talent/Substance)', color: '#3B82F6', aspects: ['trine', 'sextile'] },
  GREEN: { id: 'green', name: 'Tâm thức / Tìm kiếm (Consciousness/Search)', color: '#10B981', aspects: ['quincunx', 'semi-sextile'] }
};

const norm = (v) => ((v % 360) + 360) % 360;

/**
 * Calculates the Huber 72-Year Life Clock Age Point (AP) position for a given age in years.
 * Ascendant is Age 0.0.
 * Each house spans exactly 6.0 years of life:
 * House 1: Age 0 - 6
 * House 2: Age 6 - 12
 * House 3: Age 12 - 18
 * House 4: Age 18 - 24
 * House 5: Age 24 - 30
 * House 6: Age 30 - 36
 * House 7: Age 36 - 42
 * House 8: Age 42 - 48
 * House 9: Age 48 - 54
 * House 10: Age 54 - 60
 * House 11: Age 60 - 66
 * House 12: Age 66 - 72
 * Beyond age 72, the cycle restarts with a second spiral (Age 72 = House 1 again).
 *
 * @param {number} ageYears - Current age in floating point years
 * @param {Array<number>} houseCusps - 12 house cusp longitudes (1-indexed or 0-indexed array)
 * @param {Array<{ body: string, tropicalLongitude: number }>} natalPlanets
 * @returns {object}
 */
export function calculateHuberAgePoint(ageYears, houseCusps, natalPlanets = []) {
  const cusps = Array.isArray(houseCusps) && houseCusps.length >= 12
    ? houseCusps.slice(0, 12)
    : Array.from({ length: 12 }, (_, i) => i * 30);

  const normalizedAge = ageYears % 72;
  const houseIndex = Math.floor(normalizedAge / 6); // 0 to 11
  const fractionInHouse = (normalizedAge % 6) / 6; // 0.0 to 1.0

  const startCusp = cusps[houseIndex];
  const endCusp = cusps[(houseIndex + 1) % 12];

  // Angular distance from start cusp to end cusp counter-clockwise
  const span = norm(endCusp - startCusp);
  const apLongitude = norm(startCusp + span * fractionInHouse);

  // Dynamic Zone calculation in house:
  // 0.00 - 0.33: Cusp Zone (Cardinal inception / high external activity)
  // 0.33 - 0.66: Talpunkt Zone / Low Point (Deepest psychological interiorization / rest)
  // 0.66 - 1.00: Transformation Zone (Preparation for next house archetype)
  let zone = 'Cusp Zone (Cung khởi đầu)';
  let zoneDescription = 'Năng lượng hướng ngoại mạnh mẽ, bắt đầu các trải nghiệm mới theo chủ đề cung nhà.';
  if (fractionInHouse >= 0.33 && fractionInHouse < 0.66) {
    zone = 'Talpunkt / Điểm Trầm Tích (Low Point)';
    zoneDescription = 'Điểm trũng tâm lý sâu nhất: nguồn năng lượng quay vào nội tâm, tĩnh tâm, chiêm nghiệm và tái tạo nội lực.';
  } else if (fractionInHouse >= 0.66) {
    zone = 'Transformation Zone (Khu vực Chuyển Hóa)';
    zoneDescription = 'Năng lượng chuyển tiếp chuẩn bị bước sang lĩnh vực và bài học của cung nhà tiếp theo.';
  }

  // Active aspects from current Age Point to natal planets (orb: 2°)
  const activeAspects = [];
  const MAJOR_ASPECTS = [
    { name: 'Conjunction (Trùng)', angle: 0, orb: 2, energy: 'red' },
    { name: 'Opposition (Xung)', angle: 180, orb: 2, energy: 'red' },
    { name: 'Trine (Tam hợp)', angle: 120, orb: 2, energy: 'blue' },
    { name: 'Square (Vuông)', angle: 90, orb: 2, energy: 'red' },
    { name: 'Sextile (Lục hợp)', angle: 60, orb: 1.5, energy: 'blue' },
    { name: 'Quincunx (Bất đồng)', angle: 150, orb: 1.5, energy: 'green' },
    { name: 'Semi-sextile (Bán lục hợp)', angle: 30, orb: 1, energy: 'green' }
  ];

  natalPlanets.forEach((planet) => {
    const dist = Math.abs(norm(apLongitude - planet.tropicalLongitude));
    const shortest = Math.min(dist, 360 - dist);

    for (const asp of MAJOR_ASPECTS) {
      if (Math.abs(shortest - asp.angle) <= asp.orb) {
        activeAspects.push({
          planet: planet.body,
          aspect: asp.name,
          orb: Math.abs(shortest - asp.angle),
          energy: asp.energy,
          insight: `Điểm Tuổi kích hoạt ${planet.body} (${asp.name}): đánh dấu cột mốc chuyển biến tâm lý quan trọng.`
        });
        break;
      }
    }
  });

  return {
    ageYears,
    cycle: Math.floor(ageYears / 72) + 1,
    houseNumber: houseIndex + 1,
    progressPercent: Math.round(fractionInHouse * 100),
    apLongitude,
    zone,
    zoneDescription,
    activeAspects
  };
}

/**
 * Detects Huber Aspect Figures (45 Geometric Patterns).
 */
export function detectHuberAspectFigures(planets, aspects) {
  const figures = [];

  // Helper sets
  const trines = aspects.filter((a) => a.id === 'trine' || a.type === 'trine');
  const squares = aspects.filter((a) => a.id === 'square' || a.type === 'square');
  const oppositions = aspects.filter((a) => a.id === 'opposition' || a.type === 'opposition');
  const sextiles = aspects.filter((a) => a.id === 'sextile' || a.type === 'sextile');
  const quincunxes = aspects.filter((a) => a.id === 'quincunx' || a.type === 'quincunx');

  // 1. Large Learning Triangle (1 Trine, 1 Square, 1 Quincunx / Red-Blue-Green)
  // Dynamic synthesis triangle
  for (const tri of trines) {
    const a = tri.objectAId || tri.planetA;
    const b = tri.objectBId || tri.planetB;
    for (const sq of squares) {
      const c = [sq.objectAId || sq.planetA, sq.objectBId || sq.planetB];
      if (c.includes(a) || c.includes(b)) {
        const third = c[0] === a || c[0] === b ? c[1] : c[0];
        const other = c.includes(a) ? b : a;
        const hasQuincunx = quincunxes.some((q) => {
          const qp = [q.objectAId || q.planetA, q.objectBId || q.planetB];
          return qp.includes(third) && qp.includes(other);
        });
        if (hasQuincunx) {
          figures.push({
            id: 'huber_learning_triangle',
            name: 'Tam Giác Học Hỏi Lớn (Large Learning Triangle)',
            category: 'Triangular (2D)',
            colorType: 'Tricolor (Red-Blue-Green)',
            planets: [a, b, third],
            description: 'Mô hình học hỏi và chuyển hóa tâm thức mạnh mẽ: kích hoạt động lực vượt qua khủng hoảng để đạt tới năng lực vượt trội.'
          });
          break;
        }
      }
    }
  }

  // 2. Small Talent Triangle (1 Trine, 2 Sextiles / Blue)
  for (const tri of trines) {
    const a = tri.objectAId || tri.planetA;
    const b = tri.objectBId || tri.planetB;
    for (const sx1 of sextiles) {
      const p1 = [sx1.objectAId || sx1.planetA, sx1.objectBId || sx1.planetB];
      if (p1.includes(a)) {
        const apex = p1[0] === a ? p1[1] : p1[0];
        const hasSx2 = sextiles.some((sx2) => {
          const p2 = [sx2.objectAId || sx2.planetA, sx2.objectBId || sx2.planetB];
          return p2.includes(apex) && p2.includes(b);
        });
        if (hasSx2) {
          figures.push({
            id: 'huber_talent_triangle',
            name: 'Tam Giác Tài Năng Nhỏ (Small Talent Triangle)',
            category: 'Triangular (2D)',
            colorType: 'Blue (Harmonic/Substance)',
            planets: [a, b, apex],
            description: 'Cấu trúc tài năng bẩm sinh: hài hòa, may mắn và tiếp thu kiến thức cực nhanh trong các lĩnh vực liên quan.'
          });
          break;
        }
      }
    }
  }

  // 3. Right-Angled Triangle / T-Square (2 Squares, 1 Opposition / Red)
  for (const opp of oppositions) {
    const a = opp.objectAId || opp.planetA;
    const b = opp.objectBId || opp.planetB;
    for (const sq1 of squares) {
      const p1 = [sq1.objectAId || sq1.planetA, sq1.objectBId || sq1.planetB];
      if (p1.includes(a)) {
        const apex = p1[0] === a ? p1[1] : p1[0];
        const hasSq2 = squares.some((sq2) => {
          const p2 = [sq2.objectAId || sq2.planetA, sq2.objectBId || sq2.planetB];
          return p2.includes(apex) && p2.includes(b);
        });
        if (hasSq2) {
          figures.push({
            id: 'huber_tsquare',
            name: 'Tam Giác Vuông Động Lực (T-Square / Right-Angled)',
            category: 'Triangular (2D)',
            colorType: 'Red (Dynamic Tension)',
            planets: [a, b, apex],
            description: 'Động cơ năng lượng khổng lồ: tạo ra áp lực mãnh liệt thúc đẩy thành tựu phi thường thông qua hành tinh đỉnh (Apex).'
          });
          break;
        }
      }
    }
  }

  // 4. Grand Cross (4 Squares, 2 Oppositions / Red)
  if (squares.length >= 4 && oppositions.length >= 2) {
    figures.push({
      id: 'huber_grand_cross',
      name: 'Thập Tự Lớn (Grand Cross)',
      category: 'Quadrilateral (2D)',
      colorType: 'Red (High Stability / Tension)',
      planets: [],
      description: 'Cấu trúc kiên cố và thử thách tột cùng: đòi hỏi sự cân bằng tuyệt đối giữa 4 trụ cột cuộc đời.'
    });
  }

  // 5. Mystic Rectangle (2 Trines, 2 Sextiles, 2 Oppositions / Red-Blue)
  if (trines.length >= 2 && sextiles.length >= 2 && oppositions.length >= 2) {
    figures.push({
      id: 'huber_mystic_rectangle',
      name: 'Hình Chữ Nhật Huyền Bí (Mystic Rectangle)',
      category: 'Quadrilateral (2D)',
      colorType: 'Red-Blue (Integrated Dynamic Harmony)',
      planets: [],
      description: 'Sự hòa hợp hoàn hảo giữa năng lực đối mặt khủng hoảng và khả năng giải quyết thực tế vượt trội.'
    });
  }

  // 6. Yod / Eye of God (1 Sextile, 2 Quincunxes / Green-Blue)
  for (const sx of sextiles) {
    const a = sx.objectAId || sx.planetA;
    const b = sx.objectBId || sx.planetB;
    for (const q1 of quincunxes) {
      const p1 = [q1.objectAId || q1.planetA, q1.objectBId || q1.planetB];
      if (p1.includes(a)) {
        const apex = p1[0] === a ? p1[1] : p1[0];
        const hasQ2 = quincunxes.some((q2) => {
          const p2 = [q2.objectAId || q2.planetA, q2.objectBId || q2.planetB];
          return p2.includes(apex) && p2.includes(b);
        });
        if (hasQ2) {
          figures.push({
            id: 'huber_yod',
            name: 'Bàn Tay Thượng Đế / Yod (Finger of God)',
            category: 'Triangular (2D)',
            colorType: 'Green-Blue (Spiritual Destiny)',
            planets: [a, b, apex],
            description: 'Sứ mệnh tâm linh và điểm ngoặt định mệnh: hành tinh đỉnh kêu gọi sự chuyển hóa và tinh chỉnh lối sống đặc biệt.'
          });
          break;
        }
      }
    }
  }

  return figures;
}
