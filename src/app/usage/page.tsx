import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";

// Placeholder until consumption is built in phase 2.
export default async function UsagePage() {
  const t = await getTranslations("usage");
  return (
    <>
      <PageHeader title={t("title")} />
      <p className="text-body text-muted-foreground">{t("placeholder")}</p>
    </>
  );
}
