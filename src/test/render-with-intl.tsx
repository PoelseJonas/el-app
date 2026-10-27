import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import type { Locale } from "@/i18n/config";
import da from "@/i18n/messages/da.json";
import en from "@/i18n/messages/en.json";

const messages = { da, en } as const;

/** Renders a component the way the app does: inside next-intl's provider (Danish by default). */
export function renderWithIntl(ui: ReactElement, locale: Locale = "da") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {ui}
    </NextIntlClientProvider>,
  );
}
