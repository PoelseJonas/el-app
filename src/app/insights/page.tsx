import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";

// Placeholder until insights are built in phase 3.
export default async function InsightsPage() {
  const t = await getTranslations("insights");
  return (
    <>
      <PageHeader title={t("title")} />
      <p className="text-body text-muted-foreground">{t("placeholder")}</p>
    </>
  );
}
