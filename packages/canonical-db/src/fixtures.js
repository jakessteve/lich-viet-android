import { buildCanonicalSeedSnapshot, getCanonicalSeedSummary } from "./seeds.js";
import {
  resolveVietnamHistoricalTimezone,
  shiftTimestampByOffsetHours
} from "./htzc.js";
import { applyUserOverrides } from "./user-state.js";

const HTZC_BOUNDARY_FIXTURES = Object.freeze([
  {
    label: "1906 boundary",
    timestamp: Date.parse("1906-07-01T12:00:00Z"),
    latitude: 21
  },
  {
    label: "1947 civil time",
    timestamp: Date.parse("1950-01-01T12:00:00Z"),
    latitude: 16
  },
  {
    label: "1965 civil time",
    timestamp: Date.parse("1965-01-01T12:00:00Z"),
    latitude: 10
  }
]);
const FIXTURE_NOW = () => "1970-01-01T00:00:00.000Z";

export function buildPhase2FixtureBundle() {
  const canonicalSeed = buildCanonicalSeedSnapshot();
  const appliedOverrides = applyUserOverrides([
    {
      school_id: "western_electional",
      entity_id: "venus",
      custom_element: "water",
      custom_weight: 1.35
    }
  ], FIXTURE_NOW);

  return {
    version: 1,
    summary: getCanonicalSeedSummary(),
    canonicalSeed,
    htzcFixtures: HTZC_BOUNDARY_FIXTURES.map((fixture) => {
      const resolved = resolveVietnamHistoricalTimezone({
        timestamp: fixture.timestamp,
        latitude: fixture.latitude
      });

      return {
        ...fixture,
        resolved,
        shiftedTimestamp: shiftTimestampByOffsetHours(
          fixture.timestamp,
          resolved.offsetHours
        )
      };
    }),
    overrideFixtures: appliedOverrides
  };
}
