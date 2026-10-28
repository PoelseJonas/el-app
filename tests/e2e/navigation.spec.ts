import { expect, test } from "@playwright/test";

// Runs on desktop (TopNav) and mobile (BottomNav). Only the visible menu can be clicked,
// so the same test checks whichever one the screen size shows.
test("moves between the sections with the menu", async ({ page }) => {
  await page.goto("/");
  const menu = page
    .getByRole("navigation", { name: "Hovedmenu" })
    .filter({ visible: true });

  await menu.getByRole("link", { name: "Forbrug" }).click();
  await expect(page).toHaveURL("/usage");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Forbrug");

  await menu.getByRole("link", { name: "Indstillinger" }).click();
  await expect(page).toHaveURL("/settings");
  await expect(
    menu.getByRole("link", { name: "Indstillinger" }),
  ).toHaveAttribute("aria-current", "page");
});
