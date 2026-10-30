import { describe, expect, it } from "vitest";
import { averageCo2ByHour, averagePricesByHour } from "@/lib/calc/hourly";
import type { Co2Point, PricePoint } from "@/lib/domain/types";

// #region Test data

function price(iso: string, priceDkkPerKwh: number): PricePoint {
  return {
    start: new Date(iso),
    intervalLength: "15min",
    priceArea: "DK1",
    priceDkkPerKwh,
  };
}

function co2(iso: string, co2GramPerKwh: number, isForecast = false): Co2Point {
  return {
    start: new Date(iso),
    intervalLength: "5min",
    priceArea: "DK1",
    co2GramPerKwh,
    isForecast,
  };
}

// #endregion

describe("averagePricesByHour", () => {
  it("averages the four quarters of an hour", () => {
    // Arrange
    const quarters = [
      price("2026-10-28T10:00:00Z", 1),
      price("2026-10-28T10:15:00Z", 2),
      price("2026-10-28T10:30:00Z", 3),
      price("2026-10-28T10:45:00Z", 6),
    ];

    // Act
    const hours = averagePricesByHour(quarters);

    // Assert
    expect(hours).toEqual([
      {
        start: new Date("2026-10-28T10:00:00Z"),
        intervalLength: "hour",
        priceArea: "DK1",
        priceDkkPerKwh: 3,
      },
    ]);
  });

  it("makes one hour per clock hour", () => {
    // Arrange
    const points = [
      price("2026-10-28T10:00:00Z", 1),
      price("2026-10-28T10:15:00Z", 1),
      price("2026-10-28T11:00:00Z", 0.5),
    ];

    // Act
    const hours = averagePricesByHour(points);

    // Assert
    expect(hours.map((hour) => hour.priceDkkPerKwh)).toEqual([1, 0.5]);
  });

  it("returns hours in time order even if the input is not sorted", () => {
    // Arrange
    const unsorted = [
      price("2026-10-28T12:00:00Z", 1),
      price("2026-10-28T10:00:00Z", 1),
    ];

    // Act
    const hours = averagePricesByHour(unsorted);

    // Assert
    expect(hours.map((hour) => hour.start.getUTCHours())).toEqual([10, 12]);
  });

  it("returns nothing for no data", () => {
    // Arrange
    const noPoints: PricePoint[] = [];

    // Act
    const hours = averagePricesByHour(noPoints);

    // Assert
    expect(hours).toEqual([]);
  });
});

describe("averageCo2ByHour", () => {
  it("averages the 5-minute values of an hour", () => {
    // Arrange
    const values = [
      co2("2026-10-28T17:00:00Z", 60),
      co2("2026-10-28T17:05:00Z", 80),
      co2("2026-10-28T17:10:00Z", 100),
    ];

    // Act
    const [hour] = averageCo2ByHour(values);

    // Assert
    expect(hour.co2GramPerKwh).toBe(80);
    expect(hour.intervalLength).toBe("hour");
  });

  it("marks an hour as forecast if any of its values is a forecast", () => {
    // Arrange
    const partlyMeasured = [
      co2("2026-10-28T17:00:00Z", 60),
      co2("2026-10-28T17:05:00Z", 80, true),
    ];

    // Act
    const [hour] = averageCo2ByHour(partlyMeasured);

    // Assert
    expect(hour.isForecast).toBe(true);
  });
});
