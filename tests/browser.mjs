import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import { mkdir, readFile } from "node:fs/promises";
const base = process.env.OIC_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const headers = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
).headers[0].headers;
if (base.includes("127.0.0.1"))
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        ...Object.fromEntries(headers.map((h) => [h.key, h.value])),
      },
    });
  });
await mkdir(new URL("../qa/", import.meta.url), { recursive: true });
await page.goto(base);
await page.getByRole("heading", { name: /A better starting point/ }).waitFor();
await expect(
  page.getByRole("link", { name: "Dimension Engine Showcase", exact: true }),
).toBeVisible();
await expect(page.getByText("Browse 4 example listings")).toBeVisible();
await expect(page.getByRole("link", { name: /Open browser preview/ })).toHaveAttribute(
  "href",
  "https://dimension-engine-showcase.vercel.app/",
);
await page.getByRole("button", { name: "Process view", exact: true }).click();
await expect(
  page.getByRole("button", { name: "Process view", exact: true }),
).toHaveAttribute("aria-pressed", "true");
await expect(
  page.getByAltText(/^Dimension Engine's process view/),
).toBeVisible();
await page.getByRole("button", { name: "Spatial view", exact: true }).click();
await expect(
  page.getByAltText(/^Dimension Engine's spatial view/),
).toBeVisible();
await page.getByRole("button", { name: "Expand product screenshot" }).click();
await expect(
  page.getByRole("dialog", { name: "Spatial view screenshot" }),
).toBeVisible();
await page.keyboard.press("Escape");
await expect(page.getByRole("dialog")).toBeHidden();
await expect(
  page.getByRole("button", { name: "Expand product screenshot" }),
).toBeFocused();
await page.getByRole("button", { name: "Expand product screenshot" }).click();
await page.getByRole("button", { name: "Close screenshot" }).click();
await expect(page.getByRole("dialog")).toBeHidden();
await page.getByRole("link", { name: "Why OIC?", exact: true }).click();
await expect(page.locator("#why-oic")).toBeFocused();
await page.goto(base);

await expect(
  page.getByRole("link", { name: "Node-RED", exact: true }),
).toBeHidden();
await page.getByText("Browse 4 example listings").click();
await expect(
  page.getByRole("link", { name: "Node-RED", exact: true }),
).toBeVisible();
await page
  .getByRole("link", { name: "Dimension Engine Showcase", exact: true })
  .click();
await page.waitForURL("**/projects/dimension-engine-showcase");
await expect(
  page.getByText(/native Dimension Engine module is not available yet/).first(),
).toBeVisible();
assert.equal(
  await page
    .getByRole("link", { name: /Open browser preview/ })
    .getAttribute("href"),
  "https://dimension-engine-showcase.vercel.app/",
);
await page.goto(base);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: new URL("../qa/home-desktop.png", import.meta.url).pathname,
  fullPage: true,
  animations: "disabled",
});
await page
  .getByRole("textbox", { name: "Search tools", exact: true })
  .fill("MQTT");
await page.getByRole("button", { name: "Search", exact: true }).click();
await page.waitForURL("**/explore?q=MQTT");
await expect(page.getByRole("status")).toHaveText(/0 projects · 3 examples/);
await expect(
  page.getByRole("button", { name: "Operations", exact: false }),
).toHaveCount(0);
await page
  .getByRole("textbox", { name: "Search catalog" })
  .fill("no-matching-tool");
await expect(page.getByRole("status")).toHaveText(/0 projects/);
await page.getByRole("button", { name: "Clear filters" }).click();
await expect(page.getByRole("status")).toHaveText(/1 project · 4 examples/);
await expect(
  page
    .getByLabel("Source availability", { exact: true })
    .locator('option[value="closed-source"]'),
).toHaveCount(1);
await page
  .getByLabel("Source availability", { exact: true })
  .selectOption("closed-source");
await expect(page.getByRole("status")).toHaveText(/1 project/);
await expect(
  page.getByRole("link", { name: "Dimension Engine Showcase", exact: true }),
).toBeVisible();
await page
  .getByLabel("Source availability", { exact: true })
  .selectOption("source-available");
await expect(page.getByRole("status")).toHaveText(/0 projects · 1 example/);
await page.getByRole("link", { name: "MQTT Explorer", exact: true }).click();
await page
  .getByRole("heading", { name: "MQTT Explorer", exact: true })
  .waitFor();
await page.reload();
await page
  .getByRole("heading", { name: "MQTT Explorer", exact: true })
  .waitFor();
assert.equal(
  await page.getByRole("link", { name: /Get started/ }).getAttribute("href"),
  "https://mqtt-explorer.com",
);
await page.getByText("Suggest a correction", { exact: true }).click();
await page
  .getByLabel("What should change?", { exact: true })
  .fill("Clarify the license restrictions and link to the upstream terms.");
