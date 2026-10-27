import { PageHeader } from "@/components/layout/page-header";

// Placeholder until the "I dag" overview is built in phase 1.
// TODO: move texts to the dictionary when next-intl is set up.
export default function TodayPage() {
  return (
    <>
      <PageHeader title="I dag" />
      <p className="text-body text-muted-foreground">
        Her kommer elpris og CO2-udledning time for time.
      </p>
    </>
  );
}
