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

const BASE_URL = "https://api.energidataservice.dk/dataset";

/** The UTC time column of each dataset, used for sorting. */
const TIME_COLUMNS = {
  DayAheadPrices: "TimeUTC",
  CO2Emis: "Minutes5UTC",
  CO2EmisProg: "Minutes5UTC",
} as const;

type Dataset = keyof typeof TIME_COLUMNS;

/** `fetch` is passed in, so tests can answer with saved responses instead of calling the API. */
export type Fetch = typeof fetch;

/** "2026-10-28T23:00" in UTC: the format the API takes for `start` and `end`. */
function toApiTime(date: Date): string {
  return date.toISOString().slice(0, 16);
}

export function buildDatasetUrl(
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
  return `${BASE_URL}/${dataset}?${params}`;
}

/** Fetches one dataset and validates it, so callers get typed data or a SourceUnavailableError. */
async function fetchDataset<T>(
  fetchFn: Fetch,
  dataset: Dataset,
  schema: z.ZodType<T>,
  range: DateRange,
  area: PriceArea,
): Promise<T> {
  const source = `energidata/${dataset}`;
  let response: Response;
  try {
    response = await fetchFn(buildDatasetUrl(dataset, range, area));
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
  fetchFn: Fetch = fetch,
): PriceSource {
  return {
    async getPrices(range, area) {
      const response = await fetchDataset(
        fetchFn,
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
export function createEnergiDataCo2Source(fetchFn: Fetch = fetch): Co2Source {
  return {
    async getCo2(range, area) {
      const [measured, forecast] = await Promise.all([
        fetchDataset(
          fetchFn,
          "CO2Emis",
          co2EmissionsResponseSchema,
          range,
          area,
        ),
        fetchDataset(
          fetchFn,
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
