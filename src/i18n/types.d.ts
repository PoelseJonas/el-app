// Tells next-intl which languages and keys exist, so t("nav.usgae") is a type error.
// da.json is the source of truth; a test checks that en.json has the same keys.

import type da from "./messages/da.json";
import type { Locale } from "./config";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof da;
  }
}
