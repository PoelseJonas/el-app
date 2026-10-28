// Composition root: the one place that decides which concrete sources the app uses.
// Everything else depends on the interfaces in src/lib/domain/sources.ts.

import type { Co2Source, PriceSource } from "@/lib/domain/sources";
import {
  createEnergiDataCo2Source,
  createEnergiDataPriceSource,
} from "./energidata/client";

export const priceSource: PriceSource = createEnergiDataPriceSource();
export const co2Source: Co2Source = createEnergiDataCo2Source();
