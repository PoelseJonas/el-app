import { PageHeader } from "@/components/layout/page-header";

// Placeholder until consumption is built in phase 2.
// TODO: move texts to the dictionary when next-intl is set up.
export default function UsagePage() {
  return (
    <>
      <PageHeader title="Forbrug" />
      <p className="text-body text-muted-foreground">
        Her kommer dit forbrug pr. time for de sidste 7 dage.
      </p>
    </>
  );
}
