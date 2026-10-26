// The app's own data types. Every source maps its raw API format into these,
// so components and calculations never depend on how an external API looks.
// All timestamps are UTC; conversion to Europe/Copenhagen happens only when displaying.
// Concepts and relations are described in docs/domain-model.md; keep the two in sync.

/** Danish bidding zones: DK1 = Jutland and Funen, DK2 = Zealand and islands. */
export type PriceArea = "DK1" | "DK2";

export type Utility = "electricity" | "heating" | "hotWater" | "coldWater";

/** Length of the interval a data point covers. */
export type Resolution = "5min" | "15min" | "hour" | "day" | "month";

/** Half-open interval: `start` is included, `end` is not. */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Spot price for one interval, converted from DKK/MWh. Excludes tariffs, taxes and VAT. */
export interface PricePoint {
  start: Date;
  resolution: Resolution;
  priceArea: PriceArea;
  priceDkkPerKwh: number;
}

/** CO2 intensity of the grid for one interval. */
export interface Co2Point {
  start: Date;
  resolution: Resolution;
  priceArea: PriceArea;
  co2GramPerKwh: number;
  /** True for forecasts (used for "best hours tomorrow"), false for measured values. */
  isForecast: boolean;
}

export type ConsumptionUnit = "kWh" | "m3" | "heatUnits";

/** A meter in DataHub (or a demo/CSV stand-in). Measures exactly one utility. */
export interface MeteringPoint {
  /** 18-digit DataHub ID. Personal data: never log it or put a real one in fixtures. */
  id: string;
  utility: Utility;
  /** Name shown in the UI, e.g. an address or "Demo". */
  label: string;
  /** Unknown for demo/CSV data; then the price area chosen in settings is used. */
  priceArea?: PriceArea;
}

/**
 * Metered consumption for one interval. Generic over utilities, so the unit is a field
 * rather than part of the name. Only electricity in kWh is combined with prices and CO2.
 */
export interface ConsumptionPoint {
  meteringPointId: string;
  start: Date;
  resolution: Resolution;
  quantity: number;
  unit: ConsumptionUnit;
}
