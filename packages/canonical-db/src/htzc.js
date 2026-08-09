const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const HO_CHI_MINH_LMT_OFFSET_HOURS = 7 + 6 / 60 + 30 / 3600;

function utcDateStamp(dateString) {
  return Date.parse(`${dateString}T00:00:00Z`);
}

function utcFromLocal(dateTimeString, offsetHours) {
  return Date.parse(`${dateTimeString}Z`) - offsetHours * HOUR_MS;
}

function inRange(timestamp, startInclusive, endExclusive) {
  return timestamp >= startInclusive && timestamp < endExclusive;
}

function assertLatitude(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError("latitude must be a finite number");
  }

  if (value < -90 || value > 90) {
    throw new RangeError("latitude must be between -90 and 90 degrees");
  }
}

export const HTZC_RULES = Object.freeze([
  {
    id: "pre-1906-07-01",
    startInclusive: Number.NEGATIVE_INFINITY,
    endExclusive: utcDateStamp("1906-07-01"),
    offsetHours: HO_CHI_MINH_LMT_OFFSET_HOURS
  },
  {
    id: "1906-07-01-1911-05-01",
    startInclusive: utcDateStamp("1906-07-01"),
    endExclusive: utcDateStamp("1911-05-01"),
    offsetHours: HO_CHI_MINH_LMT_OFFSET_HOURS
  },
  {
    id: "1911-05-01-1942-12-31",
    startInclusive: utcDateStamp("1911-05-01"),
    endExclusive: utcFromLocal("1942-12-31T23:00:00", 7),
    offsetHours: 7
  },
  {
    id: "1942-12-31-1945-03-14",
    startInclusive: utcFromLocal("1942-12-31T23:00:00", 7),
    endExclusive: utcFromLocal("1945-03-14T23:00:00", 8),
    offsetHours: 8
  },
  {
    id: "1945-03-14-1945-09-02",
    startInclusive: utcFromLocal("1945-03-14T23:00:00", 8),
    endExclusive: utcFromLocal("1945-09-02T00:00:00", 9),
    offsetHours: 9
  },
  {
    id: "1945-09-02-1947-04-01",
    startInclusive: utcFromLocal("1945-09-02T00:00:00", 9),
    endExclusive: utcDateStamp("1947-04-01"),
    offsetHours: 7
  },
  {
    id: "1947-04-01-1955-07-01",
    startInclusive: utcDateStamp("1947-04-01"),
    endExclusive: utcFromLocal("1955-07-01T01:00:00", 8),
    offsetHours: 8
  },
  {
    id: "1955-07-01-1960-01-01",
    startInclusive: utcFromLocal("1955-07-01T01:00:00", 8),
    endExclusive: utcFromLocal("1959-12-31T23:00:00", 7),
    offsetHours: 7
  },
  {
    id: "1960-01-01-1975-06-13",
    startInclusive: utcFromLocal("1959-12-31T23:00:00", 7),
    endExclusive: utcFromLocal("1975-06-13T07:00:00", 8),
    offsetHours: 8
  },
  {
    id: "1975-06-13-plus",
    startInclusive: utcFromLocal("1975-06-13T07:00:00", 8),
    endExclusive: Number.POSITIVE_INFINITY,
    offsetHours: 7
  }
]);

export function resolveVietnamHistoricalTimezone({
  timestamp,
  latitude,
  controlZone
}) {
  if (!Number.isFinite(timestamp)) {
    throw new TypeError("timestamp must be a finite number");
  }

  if (latitude !== undefined) {
    assertLatitude(latitude);
  }

  const rule = HTZC_RULES.find((candidate) =>
    inRange(timestamp, candidate.startInclusive, candidate.endExclusive)
  );

  if (!rule) {
    throw new RangeError("No HTZC rule matched the given timestamp");
  }

  let offsetHours = rule.offsetHours;
  let ruleId = rule.id;
  let ambiguous = false;

  if (rule.id === "1947-04-01-1955-07-01") {
    if (controlZone === "resistance") {
      offsetHours = 7;
      ruleId = "1947-04-01-1955-07-01-resistance";
    } else if (controlZone === "occupied") {
      offsetHours = 8;
      ruleId = "1947-04-01-1955-07-01-occupied";
    } else {
      ambiguous = true;
    }
  }

  if (rule.id === "1960-01-01-1975-06-13") {
    if (latitude !== undefined) {
      if (latitude >= 17.0) {
        offsetHours = 7;
        ruleId = "1960-01-01-1975-06-13-north";
      } else {
        offsetHours = 8;
        ruleId = "1960-01-01-1975-06-13-south";
      }
    } else {
      ambiguous = true;
    }
  }

  return {
    ruleId,
    offsetHours,
    ambiguous
  };
}

export function shiftTimestampByOffsetHours(timestamp, offsetHours) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(offsetHours)) {
    throw new TypeError("timestamp and offsetHours must be finite numbers");
  }

  return timestamp + offsetHours * 60 * 60 * 1000;
}

export function startOfCivilDayUtc(timestamp) {
  if (!Number.isFinite(timestamp)) {
    throw new TypeError("timestamp must be a finite number");
  }

  return Math.floor(timestamp / DAY_MS) * DAY_MS;
}
