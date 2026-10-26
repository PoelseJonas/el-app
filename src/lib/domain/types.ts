// The app's own data types. Every source maps its raw API format into these,
// so components and calculations never depend on how an external API looks.
// All timestamps are UTC; conversion to Europe/Copenhagen happens only when displaying.

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

/** Metered consumption for one interval. Only electricity in kWh is combined with prices. */
export interface ConsumptionPoint {
  utility: Utility;
  start: Date;
  resolution: Resolution;
  quantity: number;
  unit: ConsumptionUnit;
}
