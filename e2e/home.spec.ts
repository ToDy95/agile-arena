import { expect, test } from "@playwright/test";

test("home page renders lobby actions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Agile Arena" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join room" })).toBeVisible();
});
