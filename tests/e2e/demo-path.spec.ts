// The eight demo steps from docs/build/demo-script.md, against a fresh `npm run demo:reset`.
// Steps run in order and share state (step 4 advances Maya, step 5 verifies her, step 6 hires her).
// Selectors use roles and accessible names from the brief and contracts; pages owned by other
// builders may need small selector updates at integration.
import { expect, test, type Page } from "@playwright/test";

const MAYA_CODE = "9824"; // blindCodeFor("demo-candidate"), see prisma/seed/people.ts

async function signInAs(page: Page, name: string) {
  await page.context().clearCookies();
  await page.goto("/signin");
  await page.getByRole("button", { name: `continue as ${name}` }).click();
  await expect(page).not.toHaveURL(/\/signin/);
}

const main = (page: Page) => page.getByRole("main");

test.describe.configure({ mode: "serial" });

test("1. visitor browses to the hiring cohort and the finished hackathon with winners", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/hackathons");
  await main(page).getByRole("link", { name: /Fall Builders Cohort/ }).first().click();
  await expect(page).toHaveURL(/\/hackathons\/fall-builders-cohort/);
  await expect(page.getByRole("heading", { level: 1, name: /Fall Builders Cohort/i })).toBeVisible();
  await expect(main(page).getByText(/hiring cohort/i).first()).toBeVisible();

  await page.goto("/hackathons");
  await main(page).getByRole("link", { name: /Open Build Weekend/ }).first().click();
  await expect(page).toHaveURL(/\/hackathons\/open-build-weekend/);
  await page.getByRole("link", { name: /^prizes$/i }).click();
  await expect(main(page).getByText(/Patchwork/)).toBeVisible();
  await expect(main(page).getByText(/Transit Gaps/)).toBeVisible();
  await expect(main(page).getByText(/awarded/i).first()).toBeVisible();
});

test("2. Northwind opens the Founding Engineer intake and enrolls in a cohort", async ({ page }) => {
  await signInAs(page, "Jordan Reyes");
  await expect(page).toHaveURL(/\/company$/);
  await expect(main(page).getByText(/Northwind Labs/).first()).toBeVisible();

  await main(page).getByRole("link", { name: /Founding Engineer/ }).first().click();
  await expect(main(page).getByText(/ships end to end/)).toBeVisible();
  await expect(main(page).getByText(/data correctness/)).toBeVisible();

  await main(page).getByRole("link", { name: "enroll in another hiring cohort" }).click();
  await page.getByRole("radio", { name: /Winter Builders Cohort/ }).click();
  await page.getByRole("button", { name: "enroll Founding Engineer" }).click();
  await page.getByRole("button", { name: /enroll and issue the \$1,000 invoice/ }).click();

  await expect(main(page).getByRole("status")).toContainText(/invoice FF-\d{4}-\d{4} created, \$1,000, non-refundable/);

  await page.goto("/company/billing");
  await expect(main(page).getByText(/Winter Builders Cohort/)).toBeVisible();
});

test("3. Maya sees cohort progress, her project and the evidence locker", async ({ page }) => {
  await signInAs(page, "Maya Chen");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(main(page).getByText(/Fall Builders Cohort/).first()).toBeVisible();
  await expect(main(page).getByText(/check-in/i).first()).toBeVisible();

  await page.goto("/projects/proj-maya");
  await expect(page.getByRole("heading", { level: 1, name: "Reschedule Desk" })).toBeVisible();

  await page.goto("/projects/proj-maya/evidence");
  await expect(main(page).getByText(/test: reschedule across the DST change/)).toBeVisible();
  await expect(main(page).getByText(/designing the slot claim/).first()).toBeVisible();
  await expect(main(page).getByText(/Unique constraint on provider and start time/).first()).toBeVisible();
  await expect(main(page).getByText(/week 2/i).first()).toBeVisible();
  await expect(main(page).getByText(/what the evidence shows/i)).toBeVisible();
});

test("4. Priya scores blind, reconciles the flagged gap and advances Maya", async ({ page }) => {
  await signInAs(page, "Priya Natarajan");
  await expect(page).toHaveURL(/\/review/);
  await expect(main(page).getByText(new RegExp(`candidate ${MAYA_CODE}`, "i")).first()).toBeVisible();
  await expect(main(page).getByText("Maya Chen")).toHaveCount(0);

  await main(page).getByRole("link", { name: new RegExp(MAYA_CODE) }).first().click();
  await expect(page).toHaveURL(/\/review\/proj-maya$/);
  await expect(main(page).getByText("Maya Chen")).toHaveCount(0);

  // Every score group: choose a level, write a rationale, link one piece of evidence.
  const groups = main(page).getByRole("group").filter({ has: page.getByRole("radiogroup") });
  const count = await groups.count();
  expect(count).toBeGreaterThanOrEqual(6);
  for (let i = 0; i < count; i++) {
    const group = groups.nth(i);
    const name = await group.getByRole("heading", { level: 3 }).innerText();
    const level = /technical decisions/i.test(name) ? "4" : "3";
    await group.getByRole("radio", { name: new RegExp(`^${level} `) }).click();
    await group.getByRole("textbox", { name: /rationale/ }).fill("Evidence linked; see the attached item.");
    await group.getByText("link evidence").click();
    await group.getByRole("checkbox").first().click();
  }
  await main(page).getByRole("button", { name: "post review" }).click();
  await expect(main(page).getByRole("button", { name: "reveal identity" })).toBeVisible();

  await main(page).getByRole("link", { name: /calibrat/i }).first().click();
  await expect(page).toHaveURL(/\/review\/calibration\/proj-maya$/);
  await expect(main(page).getByRole("heading", { level: 3, name: /technical decisions/i })).toBeVisible();
  await main(page).getByRole("textbox", { name: /reconciliation note/ }).fill("The decision log names the alternative and the downside for the lock. Settled on 3.");
  await main(page).getByRole("button", { name: /save note|update note/ }).click();
  await expect(main(page).getByRole("button", { name: "update note" })).toBeVisible();

  await main(page).getByRole("radio", { name: /^advance / }).click();
  await main(page).getByRole("textbox", { name: "reason (required)" }).fill("Evidence shows she catches AI errors and tests first; ready for a defense.");
  await main(page).getByRole("button", { name: "record decision" }).click();
  await expect(main(page).getByText(/advance/i).first()).toBeVisible();
  await expect(main(page).getByRole("textbox", { name: "reason (required)" })).toHaveValue("");
});

