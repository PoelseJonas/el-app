// Everything the "I dag" page needs for one day: price and CO2 per hour, the current hour,
// and the cheapest and greenest hours that are still ahead. Sources are passed in, so the
// service does not know (or care) whether data comes from the API, a cache or a test fake.

import { lowestHours } from "@/lib/calc/best-hours";
import { averageCo2ByHour, averagePricesByHour } from "@/lib/calc/hourly";
import type { Co2Source, PriceSource } from "@/lib/domain/sources";
import type {
  Co2Point,
  DateRange,
  PriceArea,
  PricePoint,
} from "@/lib/domain/types";
import { startOfHour } from "@/lib/utils/time";

// #region Types

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

export interface DaySources {
  priceSource: PriceSource;
  co2Source: Co2Source;
}

// #endregion

// #region Public API

/** How many best hours to show. Few on purpose (Hick's law, docs/design.md). */
const BEST_HOURS_COUNT = 3;

export async function getDayOverview(
  sources: DaySources,
  area: PriceArea,
  day: DateRange,
  now: Date,
): Promise<DayOverview> {
  const { prices, co2 } = await fetchDay(sources, area, day);
  const hours = combineByHour(
    averagePricesByHour(prices),
    averageCo2ByHour(co2),
  );
  const hoursLeft = hoursFromCurrentHour(hours, now);

  return {
    hours,
    currentHour: findHourContaining(hours, now),
    cheapestHours: lowestHours(
      hoursLeft.filter(hasPrice),
      (hour) => hour.priceDkkPerKwh,
      BEST_HOURS_COUNT,
    ),
    greenestHours: lowestHours(
      hoursLeft.filter(hasCo2),
      (hour) => hour.co2GramPerKwh,
      BEST_HOURS_COUNT,
    ),
  };
}

/** True if the hour has a price. Lets TypeScript know `priceDkkPerKwh` is a number after it. */
export function hasPrice(
  hour: HourOverview,
): hour is HourOverview & { priceDkkPerKwh: number } {
  return hour.priceDkkPerKwh !== undefined;
}

/** True if the hour has a CO2 value. Lets TypeScript know `co2GramPerKwh` is a number after it. */
export function hasCo2(
  hour: HourOverview,
): hour is HourOverview & { co2GramPerKwh: number } {
  return hour.co2GramPerKwh !== undefined;
}

// #endregion

// #region Helpers

async function fetchDay(sources: DaySources, area: PriceArea, day: DateRange) {
  const [prices, co2] = await Promise.all([
    sources.priceSource.getPrices(day, area),
    sources.co2Source.getCo2(day, area),
  ]);
  return { prices, co2 };
}

/** One HourOverview per hour that has a price, a CO2 value or both, in time order. */
function combineByHour(
  hourlyPrices: PricePoint[],
  hourlyCo2: Co2Point[],
): HourOverview[] {
  const hourStarts = uniqueStarts([...hourlyPrices, ...hourlyCo2]);

  return hourStarts.map((start) => {
    const price = hourlyPrices.find((point) => sameTime(point.start, start));
    const co2 = hourlyCo2.find((point) => sameTime(point.start, start));
    return {
      start,
      priceDkkPerKwh: price?.priceDkkPerKwh,
      co2GramPerKwh: co2?.co2GramPerKwh,
      co2IsForecast: co2?.isForecast ?? false,
    };
  });
}

/** Past hours cannot be used any more, so only the current and later hours are suggested. */
function hoursFromCurrentHour(
  hours: HourOverview[],
  now: Date,
): HourOverview[] {
  const currentHourStart = startOfHour(now).getTime();
  return hours.filter((hour) => hour.start.getTime() >= currentHourStart);
}

function findHourContaining(
  hours: HourOverview[],
  now: Date,
): HourOverview | undefined {
  return hours.find((hour) => sameTime(hour.start, startOfHour(now)));
}

/** The distinct start times, earliest first. */
function uniqueStarts(points: { start: Date }[]): Date[] {
  const uniqueTimes = [
    ...new Set(points.map((point) => point.start.getTime())),
  ];
  const earliestFirst = uniqueTimes.sort((a, b) => a - b);
  return earliestFirst.map((time) => new Date(time));
}

function sameTime(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

// #endregion