const correctionDownload = page.waitForEvent("download");
await page.getByRole("button", { name: "Download correction note" }).click();
assert.equal(
  (await correctionDownload).suggestedFilename(),
  "mqtt-explorer-correction.md",
);
await expect(page.getByRole("status")).toHaveText(
  "Downloaded. No report has been sent.",
);
await page.getByText("About this listing", { exact: true }).click();
await page.getByRole("link", { name: "What listing review means" }).click();
await page.waitForURL("**/guide#review");
await expect(
  page.getByRole("heading", { name: "A person reviews it" }),
).toBeInViewport();
await page.goto(base + "/platforms");
await expect(
  page.getByRole("img", { name: "Ignition by Inductive Automation®" }),
).toBeVisible();
await page.getByRole("link", { name: "Find these tools" }).click();
await expect(page.getByRole("status")).toHaveText(/1 project · 4 examples/);
await page.getByLabel("Runs on", { exact: true }).selectOption("Raspberry Pi");
await expect(page.getByRole("status")).toHaveText(/0 projects · 1 example/);
await expect(
  page.getByRole("link", { name: "Node-RED", exact: true }),
).toBeVisible();
await page.goto(base + "/how-it-works#quality");
await expect(
  page.getByRole("heading", { name: "What keeps the catalog useful?" }),
).toBeInViewport();
await page.goto(base + "/share");
await page.getByRole("button", { name: "Download project.yaml" }).waitFor();
await expect(
  page.getByRole("button", { name: "Download project.yaml" }),
).toBeDisabled();
await page
  .getByLabel("Open YAML file", { exact: true })
  .setInputFiles(
    new URL("../public/templates/project.yaml", import.meta.url).pathname,
  );
await page.getByRole("heading", { name: "Ready to export" }).waitFor();
await expect(
  page.getByRole("button", { name: "Download project.yaml" }),
).toBeEnabled();
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Download project.yaml" }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "project.yaml");
await page.getByRole("button", { name: "Simple form", exact: true }).click();
await page
  .getByRole("textbox", { name: "Project name" })
  .fill("Free Test Tool");
await page
  .getByRole("heading", { name: "Free Test Tool", exact: true })
  .waitFor();
await page
  .getByLabel("Software requirements", { exact: true })
  .selectOption("paid-platform-required");
await expect(page.locator(".preview-card")).toContainText(
  "Paid platform required",
);
await page.getByRole("button", { name: "Edit YAML", exact: true }).click();
assert.match(
  await page.getByLabel("Project YAML", { exact: true }).inputValue(),
  /Free Test Tool/,
);
// Rich profiles keep every optional field when edited through the simple form.
const richPath = new URL("../public/templates/project-v2.yaml", import.meta.url);
const originalRich = parse(await readFile(richPath, "utf8"));
await page.getByLabel("Open YAML file", { exact: true }).setInputFiles(richPath.pathname);
await expect(page.getByText(/repository files still need checking/)).toBeVisible();
await page.getByRole("button", { name: "Simple form", exact: true }).click();
await page.getByRole("textbox", { name: "Project name", exact: true }).fill("Independent Rich Tool");
await page.getByRole("button", { name: "Edit YAML", exact: true }).click();
assert.deepEqual(parse(await page.getByLabel("Project YAML", {exact:true}).inputValue()), {...originalRich, name:"Independent Rich Tool"});
await expect(page.getByRole("link", {name:/Request a listing/})).toHaveAttribute("href", "https://github.com/open-industrial-collective/website/issues/new?template=listing.yml");
await page
  .getByLabel("Project YAML", { exact: true })
  .fill("name: bad\nid: invalid\n");
await expect(
  page.getByRole("button", { name: "Download project.yaml" }),
).toBeDisabled();
await page.screenshot({
  path: new URL("../qa/share-desktop.png", import.meta.url).pathname,
  fullPage: true,
  animations: "disabled",
});
for (const path of [
  "/",
  "/explore",
  "/share",
  "/community",
  "/about",
  "/guide",
  "/platforms",
  "/how-it-works",
  "/projects/node-red",
  "/projects/dimension-engine-showcase",
  "/does-not-exist",
]) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + path);
  await page.locator("h1").waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    `overflow ${path}`,
  );
  if (path === "/") {
    await page.screenshot({
      path: new URL("../qa/home-mobile.png", import.meta.url).pathname,
      fullPage: true,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "People & join", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Made useful together." })
      .waitFor();
    await expect(page.getByRole("heading", { name: "Grindstone Systems" })).toBeVisible();
    await expect(page.getByText("Interim website and program stewardship")).toBeVisible();
  }
}
for (const width of [320, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const path of [
    "/",
    "/explore",
    "/projects/dimension-engine-showcase",
    "/how-it-works",
    "/platforms",
    "/about",
    "/community",
    "/share",
    "/guide",
  ]) {
    await page.goto(base + path);
    await page.locator("h1").waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `overflow ${width} ${path}`,
    );
    if (width === 1440 || width === 320)
      await page.screenshot({
        path: new URL(
          `../qa/${path.slice(1).replaceAll("/", "-") || "home"}-${width}.png`,
          import.meta.url,
        ).pathname,
        fullPage: true,
        animations: "disabled",
      });
  }
}
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Browser QA passed: desktop/mobile, navigation, filters, direct routes, YAML import/export, strict CSP, and no runtime errors.",
);
