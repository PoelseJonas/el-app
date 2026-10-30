import { describe, expect, it } from "vitest";
import type { Co2Point, PricePoint } from "@/lib/domain/types";
import {
  getDayOverview,
  type DaySources,
  type HourOverview,
} from "@/lib/services/get-day-overview";

// #region Test data

const day = {
  start: new Date("2026-10-28T00:00:00Z"),
  end: new Date("2026-10-28T06:00:00Z"),
};
const halfPastTwo = new Date("2026-10-28T02:30:00Z");

/** One price per hour from 00:00 UTC (already hourly, so averaging keeps the value). */
function hourlyPrices(values: number[]): PricePoint[] {
  return values.map((priceDkkPerKwh, hour) => ({
    start: new Date(Date.UTC(2026, 9, 28, hour)),
    intervalLength: "15min",
    priceArea: "DK1",
    priceDkkPerKwh,
  }));
}

/** One CO2 value per hour from 00:00 UTC. Hours from `forecastFrom` are forecasts. */
function hourlyCo2(values: number[], forecastFrom = values.length): Co2Point[] {
  return values.map((co2GramPerKwh, hour) => ({
    start: new Date(Date.UTC(2026, 9, 28, hour)),
    intervalLength: "5min",
    priceArea: "DK1",
    co2GramPerKwh,
    isForecast: hour >= forecastFrom,
  }));
}

// Fake sources: the service only knows the interfaces, so tests need no network or mocks.
function fakeSources(prices: PricePoint[], co2: Co2Point[]): DaySources {
  return {
    priceSource: { getPrices: async () => prices },
    co2Source: { getCo2: async () => co2 },
  };
}

const utcHours = (hours: HourOverview[]) =>
  hours.map((hour) => hour.start.getUTCHours());

// #endregion

describe("getDayOverview", () => {
  it("combines price and CO2 into one entry per hour", async () => {
    // Arrange
    const sources = fakeSources(
      hourlyPrices([1, 2, 3, 4, 5, 6]),
      hourlyCo2([60, 50, 40, 30, 20, 10]),
    );

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(overview.hours).toHaveLength(6);
  });

  it("finds the hour we are in now", async () => {
    // Arrange
    const sources = fakeSources(
      hourlyPrices([1, 2, 3]),
      hourlyCo2([60, 50, 40]),
    );

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(overview.currentHour).toEqual({
      start: new Date("2026-10-28T02:00:00Z"),
      priceDkkPerKwh: 3,
      co2GramPerKwh: 40,
      co2IsForecast: false,
    });
  });

  it("marks hours with a CO2 forecast", async () => {
    // Arrange
    const sources = fakeSources([], hourlyCo2([60, 50, 40, 30], 3));

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(overview.hours.map((hour) => hour.co2IsForecast)).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it("suggests only the current and later hours as cheapest", async () => {
    // Arrange: the cheapest hours (00 and 01) are already over.
    const sources = fakeSources(hourlyPrices([0.1, 0.2, 3, 2, 5, 1]), []);

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(utcHours(overview.cheapestHours)).toEqual([2, 3, 5]);
  });

  it("suggests only the current and later hours as greenest", async () => {
    // Arrange: the greenest hours (00 and 01) are already over.
    const sources = fakeSources([], hourlyCo2([10, 10, 40, 30, 20, 50]));

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(utcHours(overview.greenestHours)).toEqual([2, 3, 4]);
  });

  it("returns empty lists when the sources have no data", async () => {
    // Arrange
    const sources = fakeSources([], []);

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(overview).toEqual({
      hours: [],
      currentHour: undefined,
      cheapestHours: [],
      greenestHours: [],
    });
  });

  it("keeps hours that only have CO2 (prices not published yet)", async () => {
    // Arrange
    const sources = fakeSources([], hourlyCo2([60, 50]));

    // Act
    const overview = await getDayOverview(sources, "DK1", day, halfPastTwo);

    // Assert
    expect(overview.hours).toHaveLength(2);
    expect(overview.hours[0].priceDkkPerKwh).toBeUndefined();
  });
});
