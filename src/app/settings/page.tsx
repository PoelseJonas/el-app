import { getLocale, getTranslations } from "next-intl/server";
import { getSavedTheme } from "@/components/layout/get-saved-theme";
import { PageHeader } from "@/components/layout/page-header";
import { themes } from "@/components/layout/theme";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { locales } from "@/i18n/config";
import { setLocale, setTheme } from "./actions";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const locale = await getLocale();
  const theme = await getSavedTheme();

  // Each language is named in its own language ("Dansk", "English"), so it can be found
  // even when the UI is in a language the user does not read.
  const languageOptions = locales.map((value) => ({
    value,
    label: t(`language.${value}`),
  }));
  const themeOptions = themes.map((value) => ({
    value,
    label: t(`theme.${value}`),
  }));

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="flex flex-col gap-6">
        <SegmentedControl
          action={setLocale}
          name="locale"
          legend={t("language.label")}
          value={locale}
          options={languageOptions}
        />
        <SegmentedControl
          action={setTheme}
          name="theme"
          legend={t("theme.label")}
          value={theme}
          options={themeOptions}
        />
      </div>
    </>
  );
}
