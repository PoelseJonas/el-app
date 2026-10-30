// Brings 15-minute prices and 5-minute CO2 values to whole hours, so they can be shown and
// compared hour by hour (and combined with hourly consumption in phase 3).
//
// Method: simple mean of the intervals in each hour. The intervals within one hour are equally
// long, so this is the same as a time-weighted mean. Decided 28.10.2026 (docs/decisions.md).

import type { Co2Point, PricePoint } from "@/lib/domain/types";
import { compareByStart, startOfHour } from "@/lib/utils/time";

// #region Public API

/** Mean spot price per hour, in DKK/kWh. Hours in time order. */
export function averagePricesByHour(points: PricePoint[]): PricePoint[] {
  return groupByHour(points).map(toHourlyPrice);
}

/**
 * Mean CO2 per hour, in g/kWh. Hours in time order. An hour counts as a forecast if any of
 * its values is one, so a partly measured hour is not presented as fully measured.
 */
export function averageCo2ByHour(points: Co2Point[]): Co2Point[] {
  return groupByHour(points).map(toHourlyCo2);
}

// #endregion

// #region Helpers

function toHourlyPrice(quarters: PricePoint[]): PricePoint {
  const first = quarters[0];
  return {
    start: startOfHour(first.start),
    intervalLength: "hour",
    priceArea: first.priceArea,
    priceDkkPerKwh: mean(quarters.map((point) => point.priceDkkPerKwh)),
  };
}

function toHourlyCo2(intervals: Co2Point[]): Co2Point {
  const first = intervals[0];
  return {
    start: startOfHour(first.start),
    intervalLength: "hour",
    priceArea: first.priceArea,
    co2GramPerKwh: mean(intervals.map((point) => point.co2GramPerKwh)),
    isForecast: intervals.some((point) => point.isForecast),
  };
}

/** Groups points by the clock hour they start in. Groups come out in time order. */
function groupByHour<T extends { start: Date }>(points: T[]): T[][] {
  const groups = new Map<number, T[]>();

  // A Map keeps insertion order, so sorting the points first gives sorted groups.
  for (const point of [...points].sort(compareByStart)) {
    const hourKey = startOfHour(point.start).getTime();
    const group = groups.get(hourKey) ?? [];
    group.push(point);
    groups.set(hourKey, group);
  }

  return [...groups.values()];
}

function mean(values: number[]): number {
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
}

// #endregion
