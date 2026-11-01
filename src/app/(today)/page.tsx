import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { BestHoursList } from "@/components/features/prices/best-hours-list";
import { DayCharts } from "@/components/features/prices/day-charts";
import { getEnergyFormat } from "@/components/features/prices/energy-format";
import { NowSummary } from "@/components/features/prices/now-summary";
import { PageHeader } from "@/components/layout/page-header";
import { getEnv } from "@/lib/config/env";
import {
  getDayOverview,
  type HourOverview,
} from "@/lib/services/get-day-overview";
import { dayRange } from "@/lib/utils/time";
import { cachedCo2Source, cachedPriceSource } from "../cached-sources";

/** "I dag": price and CO2 now, per hour today, and the best hours that are left. */
export default async function TodayPage() {
  // "Now" differs per request, so wait for the request before reading the clock.
  await connection();
  const now = new Date();
  const t = await getTranslations("today");
  const format = await getEnergyFormat();

  const overview = await getDayOverview(
    { priceSource: cachedPriceSource, co2Source: cachedCo2Source },
    getEnv().PRICE_AREA,
    dayRange(now),
    now,
  );

  const listItems = (
    hours: HourOverview[],
    value: (h: HourOverview) => string,
  ) =>
    hours.map((hour) => ({
      key: hour.start.toISOString(),
      label: format.hourRange(hour.start),
      valueLabel: value(hour),
    }));

  return (
    <>
      <PageHeader title={t("title")} />
      {overview.hours.length === 0 ? (
        <p className="text-body text-muted-foreground">{t("noData")}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {overview.currentHour && <NowSummary hour={overview.currentHour} />}
          <div className="grid gap-6 sm:grid-cols-2">
            <BestHoursList
              title={t("cheapestHours")}
              emptyText={t("noHoursLeft")}
              items={listItems(overview.cheapestHours, (h) =>
                format.price(h.priceDkkPerKwh!),
              )}
            />
            <BestHoursList
              title={t("greenestHours")}
              emptyText={t("noHoursLeft")}
              items={listItems(overview.greenestHours, (h) =>
                format.co2(h.co2GramPerKwh!),
              )}
            />
          </div>
          <DayCharts
            hours={overview.hours}
            cheapestHours={overview.cheapestHours}
            greenestHours={overview.greenestHours}
            currentHour={overview.currentHour}
          />
        </div>
      )}
    </>
  );
}
