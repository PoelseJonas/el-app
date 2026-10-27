// Picks the language for each request. The language is not part of the URL:
// 1) the choice saved in settings (cookie), 2) the browser's language, 3) Danish.
// next-intl's plugin in next.config.ts finds this file by its path.

import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName } from "./config";

export default getRequestConfig(async () => {
  const saved = (await cookies()).get(localeCookieName)?.value;
  // "da-DK,da;q=0.9,en;q=0.8" -> "da". Only the first, preferred language is used.
  const browser = (await headers()).get("accept-language")?.slice(0, 2);

  const locale = isLocale(saved)
    ? saved
    : isLocale(browser)
      ? browser
      : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
