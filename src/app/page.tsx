import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";

// Placeholder until the "I dag" overview is built in phase 1.
export default async function TodayPage() {
  const t = await getTranslations("today");
  return (
    <>
      <PageHeader title={t("title")} />
      <p className="text-body text-muted-foreground">{t("placeholder")}</p>
    </>
  );
}
