import { describe, expect, it } from "vitest";
import { addHour, dayRange, startOfHour } from "@/lib/utils/time";

const HOUR = 3_600_000;

function hoursIn(range: { start: Date; end: Date }): number {
  return (range.end.getTime() - range.start.getTime()) / HOUR;
}

describe("dayRange (Europe/Copenhagen)", () => {
  it("starts at Danish midnight in winter time (UTC+1)", () => {
    const range = dayRange(new Date("2026-10-28T17:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-10-27T23:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-28T23:00:00.000Z");
    expect(hoursIn(range)).toBe(24);
  });

  it("starts at Danish midnight in summer time (UTC+2)", () => {
    const range = dayRange(new Date("2026-07-01T12:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-06-30T22:00:00.000Z");
    expect(hoursIn(range)).toBe(24);
  });

  it("has 23 hours on the day summer time starts", () => {
    // 29.03.2026: clocks go from 02:00 to 03:00.
    const range = dayRange(new Date("2026-03-29T12:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-03-29T22:00:00.000Z");
    expect(hoursIn(range)).toBe(23);
  });

  it("has 25 hours on the day summer time ends", () => {
    // 25.10.2026: clocks go from 03:00 back to 02:00.
    const range = dayRange(new Date("2026-10-25T12:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-10-24T22:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-25T23:00:00.000Z");
    expect(hoursIn(range)).toBe(25);
  });

  it("counts a late-evening UTC time as the next Danish day", () => {
    // 23:30 UTC on 28.10 is 00:30 on 29.10 in Denmark.
    const range = dayRange(new Date("2026-10-28T23:30:00Z"));
    expect(range.start.toISOString()).toBe("2026-10-28T23:00:00.000Z");
  });

  it("moves by whole days, also across month ends", () => {
    const tomorrow = dayRange(new Date("2026-10-31T12:00:00Z"), 1);
    expect(tomorrow.start.toISOString()).toBe("2026-10-31T23:00:00.000Z");
    expect(hoursIn(tomorrow)).toBe(24);
  });
});

describe("startOfHour and addHour", () => {
  it("rounds down to the hour and steps one hour", () => {
    const start = startOfHour(new Date("2026-10-28T17:42:10Z"));
    expect(start.toISOString()).toBe("2026-10-28T17:00:00.000Z");
    expect(addHour(start).toISOString()).toBe("2026-10-28T18:00:00.000Z");
  });
});
