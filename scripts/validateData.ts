/**
 * Build-time JSON data validation script.
 *
 * Validates all 19 JSON data files against their Zod schemas.
 * Run via: npx ts-node scripts/validateData.ts
 * Or integrate into build: "prebuild": "npx ts-node scripts/validateData.ts"
 *
 * Exit code 0 = all valid, 1 = validation failures found.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ZodSchema, ZodError } from 'zod';

import {
  NapAmDataSchema,
  ThapNhiTrucSchema,
  ThanSatSchema,
  CatThanSchema,
  HungThanSchema,
  DungSuSchema,
  NhiThapBatTuSchema,
  ThoiThanSchema,
  StarWeightSchema,
  ActionWeightSchema,
  NullifyRulesSchema,
  ExtraStarsDataSchema,
  BanhToBachKySchema,
  VietnameseHolidaysSchema,
  VtMappingSchema,
  TrigramsSchema,
  HexagramsSchema,
  NguHanhInteractionSchema,
  NapGiapSchema,
} from '../src/schemas/dataSchemas';

// ── File-to-Schema Mapping ─────────────────────────────────

interface ValidationTarget {
  readonly path: string;
  readonly schema: ZodSchema;
  readonly label: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_ROOT = resolve(__dirname, '..', 'src', 'data');

const TARGETS: readonly ValidationTarget[] = [
  // Phase 1
  { path: `${DATA_ROOT}/phase_1/napAmData.json`, schema: NapAmDataSchema, label: 'Nạp Âm' },
  { path: `${DATA_ROOT}/phase_1/thap_nhi_truc.json`, schema: ThapNhiTrucSchema, label: 'Thập Nhị Trực' },
  { path: `${DATA_ROOT}/phase_1/than_sat.json`, schema: ThanSatSchema, label: 'Thần Sát' },
  { path: `${DATA_ROOT}/phase_1/cat_than.json`, schema: CatThanSchema, label: 'Cát Thần' },
  { path: `${DATA_ROOT}/phase_1/hung_than.json`, schema: HungThanSchema, label: 'Hung Thần' },
  { path: `${DATA_ROOT}/phase_1/dung_su.json`, schema: DungSuSchema, label: 'Dụng Sự' },
  { path: `${DATA_ROOT}/phase_1/nhi_thap_bat_tu.json`, schema: NhiThapBatTuSchema, label: '28 Tú' },
  { path: `${DATA_ROOT}/phase_1/thoi_than.json`, schema: ThoiThanSchema, label: 'Thời Thần' },
  { path: `${DATA_ROOT}/phase_1/starWeight.json`, schema: StarWeightSchema, label: 'Star Weights' },
  { path: `${DATA_ROOT}/phase_1/actionWeight.json`, schema: ActionWeightSchema, label: 'Action Weights' },
  { path: `${DATA_ROOT}/phase_1/nullifyRules.json`, schema: NullifyRulesSchema, label: 'Nullify Rules' },
  { path: `${DATA_ROOT}/phase_1/extraStarsData.json`, schema: ExtraStarsDataSchema, label: 'Extra Stars' },
  { path: `${DATA_ROOT}/phase_1/banh_to_bach_ky.json`, schema: BanhToBachKySchema, label: 'Bành Tổ' },
  { path: `${DATA_ROOT}/phase_1/vietnameseHolidays.json`, schema: VietnameseHolidaysSchema, label: 'Holidays' },
  { path: `${DATA_ROOT}/phase_1/vtMapping.json`, schema: VtMappingSchema, label: 'VT Mapping' },
  // Phase 2
  { path: `${DATA_ROOT}/phase_2/trigrams.json`, schema: TrigramsSchema, label: 'Trigrams' },
  { path: `${DATA_ROOT}/phase_2/hexagrams.json`, schema: HexagramsSchema, label: 'Hexagrams' },
  { path: `${DATA_ROOT}/phase_2/nguHanhInteraction.json`, schema: NguHanhInteractionSchema, label: 'Ngũ Hành' },
  { path: `${DATA_ROOT}/phase_2/napGiap.json`, schema: NapGiapSchema, label: 'Nạp Giáp' },
];

// ── Runner ──────────────────────────────────────────────────

function formatZodError(error: ZodError): string {
  return error.issues.map((issue) => `  → ${issue.path.join('.')} : ${issue.message}`).join('\n');
}

function main(): void {
  console.log('🔍 Validating JSON data files against Zod schemas...\n');

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const target of TARGETS) {
    try {
      const raw = readFileSync(target.path, 'utf-8');
      const data: unknown = JSON.parse(raw);
      target.schema.parse(data);
      console.log(`  ✅ ${target.label}`);
      passed++;
    } catch (err) {
      failed++;
      if (err instanceof ZodError) {
        const detail = formatZodError(err);
        console.log(`  ❌ ${target.label}`);
        console.log(detail);
        failures.push(`${target.label}:\n${detail}`);
      } else if (err instanceof Error) {
        console.log(`  ❌ ${target.label} — ${err.message}`);
        failures.push(`${target.label}: ${err.message}`);
      }
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TARGETS.length} files`);

  if (failed > 0) {
    console.error('\n🚨 Data validation FAILED. Fix the above issues before building.\n');
    process.exit(1);
  }

  console.log('\n✨ All data files are valid!\n');
  process.exit(0);
}

main();
