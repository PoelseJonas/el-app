// Everything the "I dag" page needs for one day: price and CO2 per hour, the current hour,
// and the cheapest and greenest hours that are still ahead. Sources are passed in, so the
// service does not know (or care) whether data comes from the API, a cache or a test fake.

import { lowestHours } from "@/lib/calc/best-hours";
import { averageCo2ByHour, averagePricesByHour } from "@/lib/calc/hourly";
import type { Co2Source, PriceSource } from "@/lib/domain/sources";
import type { DateRange, PriceArea } from "@/lib/domain/types";
import { startOfHour } from "@/lib/utils/time";

/** One hour of the day. A value is missing if the source had none for that hour. */
export interface HourOverview {
  start: Date;
  priceDkkPerKwh?: number;
  co2GramPerKwh?: number;
  /** True if the CO2 value is (partly) a forecast. */
  co2IsForecast: boolean;
}

export interface DayOverview {
  /** All hours in the day that have a price or a CO2 value, in time order. */
  hours: HourOverview[];
  /** The hour containing `now`, if it is part of the day. */
  currentHour?: HourOverview;
  /** Lowest price among the current and later hours, in time order. */
  cheapestHours: HourOverview[];
  /** Lowest CO2 among the current and later hours, in time order. */
  greenestHours: HourOverview[];
}

/** How many best hours to show. Few on purpose (Hick's law, docs/design.md). */
const BEST_HOURS_COUNT = 3;

export async function getDayOverview(
  sources: { priceSource: PriceSource; co2Source: Co2Source },
  area: PriceArea,
  day: DateRange,
  now: Date,
): Promise<DayOverview> {
  const [prices, co2] = await Promise.all([
    sources.priceSource.getPrices(day, area),
    sources.co2Source.getCo2(day, area),
  ]);

  const hours = new Map<number, HourOverview>();
  const hourAt = (start: Date) => {
    const key = start.getTime();
    const hour = hours.get(key) ?? { start, co2IsForecast: false };
    hours.set(key, hour);
    return hour;
  };
  for (const price of averagePricesByHour(prices)) {
    hourAt(price.start).priceDkkPerKwh = price.priceDkkPerKwh;
  }
  for (const value of averageCo2ByHour(co2)) {
    const hour = hourAt(value.start);
    hour.co2GramPerKwh = value.co2GramPerKwh;
    hour.co2IsForecast = value.isForecast;
  }

  const sorted = [...hours.values()].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  const currentStart = startOfHour(now).getTime();
  // Past hours cannot be used any more, so only the current and later hours are suggested.
  const remaining = sorted.filter(
    (hour) => hour.start.getTime() >= currentStart,
  );

  return {
    hours: sorted,
    currentHour: sorted.find((hour) => hour.start.getTime() === currentStart),
    cheapestHours: lowestHours(
      remaining.filter((hour) => hour.priceDkkPerKwh !== undefined),
      (hour) => hour.priceDkkPerKwh!,
      BEST_HOURS_COUNT,
    ),
    greenestHours: lowestHours(
      remaining.filter((hour) => hour.co2GramPerKwh !== undefined),
      (hour) => hour.co2GramPerKwh!,
      BEST_HOURS_COUNT,
    ),
  };
}
