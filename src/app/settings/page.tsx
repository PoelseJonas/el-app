import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { locales } from "@/i18n/config";
import { setLocale } from "./actions";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const locale = await getLocale();

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="flex flex-col gap-6">
        <SegmentedControl
          action={setLocale}
          name="locale"
          legend={t("language.label")}
          value={locale}
          // Each language is named in its own language, so it can be found when the UI is
          // in a language the user does not read.
          options={locales.map((value) => ({
            value,
            label: t(`language.${value}`),
          }))}
        />
      </div>
    </>
  );
}
