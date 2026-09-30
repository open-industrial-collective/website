import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { catalog, countLabel, showResultsLabel } from "./catalog-counts.mjs";
const base = process.env.OIC_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base + "/explore");
await expect(page.getByRole("status")).toHaveText(countLabel());
await expect(page.getByText(/example listing/i)).toHaveCount(0);
await page.getByRole("button", { name: "Hide filters" }).click();
await expect(page.getByRole("button", { name: "Show filters" })).toHaveAttribute(
  "aria-expanded",
  "false",
);
await expect(page.locator("#desktop-filter-content")).toBeHidden();
await page.getByRole("button", { name: "Show filters" }).click();
await expect(page.locator("#desktop-filter-content")).toBeVisible();
await page.getByRole("checkbox", { name: "Open source", exact: false }).check();
await expect(page.getByRole("status")).toHaveText(
  countLabel((p) => p.source === "open-source"),
);
await expect(
  page.getByRole("checkbox", { name: "Open source", exact: false }),
).toBeFocused();
await page.getByRole("button", { name: "List view", exact: true }).click();
const shared = page.url();
await page.reload();
await expect(
  page.getByRole("button", { name: "List view", exact: true }),
).toHaveAttribute("aria-pressed", "true");
await page.getByRole("link", { name: "Visual Toolkit", exact: true }).click();
await page
  .getByRole("link", { name: "All tools", exact: true })
  .first()
  .click();
assert.equal(page.url(), shared);
await page.goBack();
await page.goBack();
await expect(
  page.getByRole("checkbox", { name: "Open source", exact: false }),
).toBeChecked();
await page.goto(
  base + "/explore?source=closed-source&works=Ignition+Perspective",
);
await expect(page.getByRole("status")).toHaveText("0 tools");
await expect(
  page.getByRole("button", { name: /Remove Closed source.*result/ }),
).toBeVisible();
await page
  .getByRole("button", { name: /Remove Closed source.*result/ })
  .click();
await expect(
  page.getByRole("link", { name: "Visual Toolkit", exact: true }),
).toBeVisible();
await page.goto(base + "/explore");
for (const p of catalog.slice(0, 3))
  await page
    .getByRole("button", { name: `Compare ${p.name}`, exact: true })
    .click();
await page.getByRole("button", { name: "Compare", exact: true }).click();
await expect(page.getByRole("dialog", { name: "Compare tools" })).toBeVisible();
await page.keyboard.press("Escape");
await expect(
  page.getByRole("button", { name: "Compare", exact: true }),
).toBeFocused();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "/explore?view=list");
await page.getByRole("button", { name: "Filters", exact: true }).click();
await page
  .getByRole("dialog")
  .getByRole("checkbox", { name: "Open source", exact: false })
  .check();
await page
  .getByRole("button", {
    name: showResultsLabel((p) => p.source === "open-source"),
    exact: true,
  })
  .click();
await expect(
  page.getByRole("button", { name: "Filters 1", exact: true }),
).toBeFocused();
await page
  .getByRole("link", { name: "Visual Toolkit", exact: true })
  .scrollIntoViewIfNeeded();
const scroll = await page.evaluate(() => window.scrollY);
await page.getByRole("link", { name: "Visual Toolkit", exact: true }).click();
await page.goBack();
await expect(
  page.getByRole("button", { name: "List view", exact: true }),
).toHaveAttribute("aria-pressed", "true");
await expect
  .poll(() => page.evaluate(() => window.scrollY))
  .toBeGreaterThanOrEqual(Math.max(0, scroll - 5));
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth + 1,
  ),
);
await page.goto(base + "/explore?source=closed-source");
await page
  .getByRole("button", { name: "Remove Closed source", exact: true })
  .click();
await expect(page).toHaveURL(base + "/explore");
await page.goBack();
await expect(
  page.getByRole("button", { name: "Remove Closed source", exact: true }),
).toBeVisible();
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Explore browser checks passed: URL history, return context, keyboard focus, recovery, comparison and mobile filters.",
);
