// Formatting for prices, CO2 and hours in the user's language and in Danish time
// (the time zone is set in src/i18n/request.ts). Server only: uses next-intl/server.

import { getFormatter, getTranslations } from "next-intl/server";
import { addHour } from "@/lib/utils/time";

/** The formatters returned by getEnergyFormat(), for helpers that receive them as an argument. */
export type EnergyFormat = Awaited<ReturnType<typeof getEnergyFormat>>;

export async function getEnergyFormat() {
  const format = await getFormatter();
  const tUnits = await getTranslations("units");
  const tToday = await getTranslations("today");

  // 24-hour clock in every language, as on Danish price sites (docs/design.md).
  const hour = (start: Date) =>
    format.dateTime(start, { hour: "2-digit", hourCycle: "h23" });

  return {
    /** "17" */
    hour,
    /** "kl. 17-18" */
    hourRange: (start: Date) =>
      tToday("hourRange", { from: hour(start), to: hour(addHour(start)) }),
    /** "1,16 kr./kWh": prices with 2 decimals (docs/design.md, "Ærlighed om tal"). */
    price: (priceDkkPerKwh: number) =>
      tUnits("dkkPerKwh", {
        value: format.number(priceDkkPerKwh, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }),
    /** "81 g CO2/kWh": CO2 in whole grams. */
    co2: (co2GramPerKwh: number) =>
      tUnits("gramCo2PerKwh", {
        value: format.number(co2GramPerKwh, { maximumFractionDigits: 0 }),
      }),
  };
}
