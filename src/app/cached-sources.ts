// The app's price and CO2 sources wrapped in Next.js' cache ("use cache"), so the external API
// is not called on every page view. This lives in app/ because caching is Next.js-specific
// and src/lib/ must stay framework-free. Services still only see the PriceSource/Co2Source
// interfaces and do not know about the cache.

import { cacheLife } from "next/cache";
import type { Co2Source, PriceSource } from "@/lib/domain/sources";
import type { DateRange, PriceArea } from "@/lib/domain/types";
import { co2Source, priceSource } from "@/lib/sources";

async function getCachedPrices(range: DateRange, area: PriceArea) {
  "use cache";
  // Spot prices for a day are published once, the day before, so they rarely change.
  cacheLife("hours");
  return priceSource.getPrices(range, area);
}

async function getCachedCo2(range: DateRange, area: PriceArea) {
  "use cache";
  // Measured CO2 gets a new value every 5 minutes.
  cacheLife("minutes");
  return co2Source.getCo2(range, area);
}

export const cachedPriceSource: PriceSource = { getPrices: getCachedPrices };
export const cachedCo2Source: Co2Source = { getCo2: getCachedCo2 };
