import type { SwissNatalChartResult } from './swissNatalChart';

function value(value: number | null, digits = 6): string {
  return value === null ? '—' : value.toFixed(digits);
}

export function formatWesternNatalAsMarkdown(result: SwissNatalChartResult): string {
  const lines = [
    '# Lá Số Chiêm Tinh Tây Phương',
    '',
    '## Metadata kỹ thuật',
    '',
    `- UTC: ${result.birth.utc}`,
    `- JD UT: ${result.birth.julianDayUt}`,
    `- Tọa độ: ${result.birth.latitude}, ${result.birth.longitude}`,
    `- Fixed UTC offset: ${result.birth.fixedUtcOffsetHours}`,
    `- House system: ${result.birth.houseSystem}`,
    `- Engine: ${result.metadata.engine} ${result.metadata.version}`,
    `- Ephemeris: ${result.metadata.ephemeris}`,
    `- Requested flags: ${result.metadata.requestedFlags}; equatorial: ${result.metadata.requestedEquatorialFlags}`,
    `- Policies: ${result.metadata.objectPolicyVersion}; ${result.metadata.aspectPolicyVersion}; ${result.metadata.timePolicy}`,
    `- PoF altitude: ${result.metadata.partOfFortuneAltitudePolicy} (${result.metadata.partOfFortuneSolarAltitudeDeg.toFixed(6)}°)`,
    '',
    '## 20 đối tượng chuẩn hóa',
    '',
    '| ID | Tên | Kinh độ | Cung | Độ-phút | Nhà | Tốc độ lon/lat/dist | Rx | Vĩ độ | Khoảng cách | RA | Declination | Flags ecl/eq |',
    '|---|---|---:|---|---:|---:|---:|:---:|---:|---:|---:|---:|---:|',
  ];
  for (const object of result.objects) {
    const eclipticFlags = result.metadata.returnedFlags[object.id] ?? '—';
    const equatorialFlags = result.metadata.returnedEquatorialFlags[object.id] ?? '—';
    lines.push(
      `| \`${object.id}\` | ${object.nameVi} | ${object.longitude.toFixed(6)} | ${object.signVi} | ${object.degree}°${object.minute.toString().padStart(2, '0')}′ | ${object.house} | ${value(object.speed)} / ${value(object.latitudeSpeed)} / ${value(object.distanceSpeed)} | ${object.retrograde === null ? '—' : object.retrograde ? 'Rx' : ''} | ${object.latitude.toFixed(6)} | ${value(object.distance)} | ${value(object.rightAscension)} | ${value(object.declination)} | ${eclipticFlags} / ${equatorialFlags} |`,
    );
  }
  lines.push('', '## 12 nhà', '', '| Nhà | Kinh độ | Cung | Độ-phút |', '|---:|---:|---|---:|');
  for (const house of result.houses) {
    lines.push(
      `| Nhà ${house.number} | ${house.longitude.toFixed(6)} | ${house.signVi} | ${house.degree}°${house.minute.toString().padStart(2, '0')}′ |`,
    );
  }
  lines.push('', '## Bốn góc chính', '', '| ID | Góc | Kinh độ | Cung | Độ-phút |', '|---|---|---:|---|---:|');
  for (const angle of Object.values(result.angles)) {
    lines.push(
      `| \`${angle.id}\` | ${angle.nameVi} | ${angle.longitude.toFixed(6)} | ${angle.signVi} | ${angle.degree}°${angle.minute.toString().padStart(2, '0')}′ |`,
    );
  }
  lines.push(
    '',
    '## Góc chiếu',
    '',
    '| Loại | A | B | Separation | Exact | Allowed orb | Actual orb | State | Strength | Style | Layer |',
    '|---|---|---|---:|---:|---:|---:|---|---:|---|---:|',
  );
  for (const aspect of result.aspects) {
    lines.push(
      `| ${aspect.name} | \`${aspect.objectAId}\` | \`${aspect.objectBId}\` | ${aspect.separation.toFixed(6)} | ${aspect.exactAngle} | ${aspect.allowedOrb} | ${aspect.orbDifference.toFixed(6)} | ${aspect.state} | ${aspect.strength.toFixed(6)} | ${aspect.color}; ${aspect.opacity}; ${aspect.width}; ${aspect.dashPattern} | ${aspect.layer} |`,
    );
  }
  lines.push('', '---', '*Nguồn tính toán: bundled Swiss Ephemeris files; normalized Western natal contract.*');
  return lines.join('\n');
}
