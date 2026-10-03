// Brief step 4.5: permission checks by hand, kept as tests. A denied page renders the 404 view
// (not a 403), so a person can't learn that the resource exists. Pages with a loading.tsx stream,
// so their status is already 200 when notFound() runs; the check is on what renders.
import { expect, test, type Page } from "@playwright/test";

async function signInAs(page: Page, name: string) {
  await page.context().clearCookies();
  await page.goto("/signin");
  await page.getByRole("button", { name: `continue as ${name}` }).click();
  await expect(page).not.toHaveURL(/\/signin/);
}

async function expectNotFound(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "This page could not be found." }), path).toBeVisible();
}

test("a company can't open another company's role, shortlist or candidate report", async ({ page }) => {
  await signInAs(page, "Jordan Reyes"); // Northwind Labs
  // Aisha is on Northwind's shortlist too, so this checks the report is scoped to the role, not the person.
  await expectNotFound(page, "/company/reports/role-harbor-backend/cand-aisha");
  await expectNotFound(page, "/company/roles/role-harbor-backend");
  await expectNotFound(page, "/company/roles/role-harbor-backend/shortlist");
  // Its own report for the same candidate opens.
  const own = await page.goto("/company/reports/role-northwind-founding/cand-aisha");
  expect(own?.status()).toBe(200);
});

test("a reviewer can't open a project they aren't assigned to", async ({ page }) => {
  await signInAs(page, "Priya Natarajan");
  await expectNotFound(page, "/review/proj-camila");
  await expectNotFound(page, "/review/calibration/proj-camila");
  await expectNotFound(page, "/projects/proj-camila/evidence");
});

test("a builder can't see other builders' reviews, evidence or reports", async ({ page }) => {
  await signInAs(page, "Maya Chen");
  await expectNotFound(page, "/projects/proj-aisha/evidence");
  await expectNotFound(page, "/review/proj-aisha");
  await expectNotFound(page, "/review/calibration/proj-aisha");
  await expectNotFound(page, "/company/reports/role-northwind-founding/cand-aisha");
  await expectNotFound(page, "/admin/audit");
  // Her own locker opens.
  const own = await page.goto("/projects/proj-maya/evidence");
  expect(own?.status()).toBe(200);
});

test("signed-out visitors can't reach evidence or reports", async ({ page }) => {
  await page.goto("/projects/proj-maya/evidence");
  await expect(page).toHaveURL(/\/signin/);
  await page.goto("/company/reports/role-northwind-founding/cand-aisha");
  await expect(page).toHaveURL(/\/signin/);
});
