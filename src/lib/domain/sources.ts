// Interfaces every data source implements. Services depend on these, never on a
// concrete source, so a source can be swapped (API, CSV, demo) or faked in tests.
// Concrete sources will be chosen in one place: src/lib/sources/index.ts.

import type {
  Co2Point,
  ConsumptionPoint,
  DateRange,
  PriceArea,
  PricePoint,
  Utility,
} from "./types";

export interface PriceSource {
  getPrices(range: DateRange, area: PriceArea): Promise<PricePoint[]>;
}

export interface Co2Source {
  getCo2(range: DateRange, area: PriceArea): Promise<Co2Point[]>;
}

export interface ConsumptionSource {
  /** Stable identifier, e.g. "eloverblik" or "demo". */
  id: string;
  /** Name shown in settings (Danish). */
  label: string;
  utilities: readonly Utility[];
  /** Returns an empty array, not an error, when there is no data for the range. */
  getConsumption(
    range: DateRange,
    utility: Utility,
  ): Promise<ConsumptionPoint[]>;
}
