import { getTranslations } from "next-intl/server";
import type { HourOverview } from "@/lib/services/get-day-overview";
import { getEnergyFormat } from "./energy-format";

/** Price and CO2 for the current hour, large, so "is it cheap and green now?" is answered at a glance. */
export async function NowSummary({ hour }: { hour: HourOverview }) {
  const t = await getTranslations("today");
  const format = await getEnergyFormat();

  const stats = [
    {
      label: t("spotPrice"),
      value:
        hour.priceDkkPerKwh === undefined
          ? undefined
          : format.price(hour.priceDkkPerKwh),
    },
    {
      label: t("co2"),
      value:
        hour.co2GramPerKwh === undefined
          ? undefined
          : format.co2(hour.co2GramPerKwh),
    },
  ];

  return (
    <section aria-labelledby="now-heading">
      <h2
        id="now-heading"
        className="mb-2 text-footnote text-muted-foreground uppercase"
      >
        {t("now")} · {format.hourRange(hour.start)}
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-muted/60 p-4">
            <dt className="text-subheadline text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="text-headline tabular-nums sm:text-title-3">
              {stat.value ?? "–"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
