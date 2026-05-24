import {
  GIEOQUE_SOURCE_REFS,
  getHexagram,
  getTrigramByLines,
  HEXAGRAMS,
  TRIGRAMS,
  type GieoQueHexagram,
  type GieoQueLineValue,
  type GieoQueTrigram,
  type TrigramElement,
} from '@/data/gieoque';
import type { SourceRef } from '@/data/sources';

export type GieoQueMethod = 'time' | 'number';

export type GieoQueWarning = {
  code: string;
  message: string;
};

export type GieoQueInput = {
  method: GieoQueMethod;
  question?: string;
  castDate: Date;
  castTime?: string;
  numbers?: [number, number];
};

export type GieoQueHaoDetail = {
  position: number;
  name: string;
  isYang: boolean;
  isMoving: boolean;
  originalText: string;
  changedText: string;
};

export type GieoQueRelationship = {
  label: string;
  detail: string;
};

export type GieoQueCastResult = {
  input: GieoQueInput;
  question: string;
  castDateLabel: string;
  castTimeLabel: string;
  methodLabel: string;
  warnings: GieoQueWarning[];
  movingLine: number;
  chu: GieoQueHexagram;
  ho: GieoQueHexagram;
  bien: GieoQueHexagram;
  the: {
    side: 'upper' | 'lower';
    trigram: GieoQueTrigram;
  };
  dung: {
    side: 'upper' | 'lower';
    trigram: GieoQueTrigram;
  };
  relationship: GieoQueRelationship;
  contextChips: string[];
  haoDetails: GieoQueHaoDetail[];
  sourceRefs: SourceRef[];
  summary: string;
};

type CastSeed = {
  upperIndex: number;
  lowerIndex: number;
  movingLine: number;
  castTimeLabel: string;
  castDateLabel: string;
  contextChips: string[];
};

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function normalizeDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseTimeLabel(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    throw new Error('Cast time must use HH:MM format.');
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Cast time must be a valid 24-hour clock value.');
  }

  return { hour, minute, label: `${match[1]}:${match[2]}` };
}

