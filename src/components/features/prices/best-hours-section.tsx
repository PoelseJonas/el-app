import { getTranslations } from "next-intl/server";
import {
  hasCo2,
  hasPrice,
  type HourOverview,
} from "@/lib/services/get-day-overview";
import { BestHoursList } from "./best-hours-list";
import { getEnergyFormat } from "./energy-format";

interface BestHoursSectionProps {
  cheapestHours: HourOverview[];
  greenestHours: HourOverview[];
}

/** The cheapest and the greenest hours left today, side by side from `sm`. */
export async function BestHoursSection({
  cheapestHours,
  greenestHours,
}: BestHoursSectionProps) {
  const t = await getTranslations("today");
  const format = await getEnergyFormat();

  const cheapestItems = cheapestHours.filter(hasPrice).map((hour) => ({
    key: hour.start.toISOString(),
    label: format.hourRange(hour.start),
    valueLabel: format.price(hour.priceDkkPerKwh),
  }));
  const greenestItems = greenestHours.filter(hasCo2).map((hour) => ({
    key: hour.start.toISOString(),
    label: format.hourRange(hour.start),
    valueLabel: format.co2(hour.co2GramPerKwh),
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <BestHoursList
        title={t("cheapestHours")}
        emptyText={t("noHoursLeft")}
        items={cheapestItems}
      />
      <BestHoursList
        title={t("greenestHours")}
        emptyText={t("noHoursLeft")}
        items={greenestItems}
      />
    </div>
  );
}
