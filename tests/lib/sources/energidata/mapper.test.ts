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
  const points = mapDayAheadPrices(
    dayAheadPricesResponseSchema.parse(pricesFixture),
  );

  it("maps every 15-minute record", () => {
    // 11:00-13:00 UTC = 2 hours = 8 quarters.
    expect(points).toHaveLength(8);
    expect(points.every((p) => p.intervalLength === "15min")).toBe(true);
  });

  it("reads the time as UTC, not local time", () => {
    expect(points[0].start.toISOString()).toBe("2026-10-28T11:00:00.000Z");
  });

  it("converts DKK/MWh to DKK/kWh", () => {
    const raw = pricesFixture.records[0].DayAheadPriceDKK;
    expect(points[0].priceDkkPerKwh).toBeCloseTo(raw / 1000, 10);
    expect(points[0].priceArea).toBe("DK1");
  });
});

describe("mapCo2Emissions", () => {
  it("maps g/kWh per 5 minutes and flags forecasts", () => {
    const response = co2EmissionsResponseSchema.parse(co2Fixture);
    const measured = mapCo2Emissions(response, false);
    const forecast = mapCo2Emissions(response, true);

    expect(measured).toHaveLength(12);
    expect(measured[0]).toEqual({
      start: new Date("2026-10-28T11:00:00Z"),
      intervalLength: "5min",
      priceArea: "DK1",
      co2GramPerKwh: co2Fixture.records[0].CO2Emission,
      isForecast: false,
    });
    expect(forecast[0].isForecast).toBe(true);
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
    const merged = mergeMeasuredAndForecast(
      [point(0, false), point(5, false)],
      [point(10, true), point(0, true), point(5, true)],
    );
    expect(merged.map((p) => [p.start.getUTCMinutes(), p.isForecast])).toEqual([
      [0, false],
      [5, false],
      [10, true],
    ]);
  });
});
