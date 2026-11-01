import { expect, test } from "@playwright/test";

test("switches the language in settings and remembers it", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Indstillinger",
  );

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Settings");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // The choice is a cookie, so it survives a new page load.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Today");
});
