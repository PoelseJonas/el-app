import { PageHeader } from "@/components/layout/page-header";

// Placeholder until insights are built in phase 3.
// TODO: move texts to the dictionary when next-intl is set up.
export default function InsightsPage() {
  return (
    <>
      <PageHeader title="Indsigt" />
      <p className="text-body text-muted-foreground">
        Her kommer dine dyreste og mest beskidte timer.
      </p>
    </>
  );
}
