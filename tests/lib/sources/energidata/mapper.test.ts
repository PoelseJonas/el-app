import { describe, expect, it } from "vitest";
import type { Co2Point } from "@/lib/domain/types";
import {
  mapCo2Emissions,
  mapDayAheadPrices,
  mergeMeasuredAndForecast,
} from "@/lib/sources/energidata/mapper";
import {
  co2EmissionsResponseSchema,
  dayAheadPricesResponseSchema,
} from "@/lib/sources/energidata/schemas";
// Real responses for DK1 on 28.10.2026, saved from the API (public data, nothing personal).
import co2Fixture from "@tests/fixtures/energidata/co2-emis.json";
import pricesFixture from "@tests/fixtures/energidata/day-ahead-prices.json";

describe("mapDayAheadPrices", () => {
  const pricesResponse = dayAheadPricesResponseSchema.parse(pricesFixture);

  it("maps every 15-minute record", () => {
    // Arrange: 11:00-13:00 UTC = 2 hours = 8 quarters.
    const response = pricesResponse;

    // Act
    const points = mapDayAheadPrices(response);

    // Assert
    expect(points).toHaveLength(8);
    expect(points.every((point) => point.intervalLength === "15min")).toBe(
      true,
    );
  });

  it("reads the time as UTC, not local time", () => {
    // Arrange
    const response = pricesResponse;

    // Act
    const [first] = mapDayAheadPrices(response);

    // Assert
    expect(first.start.toISOString()).toBe("2026-10-28T11:00:00.000Z");
  });

  it("converts DKK/MWh to DKK/kWh", () => {
    // Arrange
    const priceDkkPerMwh = pricesFixture.records[0].DayAheadPriceDKK;

    // Act
    const [first] = mapDayAheadPrices(pricesResponse);

    // Assert
    expect(first.priceDkkPerKwh).toBeCloseTo(priceDkkPerMwh / 1000, 10);
  });
});

describe("mapCo2Emissions", () => {
  const co2Response = co2EmissionsResponseSchema.parse(co2Fixture);

  it("maps g/kWh per 5 minutes", () => {
    // Arrange
    const response = co2Response;

    // Act
    const [first] = mapCo2Emissions(response, false);

    // Assert
    expect(first).toEqual({
      start: new Date("2026-10-28T11:00:00Z"),
      intervalLength: "5min",
      priceArea: "DK1",
      co2GramPerKwh: co2Fixture.records[0].CO2Emission,
      isForecast: false,
    });
  });

  it("flags every point as forecast when asked to", () => {
    // Arrange
    const response = co2Response;

    // Act
    const points = mapCo2Emissions(response, true);

    // Assert
    expect(points.every((point) => point.isForecast)).toBe(true);
  });
});

describe("mergeMeasuredAndForecast", () => {
  function point(minute: number, isForecast: boolean): Co2Point {
    return {
      start: new Date(Date.UTC(2026, 9, 28, 12, minute)),
      intervalLength: "5min",
      priceArea: "DK1",
      co2GramPerKwh: isForecast ? 100 : 50,
      isForecast,
    };
  }

  it("prefers measured values and fills the rest with the forecast, in time order", () => {
    // Arrange
    const measured = [point(0, false), point(5, false)];
    const forecast = [point(10, true), point(0, true), point(5, true)];

    // Act
    const merged = mergeMeasuredAndForecast(measured, forecast);

    // Assert
    expect(merged.map((p) => [p.start.getUTCMinutes(), p.isForecast])).toEqual([
      [0, false],
      [5, false],
      [10, true],
    ]);
  });
});