test("5. Priya runs the defense interview and the project becomes verified", async ({ page }) => {
  await signInAs(page, "Priya Natarajan");
  await page.goto("/interviews");
  await main(page).getByRole("link", { name: /Maya Chen/ }).first().click();

  await expect(page).toHaveURL(/\/interviews\/interview-maya$/);

  await main(page).getByRole("checkbox", { name: /the photo ID matches Maya Chen/ }).click();
  await main(page).getByRole("button", { name: "confirm identity" }).click();
  for (const section of ["1. walkthrough", "2. what breaks if", "3. live change", "4. planted bug", "5. product questions"]) {
    const region = main(page).getByRole("region", { name: section });
    await region.getByRole("radio", { name: /^4 / }).click();
    await region.getByRole("textbox", { name: "notes (required)" }).fill("Explained it clearly and checked the result.");
    await region.getByRole("button", { name: "save score" }).click();
    await expect(region.getByRole("button", { name: /save score|update score/ })).toBeEnabled();
  }
  await main(page).getByRole("radio", { name: /^defense passed/ }).click();
  await main(page).getByRole("textbox", { name: "outcome notes (required)" }).fill("Walked through the code, fixed the planted bug and explained the tradeoffs.");
  await main(page).getByRole("button", { name: "complete interview" }).click();
  await expect(main(page).getByText(/verified/i).first()).toBeVisible();
  await expect(main(page).getByRole("button", { name: "complete interview" })).toHaveCount(0);
});

test("6. Jordan opens the shortlist and report, then reports a $140,000 hire", async ({ page }) => {
  await signInAs(page, "Jordan Reyes");
  await main(page).getByRole("link", { name: /shortlist/i }).first().click();
  await main(page).getByRole("link", { name: /Maya Chen/ }).first().click();
  await expect(main(page).getByText(/verified/i).first()).toBeVisible();
  await expect(main(page).getByText(/comprehension and ownership/i).first()).toBeVisible();

  await main(page).getByRole("link", { name: /report a hire/i }).or(main(page).getByRole("button", { name: /report a hire/i })).first().click();
  await page.getByLabel(/candidate/i).selectOption({ label: "Maya Chen (Reschedule Desk)" });
  await page.getByLabel(/salary/i).fill("140000");
  await page.getByLabel(/start date/i).fill(new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10));
  await page.getByRole("button", { name: /report (the )?hire/i }).last().click();
  await expect(page.getByRole("heading", { name: /hire reported: Maya Chen/ })).toBeVisible();
  await expect(page.getByText(/\$7,000/).first()).toBeVisible();
});

test("7. Alex sees the funnel, the report view in the audit log, the email log and invoices", async ({ page }) => {
  await signInAs(page, "Alex Morgan");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1, name: "how firefly is doing" })).toBeVisible();
  await expect(main(page).getByText("builder signups").first()).toBeVisible();
  await expect(main(page).getByText("hires").first()).toBeVisible();
  await expect(main(page).getByText("invoiced", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "audit log" }).first().click();
  await page.getByLabel("action").selectOption("REPORT_VIEW");
  await page.getByRole("button", { name: "filter log" }).click();
  await expect(page).toHaveURL(/action=REPORT_VIEW/);
  const firstEntry = main(page).locator("ol > li").first();
  await expect(firstEntry).toContainText("candidate report viewed");
  await expect(firstEntry).toContainText("Jordan Reyes");
  await expect(firstEntry).toContainText("Maya Chen");

  await page.getByRole("link", { name: "email log" }).click();
  await expect(main(page).getByText(/invoice FF-\d{4}-0007 from firefly/)).toBeVisible();

  await page.getByRole("link", { name: "invoices" }).first().click();
  await page.waitForLoadState("networkidle"); // the mark paid button needs hydration
  const northwind = main(page).getByRole("row").filter({ hasText: /FF-\d{4}-0001/ });
  await expect(northwind).toContainText("non-refundable");
  await expect(main(page).getByRole("button", { name: /refund/i })).toHaveCount(0);
  await northwind.getByRole("button", { name: /mark paid/ }).click();
  await expect(northwind.getByText("paid", { exact: true })).toBeVisible();
  await expect(main(page).getByRole("row").filter({ hasText: /\$7,000/ })).toBeVisible();
});

test("8. Theo, a finisher who wasn't hired, sees feedback and the talent pool prompt", async ({ page }) => {
  await signInAs(page, "Theo Grant");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(main(page).getByText(/receipt line that two people share unevenly/)).toBeVisible();
  await expect(main(page).getByRole("link", { name: /talent pool/i }).first()).toHaveAttribute("href", /\/settings#talent-pool/);
});
