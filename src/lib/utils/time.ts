// Time helpers. All times in the app are UTC instants (Date); a "day" is still a Danish
// calendar day, which is 23 or 25 hours long when daylight saving time starts or ends.

import type { DateRange } from "@/lib/domain/types";

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

// #region Public API

/** The time zone the app shows times in. */
export const DANISH_TIME_ZONE = "Europe/Copenhagen";

/**
 * The local calendar day containing `instant`, moved by `dayOffset` days (1 = tomorrow),
 * as a UTC range. 23 hours long when DST starts, 25 hours when it ends.
 */
export function dayRange(
  instant: Date,
  dayOffset = 0,
  timeZone = DANISH_TIME_ZONE,
): DateRange {
  const { year, month, day } = localDate(instant, timeZone);
  const firstDay = day + dayOffset;

  return {
    start: localMidnight(year, month, firstDay, timeZone),
    end: localMidnight(year, month, firstDay + 1, timeZone),
  };
}

/**
 * Start of the clock hour containing `instant`. Rounding in UTC gives the local hour too,
 * because Danish time is always a whole number of hours from UTC.
 */
export function startOfHour(instant: Date): Date {
  const wholeHours = Math.floor(instant.getTime() / MS_PER_HOUR);
  return new Date(wholeHours * MS_PER_HOUR);
}

/** The hour after `start`. */
export function addHour(start: Date): Date {
  return new Date(start.getTime() + MS_PER_HOUR);
}

/** Sort comparator: earliest `start` first. Use as `items.sort(compareByStart)`. */
export function compareByStart(a: { start: Date }, b: { start: Date }): number {
  return a.start.getTime() - b.start.getTime();
}

// #endregion

// #region Helpers

/** The calendar date at `instant` in `timeZone`. Month is 1-12. */
function localDate(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(instant);

  const partAsNumber = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: partAsNumber("year"),
    month: partAsNumber("month"),
    day: partAsNumber("day"),
  };
}

/**
 * The UTC instant of local midnight on the given date. `day` may overflow
 * (32 October → 1 November); Date.UTC handles that.
 */
function localMidnight(
  year: number,
  month: number,
  day: number,
  timeZone: string,
): Date {
  const utcMidnight = Date.UTC(year, month - 1, day);

  // The offset at UTC midnight is a first guess. On DST days the offset at local midnight
  // can differ, so the guess is used to look up the real one.
  const firstGuess = utcMidnight - offsetAt(utcMidnight, timeZone);
  return new Date(utcMidnight - offsetAt(firstGuess, timeZone));
}

/** How far `timeZone` is ahead of UTC at `time`, in ms (Copenhagen: 1 h in winter, 2 h in summer). */
function offsetAt(time: number, timeZone: string): number {
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(time))
    .find((part) => part.type === "timeZoneName")?.value;

  return parseGmtOffsetMinutes(offsetName ?? "GMT") * MS_PER_MINUTE;
}

/** "GMT+01:00" → 60, "GMT-03:30" → -210, "GMT" (UTC itself) → 0. */
function parseGmtOffsetMinutes(offsetName: string): number {
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(offsetName);
  if (!match) return 0;

  const [, sign, hours, minutes] = match;
  const totalMinutes = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -totalMinutes : totalMinutes;
}

// #endregion
