import { describe, expect, it } from "vitest";
import type { Co2Source, PriceSource } from "@/lib/domain/sources";
import type { Co2Point, PricePoint } from "@/lib/domain/types";
import { getDayOverview } from "@/lib/services/get-day-overview";

const day = {
  start: new Date("2026-10-28T00:00:00Z"),
  end: new Date("2026-10-28T06:00:00Z"),
};

/** One price per hour (already hourly, so averaging keeps the value). */
function prices(values: number[]): PricePoint[] {
  return values.map((priceDkkPerKwh, hour) => ({
    start: new Date(Date.UTC(2026, 9, 28, hour)),
    intervalLength: "15min",
    priceArea: "DK1",
    priceDkkPerKwh,
  }));
}

function co2(values: number[], forecastFrom: number): Co2Point[] {
  return values.map((co2GramPerKwh, hour) => ({
    start: new Date(Date.UTC(2026, 9, 28, hour)),
    intervalLength: "5min",
    priceArea: "DK1",
    co2GramPerKwh,
    isForecast: hour >= forecastFrom,
  }));
}

// Fake sources: the service only knows the interfaces, so tests need no network or mocks.
function sources(p: PricePoint[], c: Co2Point[]) {
  const priceSource: PriceSource = { getPrices: async () => p };
  const co2Source: Co2Source = { getCo2: async () => c };
  return { priceSource, co2Source };
}

describe("getDayOverview", () => {
  const now = new Date("2026-10-28T02:30:00Z");

  it("combines price and CO2 per hour and finds the current hour", async () => {
    const overview = await getDayOverview(
      sources(prices([1, 2, 3, 4, 5, 6]), co2([60, 50, 40, 30, 20, 10], 3)),
      "DK1",
      day,
      now,
    );
    expect(overview.hours).toHaveLength(6);
    expect(overview.currentHour).toEqual({
      start: new Date("2026-10-28T02:00:00Z"),
      priceDkkPerKwh: 3,
      co2GramPerKwh: 40,
      co2IsForecast: false,
    });
    expect(overview.hours[4].co2IsForecast).toBe(true);
  });

  it("suggests only the current and later hours", async () => {
    // The cheapest hours (00 and 01) are already over.
    const overview = await getDayOverview(
      sources(prices([0.1, 0.2, 3, 2, 5, 1]), co2([10, 10, 40, 30, 20, 50], 6)),
      "DK1",
      day,
      now,
    );
    expect(overview.cheapestHours.map((h) => h.start.getUTCHours())).toEqual([
      2, 3, 5,
    ]);
    expect(overview.greenestHours.map((h) => h.start.getUTCHours())).toEqual([
      2, 3, 4,
    ]);
  });

  it("returns empty lists when the sources have no data", async () => {
    const overview = await getDayOverview(sources([], []), "DK1", day, now);
    expect(overview.hours).toEqual([]);
    expect(overview.currentHour).toBeUndefined();
    expect(overview.cheapestHours).toEqual([]);
  });

  it("keeps hours that only have CO2 (prices not published yet)", async () => {
    const overview = await getDayOverview(
      sources([], co2([60, 50], 0)),
      "DK1",
      day,
      now,
    );
    expect(overview.hours).toHaveLength(2);
    expect(overview.hours[0].priceDkkPerKwh).toBeUndefined();
  });
});
