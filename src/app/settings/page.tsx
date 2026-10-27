import { PageHeader } from "@/components/layout/page-header";

// Placeholder until settings (language, price area, data source, theme) are built.
// TODO: move texts to the dictionary when next-intl is set up.
export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Indstillinger" />
      <p className="text-body text-muted-foreground">
        Her kan du vælge sprog, prisområde og datakilde.
      </p>
    </>
  );
}
