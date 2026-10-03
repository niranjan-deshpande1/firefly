import { expect, test } from "@playwright/test";

test("demo sign-in lands a builder on their dashboard", async ({ page }) => {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { level: 1, name: "sign in to firefly" })).toBeVisible();

  await page.getByRole("button", { name: "continue as Maya Chen" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1, name: "your dashboard" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "primary" }).getByRole("link", { name: "home" }).first()).toHaveAttribute("aria-current", "page");
});

test("a builder cannot open the admin area", async ({ page }) => {
  await page.goto("/signin");
  await page.getByRole("button", { name: "continue as Maya Chen" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
});

test("signed-out visitors are sent to sign in from protected pages", async ({ page }) => {
  await page.goto("/review");
  await expect(page).toHaveURL(/\/signin/);
});
