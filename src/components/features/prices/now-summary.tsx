import { getTranslations } from "next-intl/server";
import type { HourOverview } from "@/lib/services/get-day-overview";
import { getEnergyFormat } from "./energy-format";

/** Shown when the current hour has no value, e.g. before the prices are published. */
const NO_VALUE = "–";

/** Price and CO2 for the current hour, so "is it cheap and green now?" is answered at a glance. */
export async function NowSummary({ hour }: { hour: HourOverview }) {
  const t = await getTranslations("today");
  const format = await getEnergyFormat();

  const price =
    hour.priceDkkPerKwh === undefined
      ? NO_VALUE
      : format.price(hour.priceDkkPerKwh);
  const co2 =
    hour.co2GramPerKwh === undefined
      ? NO_VALUE
      : format.co2(hour.co2GramPerKwh);

  return (
    <section aria-labelledby="now-heading">
      <h2
        id="now-heading"
        className="mb-2 text-footnote text-muted-foreground uppercase"
      >
        {t("now")} · {format.hourRange(hour.start)}
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        <Stat label={t("spotPrice")} value={price} />
        <Stat label={t("co2")} value={co2} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <dt className="text-subheadline text-muted-foreground">{label}</dt>
      <dd className="text-headline tabular-nums sm:text-title-3">{value}</dd>
    </div>
  );
}
