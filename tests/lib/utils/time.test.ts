import { describe, expect, it } from "vitest";
import {
  addHour,
  compareByStart,
  dayRange,
  startOfHour,
} from "@/lib/utils/time";

const MS_PER_HOUR = 3_600_000;

function hoursIn(range: { start: Date; end: Date }): number {
  return (range.end.getTime() - range.start.getTime()) / MS_PER_HOUR;
}

describe("dayRange (Europe/Copenhagen)", () => {
  it("starts at Danish midnight in winter time (UTC+1)", () => {
    // Arrange
    const afternoon = new Date("2026-10-28T17:00:00Z");

    // Act
    const range = dayRange(afternoon);

    // Assert
    expect(range.start.toISOString()).toBe("2026-10-27T23:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-28T23:00:00.000Z");
  });

  it("starts at Danish midnight in summer time (UTC+2)", () => {
    // Arrange
    const noon = new Date("2026-07-01T12:00:00Z");

    // Act
    const range = dayRange(noon);

    // Assert
    expect(range.start.toISOString()).toBe("2026-06-30T22:00:00.000Z");
  });

  it("has 24 hours on a normal day", () => {
    // Arrange
    const normalDay = new Date("2026-10-28T12:00:00Z");

    // Act
    const range = dayRange(normalDay);

    // Assert
    expect(hoursIn(range)).toBe(24);
  });

  it("has 23 hours on the day summer time starts", () => {
    // Arrange: on 29.03.2026 clocks go from 02:00 to 03:00.
    const summerTimeStarts = new Date("2026-03-29T12:00:00Z");

    // Act
    const range = dayRange(summerTimeStarts);

    // Assert
    expect(range.start.toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-03-29T22:00:00.000Z");
    expect(hoursIn(range)).toBe(23);
  });

  it("has 25 hours on the day summer time ends", () => {
    // Arrange: on 25.10.2026 clocks go from 03:00 back to 02:00.
    const summerTimeEnds = new Date("2026-10-25T12:00:00Z");

    // Act
    const range = dayRange(summerTimeEnds);

    // Assert
    expect(range.start.toISOString()).toBe("2026-10-24T22:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-25T23:00:00.000Z");
    expect(hoursIn(range)).toBe(25);
  });

  it("counts a late-evening UTC time as the next Danish day", () => {
    // Arrange: 23:30 UTC on 28.10 is 00:30 on 29.10 in Denmark.
    const halfPastMidnightInDenmark = new Date("2026-10-28T23:30:00Z");

    // Act
    const range = dayRange(halfPastMidnightInDenmark);

    // Assert
    expect(range.start.toISOString()).toBe("2026-10-28T23:00:00.000Z");
  });

  it("moves to the next day across a month end", () => {
    // Arrange
    const lastDayOfOctober = new Date("2026-10-31T12:00:00Z");

    // Act
    const tomorrow = dayRange(lastDayOfOctober, 1);

    // Assert
    expect(tomorrow.start.toISOString()).toBe("2026-10-31T23:00:00.000Z");
    expect(hoursIn(tomorrow)).toBe(24);
  });
});

describe("startOfHour", () => {
  it("rounds down to the whole hour", () => {
    // Arrange
    const time = new Date("2026-10-28T17:42:10Z");

    // Act
    const start = startOfHour(time);

    // Assert
    expect(start.toISOString()).toBe("2026-10-28T17:00:00.000Z");
  });
});

describe("addHour", () => {
  it("returns the start of the next hour", () => {
    // Arrange
    const start = new Date("2026-10-28T17:00:00Z");

    // Act
    const next = addHour(start);

    // Assert
    expect(next.toISOString()).toBe("2026-10-28T18:00:00.000Z");
  });
});

describe("compareByStart", () => {
  it("sorts the earliest start first", () => {
    // Arrange
    const items = [
      { start: new Date("2026-10-28T12:00:00Z") },
      { start: new Date("2026-10-28T10:00:00Z") },
    ];

    // Act
    const sorted = [...items].sort(compareByStart);

    // Assert
    expect(sorted.map((item) => item.start.getUTCHours())).toEqual([10, 12]);
  });
});
