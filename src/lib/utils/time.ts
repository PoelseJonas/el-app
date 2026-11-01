// Time helpers. All times in the app are UTC instants (Date); a "day" is still a Danish
// calendar day, which is 23 or 25 hours long when daylight saving time starts or ends.

import type { DateRange } from "@/lib/domain/types";

/** The time zone the app shows times in. */
export const DANISH_TIME_ZONE = "Europe/Copenhagen";

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/** How many minutes `timeZone` is ahead of UTC at `instant` (Copenhagen: 60 in winter, 120 in summer). */
function offsetMinutes(instant: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;
  // "GMT+01:00", or just "GMT" when the offset is zero.
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? "");
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

/** The calendar date at `instant` in `timeZone`. Month is 1-12. */
function localDate(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** The UTC instant of local midnight. `day` may overflow (32 → next month); Date.UTC handles it. */
function startOfLocalDay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
): Date {
  const utcMidnight = Date.UTC(year, month - 1, day);
  const guess =
    utcMidnight -
    offsetMinutes(new Date(utcMidnight), timeZone) * MS_PER_MINUTE;
  // Use the offset at local midnight itself, which can differ from the guess on DST days.
  return new Date(
    utcMidnight - offsetMinutes(new Date(guess), timeZone) * MS_PER_MINUTE,
  );
}

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
  return {
    start: startOfLocalDay(year, month, day + dayOffset, timeZone),
    end: startOfLocalDay(year, month, day + dayOffset + 1, timeZone),
  };
}

/**
 * Start of the clock hour containing `instant`. Rounding in UTC gives the local hour too,
 * because Danish time is always a whole number of hours from UTC.
 */
export function startOfHour(instant: Date): Date {
  return new Date(Math.floor(instant.getTime() / MS_PER_HOUR) * MS_PER_HOUR);
}

/** The hour after `start`. */
export function addHour(start: Date): Date {
  return new Date(start.getTime() + MS_PER_HOUR);
}
