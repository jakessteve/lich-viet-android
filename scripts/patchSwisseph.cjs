const fs = require('node:fs');
const path = require('node:path');

const PATCH_MARKER = 'globalThis.exports = globalThis.exports || {};';

const PATCHED_SIGNATURES = [
  PATCH_MARKER,
  'calendarType = CalendarType.Gregorian',
  'return new DateTimeImpl(year, month, day, hour, calendarType);',
  'calculatePosition(julianDay, body, flags = CommonCalculationFlags.DefaultMoshier)',
  'const normalizedFlags = normalizeFlags(flags);',
  'findNextLunarEclipse(startJulianDay, flags = CalculationFlag.MoshierEphemeris',
  'findNextSolarEclipse(startJulianDay, flags = CalculationFlag.MoshierEphemeris',
  'const normalizedEclipseType = normalizeEclipseTypes(eclipseType);',
  'return new LunarEclipseImpl(retflag,',
  'return new SolarEclipseImpl(retflag,',
  'calculateHouses(julianDay, latitude, longitude, houseSystem = HouseSystem.Placidus)',
  'ascendant: ascmc[HousePoint.Ascendant]',
  'mc: ascmc[HousePoint.MC]',
  'armc: ascmc[HousePoint.ARMC]',
  'vertex: ascmc[HousePoint.Vertex]',
  'equatorialAscendant: ascmc[HousePoint.EquatorialAscendant]',
  'coAscendant1: ascmc[HousePoint.CoAscendant1]',
  'coAscendant2: ascmc[HousePoint.CoAscendant2]',
  'polarAscendant: ascmc[HousePoint.PolarAscendant]',
  'flags: retflag',
];

const LITERAL_REPLACEMENTS = [
  ['calendarType = (void 0).Gregorian', 'calendarType = CalendarType.Gregorian'],
  ['return new (void 0)(year, month, day, hour, calendarType);', 'return new DateTimeImpl(year, month, day, hour, calendarType);'],
  ['calculatePosition(julianDay, body, flags = (void 0).DefaultMoshier)', 'calculatePosition(julianDay, body, flags = CommonCalculationFlags.DefaultMoshier)'],
  ['const normalizedFlags = (void 0)(flags);', 'const normalizedFlags = normalizeFlags(flags);'],
  ['findNextLunarEclipse(startJulianDay, flags = (void 0).MoshierEphemeris, eclipseType = 0, backward = false)', 'findNextLunarEclipse(startJulianDay, flags = CalculationFlag.MoshierEphemeris, eclipseType = 0, backward = false)'],
  ['const normalizedEclipseType = (void 0)(eclipseType);', 'const normalizedEclipseType = normalizeEclipseTypes(eclipseType);'],
  ['findNextSolarEclipse(startJulianDay, flags = (void 0).MoshierEphemeris, eclipseType = 0, backward = false)', 'findNextSolarEclipse(startJulianDay, flags = CalculationFlag.MoshierEphemeris, eclipseType = 0, backward = false)'],
  ['calculateHouses(julianDay, latitude, longitude, houseSystem = (void 0).Placidus)', 'calculateHouses(julianDay, latitude, longitude, houseSystem = HouseSystem.Placidus)'],
  ['ascendant: ascmc[(void 0).Ascendant],', 'ascendant: ascmc[HousePoint.Ascendant],'],
  ['mc: ascmc[(void 0).MC],', 'mc: ascmc[HousePoint.MC],'],
  ['armc: ascmc[(void 0).ARMC],', 'armc: ascmc[HousePoint.ARMC],'],
  ['vertex: ascmc[(void 0).Vertex],', 'vertex: ascmc[HousePoint.Vertex],'],
  ['equatorialAscendant: ascmc[(void 0).EquatorialAscendant],', 'equatorialAscendant: ascmc[HousePoint.EquatorialAscendant],'],
  ['coAscendant1: ascmc[(void 0).CoAscendant1],', 'coAscendant1: ascmc[HousePoint.CoAscendant1],'],
  ['coAscendant2: ascmc[(void 0).CoAscendant2],', 'coAscendant2: ascmc[HousePoint.CoAscendant2],'],
  ['polarAscendant: ascmc[(void 0).PolarAscendant],', 'polarAscendant: ascmc[HousePoint.PolarAscendant],'],
  ['enums_js_13.CalendarType', 'CalendarType'],
  ['implementations_js_1.DateTimeImpl', 'DateTimeImpl'],
  ['enums_js_13.CommonCalculationFlags', 'CommonCalculationFlags'],
  ['flags_js_1.normalizeFlags', 'normalizeFlags'],
  ['enums_js_13.CalculationFlag', 'CalculationFlag'],
  ['flags_js_1.normalizeEclipseTypes', 'normalizeEclipseTypes'],
  ['implementations_js_1.LunarEclipseImpl', 'LunarEclipseImpl'],
  ['implementations_js_1.SolarEclipseImpl', 'SolarEclipseImpl'],
  ['enums_js_13.HouseSystem', 'HouseSystem'],
  ['enums_js_13.HousePoint', 'HousePoint'],
];

const ECLIPSE_CONSTRUCTOR_PATTERN = /return new \(void 0\)\(\s*retflag,\s*tret\[0\],\s*tret\[1\],\s*tret\[2\],\s*tret\[3\],\s*tret\[4\],\s*tret\[5\],\s*tret\[6\]\s*\);/;

function validatePatchedBundle(content) {
  return PATCHED_SIGNATURES.filter((signature) => !content.includes(signature));
}

function patchBundleContent(source) {
  const missingBefore = validatePatchedBundle(source);
  if (missingBefore.length === 0) return source;
  if (source.includes(PATCH_MARKER)) {
    throw new Error(`Partially patched @swisseph/browser bundle; missing signatures: ${missingBefore.join(', ')}`);
  }

  let content = source;
  for (const [target, replacement] of LITERAL_REPLACEMENTS) {
    content = content.replaceAll(target, replacement);
  }
  content = content.replace(
    ECLIPSE_CONSTRUCTOR_PATTERN,
    'return new LunarEclipseImpl(retflag, tret[0], tret[1], tret[2], tret[3], tret[4], tret[5], tret[6]);',
  );
  content = content.replace(
    ECLIPSE_CONSTRUCTOR_PATTERN,
    'return new SolarEclipseImpl(retflag, tret[0], tret[1], tret[2], tret[3], tret[4], tret[5], tret[6]);',
  );
  content = `${PATCH_MARKER}\n${content}`;

  const missingAfter = validatePatchedBundle(content);
  if (missingAfter.length > 0) {
    throw new Error(`Unsupported or partial @swisseph/browser bundle; missing patched signatures: ${missingAfter.join(', ')}`);
  }
  return content;
}

function main() {
  const filePath = path.join(
    __dirname,
    '..',
    'node_modules',
    '@swisseph',
    'browser',
    'dist',
    'swisseph-browser.js',
  );

  if (!fs.existsSync(filePath)) {
    console.warn(`Swiss Ephemeris browser bundle not found at ${filePath}; skipping patch.`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const patched = patchBundleContent(content);
  if (patched === content) {
    console.log('@swisseph/browser bundle is already fully patched.');
    return;
  }
  fs.writeFileSync(filePath, patched, 'utf8');
  console.log(`Patched @swisseph/browser bundle and verified ${PATCHED_SIGNATURES.length} signatures.`);
}

module.exports = {
  PATCHED_SIGNATURES,
  patchBundleContent,
  validatePatchedBundle,
};

if (require.main === module) main();
