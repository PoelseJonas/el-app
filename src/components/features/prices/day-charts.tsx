import { getTranslations } from "next-intl/server";
import { HourBarChart, type HourBar } from "@/components/charts/hour-bar-chart";
import {
  hasCo2,
  hasPrice,
  type HourOverview,
} from "@/lib/services/get-day-overview";
import { getEnergyFormat, type EnergyFormat } from "./energy-format";

interface DayChartsProps {
  hours: HourOverview[];
  cheapestHours: HourOverview[];
  greenestHours: HourOverview[];
  currentHour?: HourOverview;
}

// #region Components

/** Price and CO2 per hour as two bar charts. The best hours get the accent colour. */
export async function DayCharts({
  hours,
  cheapestHours,
  greenestHours,
  currentHour,
}: DayChartsProps) {
  const t = await getTranslations("today");
  const format = await getEnergyFormat();

  const priceBars = hours.filter(hasPrice).map((hour) => ({
    ...hourLabels(hour, currentHour, format),
    value: hour.priceDkkPerKwh,
    valueLabel: format.price(hour.priceDkkPerKwh),
    highlighted: containsHour(cheapestHours, hour),
  }));
  const co2Bars = hours.filter(hasCo2).map((hour) => ({
    ...hourLabels(hour, currentHour, format),
    value: hour.co2GramPerKwh,
    valueLabel: format.co2(hour.co2GramPerKwh),
    highlighted: containsHour(greenestHours, hour),
    muted: hour.co2IsForecast,
  }));

  return (
    <>
      <ChartSection
        title={t("priceChart")}
        bars={priceBars}
        hourHeading={t("hourHeading")}
        valueHeading={t("spotPrice")}
        // Honest about what the number is (docs/design.md, "Ærlighed om tal").
        note={t("spotPriceNote")}
      />
      <ChartSection
        title={t("co2Chart")}
        bars={co2Bars}
        hourHeading={t("hourHeading")}
        valueHeading={t("co2")}
        note={t("co2ForecastNote")}
      />
    </>
  );
}

interface ChartSectionProps {
  title: string;
  bars: HourBar[];
  hourHeading: string;
  valueHeading: string;
  /** Small text under the chart. */
  note: string;
}

function ChartSection({
  title,
  bars,
  hourHeading,
  valueHeading,
  note,
}: ChartSectionProps) {
  return (
    <section>
      <h2 className="mb-2 text-headline">{title}</h2>
      <HourBarChart
        bars={bars}
        title={title}
        hourHeading={hourHeading}
        valueHeading={valueHeading}
      />
      <p className="mt-1 text-footnote text-muted-foreground">{note}</p>
    </section>
  );
}

// #endregion

// #region Helpers

/** The parts of a bar that are the same for price and CO2: key, labels and "is it now". */
function hourLabels(
  hour: HourOverview,
  currentHour: HourOverview | undefined,
  format: EnergyFormat,
) {
  return {
    key: hour.start.toISOString(),
    label: format.hour(hour.start),
    rangeLabel: format.hourRange(hour.start),
    current: hour.start.getTime() === currentHour?.start.getTime(),
  };
}

function containsHour(list: HourOverview[], hour: HourOverview): boolean {
  return list.some((item) => item.start.getTime() === hour.start.getTime());
}

// #endregion
