import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveVietnamHistoricalTimezone,
  shiftTimestampByOffsetHours,
  startOfCivilDayUtc
} from "../src/index.js";

test("HTZC resolves the historical offset boundaries", () => {
  const beforeBoundary = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1906-06-30T12:00:00Z")
  });
  const afterBoundary = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1906-07-01T12:00:00Z")
  });
  const midCentury = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1950-01-01T12:00:00Z")
  });
  const northern1950s = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1965-01-01T12:00:00Z"),
    latitude: 21
  });

  assert.equal(Math.abs(beforeBoundary.offsetHours - (7 + 6 / 60 + 30 / 3600)) < 1e-12, true);
  assert.equal(Math.abs(afterBoundary.offsetHours - (7 + 6 / 60 + 30 / 3600)) < 1e-12, true);
  assert.equal(midCentury.offsetHours, 8);
  assert.equal(northern1950s.offsetHours, 7);
  assert.equal(northern1950s.ambiguous, false);
});

test("HTZC resolves the 1947-1955 period deterministically", () => {
  const result = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1950-01-01T12:00:00Z"),
    controlZone: "occupied"
  });

  assert.equal(result.ambiguous, false);
  assert.equal(result.offsetHours, 8);
});

test("HTZC uses the canonical 1960-1975 offset history with 17th parallel split", () => {
  const north = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1965-01-01T12:00:00Z"),
    latitude: 21
  });
  const south = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1965-01-01T12:00:00Z"),
    latitude: 10
  });

  assert.equal(north.offsetHours, 7);
  assert.equal(north.ruleId, "1960-01-01-1975-06-13-north");
  assert.equal(south.offsetHours, 8);
  assert.equal(south.ruleId, "1960-01-01-1975-06-13-south");
});

test("HTZC still validates latitude inputs when provided", () => {
  assert.throws(
    () =>
      resolveVietnamHistoricalTimezone({
        timestamp: Date.parse("1965-01-01T12:00:00Z"),
        latitude: 120
      }),
    /latitude must be between -90 and 90 degrees/
  );
});

test("shiftTimestampByOffsetHours applies the offset in milliseconds", () => {
  assert.equal(shiftTimestampByOffsetHours(0, 1), 3600000);
});

test("startOfCivilDayUtc floors to midnight UTC", () => {
  assert.equal(
    startOfCivilDayUtc(Date.parse("1975-06-13T12:34:56Z")),
    Date.parse("1975-06-13T00:00:00Z")
  );
});
