import { describe, expect, it } from "vitest";
import { averageCo2ByHour, averagePricesByHour } from "@/lib/calc/hourly";
import type { Co2Point, PricePoint } from "@/lib/domain/types";

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

describe("averagePricesByHour", () => {
  it("averages the four quarters of each hour", () => {
    const hours = averagePricesByHour([
      price("2026-10-28T10:00:00Z", 1),
      price("2026-10-28T10:15:00Z", 2),
      price("2026-10-28T10:30:00Z", 3),
      price("2026-10-28T10:45:00Z", 6),
      price("2026-10-28T11:00:00Z", 0.5),
    ]);
    expect(hours).toEqual([
      {
        start: new Date("2026-10-28T10:00:00Z"),
        intervalLength: "hour",
        priceArea: "DK1",
        priceDkkPerKwh: 3,
      },
      {
        start: new Date("2026-10-28T11:00:00Z"),
        intervalLength: "hour",
        priceArea: "DK1",
        priceDkkPerKwh: 0.5,
      },
    ]);
  });

  it("returns hours in time order even if the input is not sorted", () => {
    const hours = averagePricesByHour([
      price("2026-10-28T12:00:00Z", 1),
      price("2026-10-28T10:00:00Z", 1),
    ]);
    expect(hours.map((h) => h.start.getUTCHours())).toEqual([10, 12]);
  });

  it("returns nothing for no data", () => {
    expect(averagePricesByHour([])).toEqual([]);
  });
});

describe("averageCo2ByHour", () => {
  it("averages 5-minute values and marks an hour with any forecast as forecast", () => {
    const [hour] = averageCo2ByHour([
      co2("2026-10-28T17:00:00Z", 60),
      co2("2026-10-28T17:05:00Z", 80),
      co2("2026-10-28T17:10:00Z", 100, true),
    ]);
    expect(hour.co2GramPerKwh).toBe(80);
    expect(hour.isForecast).toBe(true);
    expect(hour.intervalLength).toBe("hour");
  });
});
