// zod schemas for the raw Energi Data Service responses. Only the fields we use are listed;
// zod ignores the rest. Field names and units are from the API's own metadata
// (https://api.energidataservice.dk/meta/dataset/<name>), checked 28.10.2026.

import { z } from "zod";

/** "2026-10-28T11:00:00": UTC, but without "Z" or an offset. */
const utcTimestamp = z.iso.datetime({ local: true });
const priceArea = z.enum(["DK1", "DK2"]);

/** DayAheadPrices: spot price per 15 minutes, in DKK per MWh. */
export const dayAheadPricesResponseSchema = z.object({
  records: z.array(
    z.object({
      TimeUTC: utcTimestamp,
      PriceArea: priceArea,
      DayAheadPriceDKK: z.number(),
    }),
  ),
});
export type DayAheadPricesResponse = z.infer<
  typeof dayAheadPricesResponseSchema
>;

/** CO2Emis (measured) and CO2EmisProg (forecast) share this shape: g CO2 per kWh per 5 minutes. */
export const co2EmissionsResponseSchema = z.object({
  records: z.array(
    z.object({
      Minutes5UTC: utcTimestamp,
      PriceArea: priceArea,
      CO2Emission: z.number(),
    }),
  ),
});
export type Co2EmissionsResponse = z.infer<typeof co2EmissionsResponseSchema>;
