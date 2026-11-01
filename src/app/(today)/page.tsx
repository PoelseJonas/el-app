import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { BestHoursSection } from "@/components/features/prices/best-hours-section";
import { DayCharts } from "@/components/features/prices/day-charts";
import { NowSummary } from "@/components/features/prices/now-summary";
import { PageHeader } from "@/components/layout/page-header";
import { getEnv } from "@/lib/config/env";
import {
  getDayOverview,
  type DayOverview,
} from "@/lib/services/get-day-overview";
import { dayRange } from "@/lib/utils/time";
import { cachedCo2Source, cachedPriceSource } from "../cached-sources";

// #region Page

/** "I dag": price and CO2 now, the best hours that are left, and price and CO2 per hour. */
export default async function TodayPage() {
  const t = await getTranslations("today");
  const overview = await loadTodayOverview();
  const hasData = overview.hours.length > 0;

  return (
    <>
      <PageHeader title={t("title")} />
      {hasData ? (
        <TodayContent overview={overview} />
      ) : (
        <p className="text-body text-muted-foreground">{t("noData")}</p>
      )}
    </>
  );
}

function TodayContent({ overview }: { overview: DayOverview }) {
  return (
    <div className="flex flex-col gap-8">
      {overview.currentHour && <NowSummary hour={overview.currentHour} />}
      <BestHoursSection
        cheapestHours={overview.cheapestHours}
        greenestHours={overview.greenestHours}
      />
      <DayCharts
        hours={overview.hours}
        cheapestHours={overview.cheapestHours}
        greenestHours={overview.greenestHours}
        currentHour={overview.currentHour}
      />
    </div>
  );
}

// #endregion

// #region Data

async function loadTodayOverview(): Promise<DayOverview> {
  // "Now" differs per request, so wait for the request before reading the clock.
  await connection();
  const now = new Date();

  return getDayOverview(
    { priceSource: cachedPriceSource, co2Source: cachedCo2Source },
    getEnv().PRICE_AREA,
    dayRange(now),
    now,
  );
}

// #endregion
