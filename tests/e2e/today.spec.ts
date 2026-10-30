import { expect, test } from "@playwright/test";
// The same saved response the fixture server answers with.
import prices from "../fixtures/energidata/day-ahead-prices.json" with { type: "json" };

// The fixtures are from 28.10.2026, so "now" is never inside them: these tests check the
// hourly data, which does not depend on the clock, not the "right now" box or best hours.

/** The mean of the first hour's four quarters, in kr./kWh with a decimal comma: "1,16". */
function expectedFirstHourPrice(): string {
  const quarters = prices.records.slice(0, 4).map((r) => r.DayAheadPriceDKK);
  const meanDkkPerMwh = quarters.reduce((a, b) => a + b) / quarters.length;
  return (meanDkkPerMwh / 1000).toFixed(2).replace(".", ",");
}

test("says that the price is only the spot price", async ({ page }) => {
  // Arrange
  const note = "Spotpris uden nettarif, afgifter og moms.";

  // Act
  await page.goto("/");

  // Assert
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("I dag");
  await expect(page.getByText(note)).toBeVisible();
});

test("shows only the hours from the fixture server", async ({ page }) => {
  // Arrange: header row + the 2 hours in the fixture. The real API would give a whole day,
  // so this also proves the app used the fixture server.
  const expectedRows = 3;

  // Act
  await page.goto("/");

  // Assert
  // The chart's table version (for screen readers) holds the same numbers as the bars.
  const table = page.getByRole("table", { name: "Spotpris pr. time i dag" });
  await expect(table.getByRole("row")).toHaveCount(expectedRows);
});

test("shows the hourly spot price in Danish time and format", async ({
  page,
}) => {
  // Arrange: 11:00-12:00 UTC is 12-13 in Danish winter time.
  const expectedPrice = `${expectedFirstHourPrice()} kr./kWh`;

  // Act
  await page.goto("/");

  // Assert
  const table = page.getByRole("table", { name: "Spotpris pr. time i dag" });
  const row = table.getByRole("row").filter({ hasText: "kl. 12-13" });
  await expect(row).toContainText(expectedPrice);
});
