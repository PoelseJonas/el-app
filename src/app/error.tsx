"use client";
// Error boundaries must be Client Components. Covers every page below the root layout.
// A source being down (SourceUnavailableError) is the expected case here.

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function PageError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <p className="text-body">{t("sourceUnavailable")}</p>
      {/* retry() fetches and renders the page again (Next.js 16; older versions called it reset). */}
      <Button onClick={() => retry()} size="lg">
        {t("retry")}
      </Button>
    </div>
  );
}
