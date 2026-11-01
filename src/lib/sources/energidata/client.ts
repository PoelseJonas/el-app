// Energi Data Service (Energinet): open API for spot prices and CO2, no key needed.
// See docs/datakilder.md. The client only fetches; schemas.ts validates and mapper.ts
// converts (one job per file).

import type { Co2Source, PriceSource } from "@/lib/domain/sources";
import type { DateRange, PriceArea } from "@/lib/domain/types";
import { SourceUnavailableError } from "@/lib/domain/errors";
import type { z } from "zod";
import {
  mapCo2Emissions,
  mapDayAheadPrices,
  mergeMeasuredAndForecast,
} from "./mapper";
import {
  co2EmissionsResponseSchema,
  dayAheadPricesResponseSchema,
} from "./schemas";

const DEFAULT_BASE_URL = "https://api.energidataservice.dk";

/** The UTC time column of each dataset, used for sorting. */
const TIME_COLUMNS = {
  DayAheadPrices: "TimeUTC",
  CO2Emis: "Minutes5UTC",
  CO2EmisProg: "Minutes5UTC",
} as const;

type Dataset = keyof typeof TIME_COLUMNS;

export type Fetch = typeof fetch;

/**
 * Both can be swapped, so tests never call the real API: unit tests pass a fake `fetch`,
 * the Playwright tests a `baseUrl` pointing at a local server with saved responses.
 */
export interface EnergiDataOptions {
  fetch?: Fetch;
  /** Without a trailing slash. Defaults to the real API. */
  baseUrl?: string;
}

/** "2026-10-28T23:00" in UTC: the format the API takes for `start` and `end`. */
function toApiTime(date: Date): string {
  return date.toISOString().slice(0, 16);
}

export function buildDatasetUrl(
  baseUrl: string,
  dataset: Dataset,
  range: DateRange,
  area: PriceArea,
): string {
  const params = new URLSearchParams({
    start: toApiTime(range.start),
    // Like DateRange, the API includes `start` and excludes `end`.
    end: toApiTime(range.end),
    filter: JSON.stringify({ PriceArea: [area] }),
    sort: `${TIME_COLUMNS[dataset]} asc`,
    // Without this the API reads start/end as Danish time (checked 28.10.2026).
    timezone: "UTC",
  });
  return `${baseUrl}/dataset/${dataset}?${params}`;
}

/** Fetches one dataset and validates it, so callers get typed data or a SourceUnavailableError. */
async function fetchDataset<T>(
  { fetch: fetchFn = fetch, baseUrl = DEFAULT_BASE_URL }: EnergiDataOptions,
  dataset: Dataset,
  schema: z.ZodType<T>,
  range: DateRange,
  area: PriceArea,
): Promise<T> {
  const source = `energidata/${dataset}`;
  let response: Response;
  try {
    response = await fetchFn(buildDatasetUrl(baseUrl, dataset, range, area));
  } catch (error) {
    throw new SourceUnavailableError(source, "network", undefined, {
      cause: error,
    });
  }
  if (!response.ok) {
    throw new SourceUnavailableError(source, "http", response.status);
  }

  const result = schema.safeParse(await response.json());
  if (!result.success) {
    throw new SourceUnavailableError(source, "invalid-response", undefined, {
      cause: result.error,
    });
  }
  return result.data;
}

/** Spot prices (DayAheadPrices) in DKK/kWh per 15 minutes. */
export function createEnergiDataPriceSource(
  options: EnergiDataOptions = {},
): PriceSource {
  return {
    async getPrices(range, area) {
      const response = await fetchDataset(
        options,
        "DayAheadPrices",
        dayAheadPricesResponseSchema,
        range,
        area,
      );
      return mapDayAheadPrices(response);
    },
  };
}

/**
 * CO2 per 5 minutes: measured values (CO2Emis) up to now and the forecast (CO2EmisProg) for
 * the rest of the range, so "today" and "tomorrow" are both covered.
 */
export function createEnergiDataCo2Source(
  options: EnergiDataOptions = {},
): Co2Source {
  return {
    async getCo2(range, area) {
      const [measured, forecast] = await Promise.all([
        fetchDataset(
          options,
          "CO2Emis",
          co2EmissionsResponseSchema,
          range,
          area,
        ),
        fetchDataset(
          options,
          "CO2EmisProg",
          co2EmissionsResponseSchema,
          range,
          area,
        ),
      ]);
      return mergeMeasuredAndForecast(
        mapCo2Emissions(measured, false),
        mapCo2Emissions(forecast, true),
      );
    },
  };
}
