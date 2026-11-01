import { getTranslations } from "next-intl/server";
import { HourBarChart, type HourBar } from "@/components/charts/hour-bar-chart";
import type { HourOverview } from "@/lib/services/get-day-overview";
import { getEnergyFormat } from "./energy-format";

interface DayChartsProps {
  hours: HourOverview[];
  cheapestHours: HourOverview[];
  greenestHours: HourOverview[];
  currentHour?: HourOverview;
}

/** Price and CO2 per hour as two bar charts. The best hours get the accent colour. */
export async function DayCharts({
  hours,
  cheapestHours,
  greenestHours,
  currentHour,
}: DayChartsProps) {
  const t = await getTranslations("today");
  const format = await getEnergyFormat();

  const isIn = (list: HourOverview[], hour: HourOverview) =>
    list.some((item) => item.start.getTime() === hour.start.getTime());
  const baseBar = (hour: HourOverview) => ({
    key: hour.start.toISOString(),
    label: format.hour(hour.start),
    rangeLabel: format.hourRange(hour.start),
    current: hour.start.getTime() === currentHour?.start.getTime(),
  });

  const priceBars: HourBar[] = hours.flatMap((hour) =>
    hour.priceDkkPerKwh === undefined
      ? []
      : [
          {
            ...baseBar(hour),
            value: hour.priceDkkPerKwh,
            valueLabel: format.price(hour.priceDkkPerKwh),
            highlighted: isIn(cheapestHours, hour),
          },
        ],
  );
  const co2Bars: HourBar[] = hours.flatMap((hour) =>
    hour.co2GramPerKwh === undefined
      ? []
      : [
          {
            ...baseBar(hour),
            value: hour.co2GramPerKwh,
            valueLabel: format.co2(hour.co2GramPerKwh),
            highlighted: isIn(greenestHours, hour),
            muted: hour.co2IsForecast,
          },
        ],
  );

  return (
    <>
      <section>
        <h2 className="mb-2 text-headline">{t("priceChart")}</h2>
        <HourBarChart
          bars={priceBars}
          title={t("priceChart")}
          hourHeading={t("hourHeading")}
          valueHeading={t("spotPrice")}
        />
        {/* Honest about what the number is (docs/design.md, "Ærlighed om tal"). */}
        <p className="mt-1 text-footnote text-muted-foreground">
          {t("spotPriceNote")}
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-headline">{t("co2Chart")}</h2>
        <HourBarChart
          bars={co2Bars}
          title={t("co2Chart")}
          hourHeading={t("hourHeading")}
          valueHeading={t("co2")}
        />
        <p className="mt-1 text-footnote text-muted-foreground">
          {t("co2ForecastNote")}
        </p>
      </section>
    </>
  );
}
