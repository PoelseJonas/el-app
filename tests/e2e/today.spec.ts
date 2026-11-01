import { expect, test } from "@playwright/test";
// The same saved response the fixture server answers with.
import prices from "../fixtures/energidata/day-ahead-prices.json" with { type: "json" };

// The fixtures are from 28.10.2026, so "now" is never inside them: the test checks the
// hourly data, which does not depend on the clock, not the "right now" box or best hours.
test("shows the spot price per hour from Energi Data Service", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("I dag");
  await expect(
    page.getByText("Spotpris uden nettarif, afgifter og moms."),
  ).toBeVisible();

  // 11:00-12:00 UTC is 12-13 in Danish winter time. Its price is the mean of the four
  // quarters in DKK/MWh, shown in kr./kWh with a decimal comma.
  const quarters = prices.records.slice(0, 4).map((r) => r.DayAheadPriceDKK);
  const expected = (quarters.reduce((a, b) => a + b) / 4 / 1000)
    .toFixed(2)
    .replace(".", ",");

  // The chart's table version (for screen readers) holds the same numbers as the bars.
  const table = page.getByRole("table", { name: "Spotpris pr. time i dag" });
  // Header + the 2 hours in the fixture. The real API would give a whole day, so this also
  // proves the app used the fixture server.
  await expect(table.getByRole("row")).toHaveCount(3);
  const row = table.getByRole("row").filter({ hasText: "kl. 12-13" });
  await expect(row).toContainText(`${expected} kr./kWh`);
});
