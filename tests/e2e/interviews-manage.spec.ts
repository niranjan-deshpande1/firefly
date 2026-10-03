// Interview requests and the manage page. Read-only: opens the dialogs and closes them without saving.
import { expect, test, type Page } from "@playwright/test";

async function signInAs(page: Page, name: string) {
  await page.context().clearCookies();
  await page.goto("/signin");
  await page.getByRole("button", { name: `continue as ${name}` }).click();
  await expect(page).not.toHaveURL(/\/signin/);
}

test("an organizer sees company requests and can open reschedule and cancel", async ({ page }) => {
  await signInAs(page, "Sam Okafor");
  await page.goto("/interviews/requests");
  await expect(page.getByRole("heading", { name: "interview requests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "schedule", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "decline", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "decline this request" })).toBeVisible();
  await page.getByRole("button", { name: "keep the request" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.goto("/interviews");
  await page.getByRole("link", { name: "reschedule or cancel" }).first().click();
  await expect(page.getByRole("heading", { name: /manage the interview with/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "save the new time" })).toBeVisible();
  await page.getByRole("button", { name: "cancel interview" }).click();
  await expect(page.getByRole("dialog", { name: "cancel this interview" })).toBeVisible();
});

test("a reviewer can't open interview requests", async ({ page }) => {
  await signInAs(page, "Priya Natarajan");
  await page.goto("/interviews/requests");
  await expect(page.getByRole("heading", { name: "this page does not exist" })).toBeVisible();
});
