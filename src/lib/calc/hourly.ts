// Brings 15-minute prices and 5-minute CO2 values to whole hours, so they can be shown and
// compared hour by hour (and combined with hourly consumption in phase 3).
//
// Method: simple mean of the intervals in each hour. The intervals within one hour are equally
// long, so this is the same as a time-weighted mean. Decided 28.10.2026 (docs/decisions.md).

import type { Co2Point, PricePoint } from "@/lib/domain/types";
import { startOfHour } from "@/lib/utils/time";

/** Groups points by the clock hour they start in, keeping the hours in time order. */
function groupByHour<T extends { start: Date }>(points: T[]): T[][] {
  const groups = new Map<number, T[]>();
  for (const point of points) {
    const hour = startOfHour(point.start).getTime();
    groups.set(hour, [...(groups.get(hour) ?? []), point]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group);
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Mean spot price per hour, in DKK/kWh. */
export function averagePricesByHour(points: PricePoint[]): PricePoint[] {
  return groupByHour(points).map((group) => ({
    start: startOfHour(group[0].start),
    intervalLength: "hour",
    priceArea: group[0].priceArea,
    priceDkkPerKwh: mean(group.map((point) => point.priceDkkPerKwh)),
  }));
}

/**
 * Mean CO2 per hour, in g/kWh. An hour counts as a forecast if any of its values is one,
 * so a partly measured hour is not presented as fully measured.
 */
export function averageCo2ByHour(points: Co2Point[]): Co2Point[] {
  return groupByHour(points).map((group) => ({
    start: startOfHour(group[0].start),
    intervalLength: "hour",
    priceArea: group[0].priceArea,
    co2GramPerKwh: mean(group.map((point) => point.co2GramPerKwh)),
    isForecast: group.some((point) => point.isForecast),
  }));
}