function parseQuestionSeed(question: string) {
  return Array.from(question).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function parseLineValue(value: GieoQueLineValue) {
  return value === 1 ? 'dương' : 'âm';
}

function formatHaoName(position: number) {
  return ['Sơ', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Thượng'][position - 1] ?? `${position}`;
}

function uniqueSourceRefs(refs: SourceRef[]) {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.sourceId}:${ref.locator ?? ''}:${ref.note ?? ''}:${ref.confidence}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function lookupHexagramByPatterns(
  upper: GieoQueTrigram,
  lower: GieoQueTrigram,
  sourceRefs: SourceRef[],
): GieoQueHexagram {
  const base = getHexagram(upper, lower);
  return {
    ...base,
    sourceRefs: uniqueSourceRefs([...base.sourceRefs, ...sourceRefs]),
  };
}

function resolveRelation(the: GieoQueTrigram, dung: GieoQueTrigram): GieoQueRelationship {
  const generates: Record<TrigramElement, TrigramElement> = {
    Mộc: 'Hỏa',
    Hỏa: 'Thổ',
    Thổ: 'Kim',
    Kim: 'Thủy',
    Thủy: 'Mộc',
  };

  const controls: Record<TrigramElement, TrigramElement> = {
    Mộc: 'Thổ',
    Thổ: 'Thủy',
    Thủy: 'Hỏa',
    Hỏa: 'Kim',
    Kim: 'Mộc',
  };

  if (the.element === dung.element) {
    return {
      label: 'Bình hòa',
      detail: `${the.name} và ${dung.name} cùng hành ${the.element}.`,
    };
  }

  if (generates[the.element] === dung.element) {
    return {
      label: 'Sinh',
      detail: `${the.name} (${the.element}) sinh ${dung.name} (${dung.element}).`,
    };
  }

  if (controls[the.element] === dung.element) {
    return {
      label: 'Khắc',
      detail: `${the.name} (${the.element}) khắc ${dung.name} (${dung.element}).`,
    };
  }

  if (generates[dung.element] === the.element) {
    return {
      label: 'Được sinh',
      detail: `${dung.name} (${dung.element}) sinh ${the.name} (${the.element}).`,
    };
  }

  return {
    label: 'Bị khắc',
    detail: `${dung.name} (${dung.element}) khắc ${the.name} (${the.element}).`,
  };
}

function buildLines(baseLines: GieoQueLineValue[], movingLine: number) {
  return baseLines.map((lineValue, index) => {
    const position = index + 1;
    const isMoving = position === movingLine;
    const changedValue = isMoving ? (lineValue === 1 ? 0 : 1) : lineValue;
    return {
      position,
      name: formatHaoName(position),
      isYang: lineValue === 1,
      isMoving,
      originalText: `${parseLineValue(lineValue)} hào`,
      changedText: `${parseLineValue(changedValue)} hào`,
    };
  });
}

function combineTrigramLines(upper: GieoQueTrigram, lower: GieoQueTrigram) {
  return [...lower.lines, ...upper.lines] as [
    GieoQueLineValue,
    GieoQueLineValue,
    GieoQueLineValue,
    GieoQueLineValue,
    GieoQueLineValue,
    GieoQueLineValue,
  ];
}

function deriveMutualHexagram(
  lines: [GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue],
) {
  const lower = getTrigramByLines([lines[1], lines[2], lines[3]]);
  const upper = getTrigramByLines([lines[2], lines[3], lines[4]]);
  return lookupHexagramByPatterns(upper, lower, [GIEOQUE_SOURCE_REFS.core, GIEOQUE_SOURCE_REFS.reading]);
}

function deriveChangedHexagram(
  lines: [GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue],
  movingLine: number,
) {
  const changedLines = lines.map((lineValue, index) => {
    const position = index + 1;
    return position === movingLine ? ((lineValue === 1 ? 0 : 1) as GieoQueLineValue) : lineValue;
  }) as [GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue, GieoQueLineValue];

  const lower = getTrigramByLines([changedLines[0], changedLines[1], changedLines[2]]);
  const upper = getTrigramByLines([changedLines[3], changedLines[4], changedLines[5]]);
  return lookupHexagramByPatterns(upper, lower, [GIEOQUE_SOURCE_REFS.core, GIEOQUE_SOURCE_REFS.reading]);
}

function resolveTimeSeed(input: GieoQueInput): CastSeed {
  const castTime = input.castTime ? parseTimeLabel(input.castTime) : { hour: 0, minute: 0, label: '00:00' };
  const questionSeed = parseQuestionSeed(input.question ?? '');
  const date = normalizeDate(input.castDate);
  const dateSeed = date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
  const timeSeed = castTime.hour * 60 + castTime.minute;
  const seed = dateSeed + timeSeed + questionSeed;
  return {
    upperIndex: mod(seed + questionSeed, TRIGRAMS.length),
    lowerIndex: mod(Math.floor(seed / 3) + timeSeed + questionSeed, TRIGRAMS.length),
    movingLine: mod(seed + timeSeed + questionSeed, 6) + 1,
    castTimeLabel: castTime.label,
    castDateLabel: date.toLocaleDateString('vi-VN'),
    contextChips: [
      date.toLocaleDateString('vi-VN'),
      castTime.label,
      input.question?.trim() ? input.question.trim() : 'Câu hỏi trống',
    ],
  };
}

function resolveNumberSeed(input: GieoQueInput): CastSeed {
  if (!input.numbers) {
    throw new Error('Two numbers are required for number-based casting.');
  }

  const [first, second] = input.numbers;
  if (!Number.isInteger(first) || !Number.isInteger(second) || first <= 0 || second <= 0) {
    throw new Error('Casting numbers must be positive integers.');
  }

  const questionSeed = parseQuestionSeed(input.question ?? '');
  const date = normalizeDate(input.castDate);
  const dateSeed = date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
  const seed = first * 31 + second * 17 + questionSeed + dateSeed;
  return {
    upperIndex: mod(seed, TRIGRAMS.length),
    lowerIndex: mod(first * 7 + second * 11 + questionSeed, TRIGRAMS.length),
    movingLine: mod(first + second + questionSeed, 6) + 1,
    castTimeLabel: input.castTime ? parseTimeLabel(input.castTime).label : '00:00',
    castDateLabel: date.toLocaleDateString('vi-VN'),
    contextChips: [
      date.toLocaleDateString('vi-VN'),
      `#${first} · #${second}`,
      input.question?.trim() ? input.question.trim() : 'Câu hỏi trống',
    ],
  };
}

export function castHoaMai(input: GieoQueInput): GieoQueCastResult {
  if (!(input.castDate instanceof Date) || Number.isNaN(input.castDate.getTime())) {
    throw new Error('Cast date must be a valid Date.');
  }

  const warnings: GieoQueWarning[] = [];
  const seed = input.method === 'time' ? resolveTimeSeed(input) : resolveNumberSeed(input);

  if (!input.question?.trim()) {
    warnings.push({
      code: 'question-empty',
      message: 'Question text is empty; the cast remains reproducible, but the reading stays generic.',
    });
  }

  const upper = TRIGRAMS[seed.upperIndex];
  const lower = TRIGRAMS[seed.lowerIndex];
  const baseLines = combineTrigramLines(upper, lower);
  const mainHexagram = lookupHexagramByPatterns(upper, lower, [GIEOQUE_SOURCE_REFS.core, GIEOQUE_SOURCE_REFS.reading]);
  const mutualHexagram = deriveMutualHexagram(baseLines);
  const changedHexagram = deriveChangedHexagram(baseLines, seed.movingLine);
  const movingLine = seed.movingLine;
  const theSide = movingLine <= 3 ? 'lower' : 'upper';
  const dungSide = theSide === 'lower' ? 'upper' : 'lower';
  const the = theSide === 'lower' ? lower : upper;
  const dung = theSide === 'lower' ? upper : lower;
  const relationship = resolveRelation(the, dung);
  const haoDetails = buildLines(baseLines, movingLine);
  const sourceRefs = uniqueSourceRefs([
    GIEOQUE_SOURCE_REFS.core,
    GIEOQUE_SOURCE_REFS.trigrams,
    GIEOQUE_SOURCE_REFS.hexagrams,
    GIEOQUE_SOURCE_REFS.reading,
    ...mainHexagram.sourceRefs,
    ...mutualHexagram.sourceRefs,
    ...changedHexagram.sourceRefs,
    ...upper.sourceRefs,
    ...lower.sourceRefs,
  ]);

  return {
    input,
    question: input.question?.trim() ?? '',
    castDateLabel: seed.castDateLabel,
    castTimeLabel: seed.castTimeLabel,
    methodLabel: input.method === 'time' ? 'Time-based' : 'Number-based',
    warnings,
    movingLine,
    chu: mainHexagram,
    ho: mutualHexagram,
    bien: changedHexagram,
    the: {
      side: theSide,
      trigram: the,
    },
    dung: {
      side: dungSide,
      trigram: dung,
    },
    relationship,
    contextChips: seed.contextChips,
    haoDetails,
    sourceRefs,
    summary: `Thể ${the.name} (${the.element}), Dụng ${dung.name} (${dung.element}), quan hệ ${relationship.label.toLowerCase()}.`,
  };
}

export const castGieoQue = castHoaMai;

export function getGieoQueFixturesCount() {
  return {
    trigrams: TRIGRAMS.length,
    hexagrams: HEXAGRAMS.length,
  };
}
