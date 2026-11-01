import { expect, test } from "@playwright/test";

test("switches the language in settings", async ({ page }) => {
  // Arrange
  await page.goto("/settings");

  // Act
  await page.getByRole("button", { name: "English" }).click();

  // Assert
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Settings");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("remembers the language on the next page load", async ({ page }) => {
  // Arrange
  await page.goto("/settings");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // Act: the choice is a cookie, so it should survive a new page load.
  await page.goto("/");

  // Assert
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Today");
});
