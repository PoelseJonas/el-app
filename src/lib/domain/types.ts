// The app's own data types. Every source maps its raw API format into these,
// so components and calculations never depend on how an external API looks.
// All timestamps are UTC; conversion to Europe/Copenhagen happens only when displaying.
// Concepts and relations are described in docs/domain-model.md; keep the two in sync.

/** Danish bidding zones: DK1 = Jutland and Funen, DK2 = Zealand and islands. */
export type PriceArea = "DK1" | "DK2";

/** What a meter measures. Only electricity can be combined with prices and CO2. */
export type ConsumptionType =
  "electricity" | "heating" | "hotWater" | "coldWater";

/** How long a period one data point covers, e.g. "15min" for a 15-minute price. */
export type IntervalLength = "5min" | "15min" | "hour" | "day" | "month";

/** Half-open interval: `start` is included, `end` is not. */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Spot price for one interval, converted from DKK/MWh. Excludes tariffs, taxes and VAT. */
export interface PricePoint {
  start: Date;
  intervalLength: IntervalLength;
  priceArea: PriceArea;
  priceDkkPerKwh: number;
}

/** CO2 intensity of the grid for one interval. */
export interface Co2Point {
  start: Date;
  intervalLength: IntervalLength;
  priceArea: PriceArea;
  co2GramPerKwh: number;
  /** True for forecasts (used for "best hours tomorrow"), false for measured values. */
  isForecast: boolean;
}

export type ConsumptionUnit = "kWh" | "m3" | "heatUnits";

/** A meter in DataHub (or a demo/CSV stand-in). Measures exactly one consumption type. */
export interface MeteringPoint {
  /** 18-digit DataHub ID. Personal data: never log it or put a real one in fixtures. */
  id: string;
  consumptionType: ConsumptionType;
  /** Name shown in the UI, e.g. an address or "Demo". */
  label: string;
  /** Unknown for demo/CSV data; then the price area chosen in settings is used. */
  priceArea?: PriceArea;
}

/**
 * Metered consumption for one interval. Covers all consumption types, so the unit is a field
 * rather than part of the name. Only electricity in kWh is combined with prices and CO2.
 */
export interface ConsumptionPoint {
  meteringPointId: string;
  start: Date;
  intervalLength: IntervalLength;
  quantity: number;
  unit: ConsumptionUnit;
}
