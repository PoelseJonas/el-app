// Interfaces every data source implements. Services depend on these, never on a
// concrete source, so a source can be swapped (API, CSV, demo) or faked in tests.
// Concrete sources will be chosen in one place: src/lib/sources/index.ts.

import type {
  Co2Point,
  ConsumptionPoint,
  DateRange,
  MeteringPoint,
  PriceArea,
  PricePoint,
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
  /** The meters this source can read. Mirrors Eloverblik: list meters first, then fetch data. */
  getMeteringPoints(): Promise<MeteringPoint[]>;
  /** Returns an empty array, not an error, when there is no data for the range. */
  getConsumption(
    range: DateRange,
    meteringPointId: string,
  ): Promise<ConsumptionPoint[]>;
}
