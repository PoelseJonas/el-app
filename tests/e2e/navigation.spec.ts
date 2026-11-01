import { expect, test } from "@playwright/test";

// Runs on desktop (TopNav) and mobile (BottomNav). Only the visible menu can be clicked,
// so the same test checks whichever one the screen size shows.
test("opens a section from the menu", async ({ page }) => {
  // Arrange
  await page.goto("/");
  const menu = page
    .getByRole("navigation", { name: "Hovedmenu" })
    .filter({ visible: true });

  // Act
  await menu.getByRole("link", { name: "Forbrug" }).click();

  // Assert
  await expect(page).toHaveURL("/usage");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Forbrug");
});

test("marks the open section as current in the menu", async ({ page }) => {
  // Arrange
  await page.goto("/");
  const menu = page
    .getByRole("navigation", { name: "Hovedmenu" })
    .filter({ visible: true });

  // Act
  await menu.getByRole("link", { name: "Indstillinger" }).click();

  // Assert
  await expect(
    menu.getByRole("link", { name: "Indstillinger" }),
  ).toHaveAttribute("aria-current", "page");
});
