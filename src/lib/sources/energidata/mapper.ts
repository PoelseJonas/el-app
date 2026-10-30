// Turns validated Energi Data Service responses into the app's own types. After this point
// nothing in the app knows the API's field names.

import type { Co2Point, PricePoint } from "@/lib/domain/types";
import { compareByStart } from "@/lib/utils/time";
import { dkkPerMwhToDkkPerKwh } from "@/lib/utils/units";
import type { Co2EmissionsResponse, DayAheadPricesResponse } from "./schemas";

// #region Public API

/** Spot prices in DKK/kWh. DayAheadPrices has 15-minute intervals (dataset metadata: "PT15M"). */
export function mapDayAheadPrices(
  response: DayAheadPricesResponse,
): PricePoint[] {
  return response.records.map((record) => ({
    start: parseUtc(record.TimeUTC),
    intervalLength: "15min",
    priceArea: record.PriceArea,
    priceDkkPerKwh: dkkPerMwhToDkkPerKwh(record.DayAheadPriceDKK),
  }));
}

/** CO2 intensity in g/kWh. Both CO2 datasets have 5-minute intervals (metadata: "PT5M"). */
export function mapCo2Emissions(
  response: Co2EmissionsResponse,
  isForecast: boolean,
): Co2Point[] {
  return response.records.map((record) => ({
    start: parseUtc(record.Minutes5UTC),
    intervalLength: "5min",
    priceArea: record.PriceArea,
    co2GramPerKwh: record.CO2Emission,
    isForecast,
  }));
}

/**
 * Measured values where they exist, the forecast for the rest of the period (measured data
 * only reaches "now"). Sorted by start time.
 */
export function mergeMeasuredAndForecast(
  measured: Co2Point[],
  forecast: Co2Point[],
): Co2Point[] {
  const measuredTimes = new Set(measured.map((point) => point.start.getTime()));
  const notYetMeasured = forecast.filter(
    (point) => !measuredTimes.has(point.start.getTime()),
  );

  return [...measured, ...notYetMeasured].sort(compareByStart);
}

// #endregion

// #region Helpers

/** The API's UTC fields have no "Z", so `new Date()` would read them as local time. */
function parseUtc(timestamp: string): Date {
  return new Date(`${timestamp}Z`);
}

// #endregion
