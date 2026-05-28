import { z } from 'zod';

const nonEmptyString = z.string().min(1);
const unknownRecord = z.record(z.string(), z.unknown());

export const NapAmDataSchema = z.object({
  napAm5Hanh: z.array(nonEmptyString).length(30),
  napAmHanhMap: z.array(z.number().int()).length(30),
  napAmIndexMap: z.record(z.string(), z.array(z.number().int()).length(6)),
});

export const ThapNhiTrucSchema = z.object({
  thap_nhi_truc: z.array(unknownRecord).min(12),
});

export const ThanSatSchema = z.object({
  than_sat: z.array(unknownRecord).min(1),
});

const StarListSchema = z.object({
  stars: z.array(unknownRecord).min(1),
});

export const CatThanSchema = StarListSchema;
export const HungThanSchema = StarListSchema;

export const DungSuSchema = z.object({
  truc_rules: z.record(z.string(), z.unknown()),
  rules: z.union([z.array(unknownRecord), z.record(z.string(), z.unknown())]),
  sat_su_unsuitable: z.array(nonEmptyString),
  major_hung_unsuitable: z.array(nonEmptyString),
  bach_ky_list: z.array(nonEmptyString),
});

export const NhiThapBatTuSchema = z.object({
  nhi_thap_bat_tu: z.array(unknownRecord).length(28),
});

export const ThoiThanSchema = z.object({
  path_deities: z.array(nonEmptyString).min(1),
  path_deity_meanings: z.record(z.string(), nonEmptyString),
  hoang_dao_indices: z.array(z.number().int()),
  deity_start_indices: z.record(z.string(), z.number().int()),
  hourly_stars: z.union([z.array(unknownRecord), z.record(z.string(), z.unknown())]),
});

export const StarWeightSchema = z.object({
  starWeight: z.union([z.array(unknownRecord), z.record(z.string(), z.number())]),
});

export const ActionWeightSchema = z.record(z.string(), z.record(z.string(), z.unknown()));

export const NullifyRulesSchema = z.array(
  z.object({
    goodStar: nonEmptyString,
    badStar: nonEmptyString,
    ratio: z.number(),
  }),
);

export const ExtraStarsDataSchema = z.object({
  canChiStars: z.record(z.string(), z.unknown()),
  dayChiStars: z.record(z.string(), z.unknown()),
  monthMaps: z.record(z.string(), z.unknown()),
  seasonChiMatches: z.record(z.string(), z.unknown()),
  canChiGroups: z.record(z.string(), z.unknown()),
  daiminhGroups: z.record(z.string(), z.unknown()),
  thatthanhGroups: z.record(z.string(), z.unknown()),
  hoidongGroups: z.record(z.string(), z.unknown()),
  xichKhauPatterns: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]),
  tuHuBai: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]),
});

export const BanhToBachKySchema = z.object({
  can: z.record(z.string(), z.unknown()),
  chi: z.record(z.string(), z.unknown()),
});

export const VietnameseHolidaysSchema = z.object({
  solar: z.array(unknownRecord),
  lunar: z.array(unknownRecord),
});

export const VtMappingSchema = z.record(z.string(), nonEmptyString);

export const TrigramsSchema = z.array(
  z.object({
    id: z.number().int().min(1).max(8),
    name: nonEmptyString,
    element: nonEmptyString,
    lines: z.array(z.boolean()).length(3),
    nature: nonEmptyString,
  }),
).length(8);

export const HexagramsSchema = z.array(
  z.object({
    id: z.number().int().min(1).max(64),
    name: nonEmptyString,
    upper: z.number().int().min(1).max(8),
    lower: z.number().int().min(1).max(8),
    chineseName: nonEmptyString.optional(),
    briefExplanation: nonEmptyString.optional(),
    meaning: nonEmptyString,
    image: nonEmptyString,
    thoanTu: z.object({
      original: nonEmptyString,
      meaning: nonEmptyString,
    }),
    haoTexts: z.array(
      z.object({
        position: z.number().int().min(1).max(6),
        original: nonEmptyString,
        meaning: nonEmptyString,
        commentary: nonEmptyString,
      }),
    ).length(6),
    commentary: nonEmptyString,
  }),
).length(64);

export const NguHanhInteractionSchema = z.object({
  interactionMatrix: z.record(z.string(), z.record(z.string(), z.union([z.number(), nonEmptyString]))),
  seasonalStrength: z.record(z.string(), z.record(z.string(), z.union([z.number(), nonEmptyString]))),
});

export const NapGiapSchema = z.object({
  nap_giap: z.record(z.string(), z.unknown()),
});
