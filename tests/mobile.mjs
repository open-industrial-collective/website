import { countLabel } from "./catalog-counts.mjs";
import { chromium, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
const engines =
  process.env.OIC_BROWSER === "chromium"
    ? [chromium]
    : process.env.OIC_BROWSER === "webkit"
      ? [webkit]
      : [chromium, webkit];
const base = process.env.OIC_BASE_URL || "http://127.0.0.1:4173";
const showcase = JSON.parse(
  await readFile(
    new URL("../src/catalog.generated.json", import.meta.url),
    "utf8",
  ),
).find((project) => project.id === "dimension-engine-showcase");
const [firstImage, secondImage] = showcase.profile.media.filter(
  (media) => media.type === "image",
);
assert.ok(
  firstImage && secondImage,
  "Gallery switching needs two approved images",
);
const routes = [
  "/",
  "/explore",
  "/explore/glossary",
  "/community",
  "/about",
  "/guide",
  "/charter",
  "/how-it-works",
  "/platforms",
  "/share",
  "/projects/dimension-engine-showcase",

  "/projects/visual-toolkit",
  "/missing-page",
];
const headers = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
).headers[0].headers;
await mkdir(new URL("../qa/mobile/", import.meta.url), { recursive: true });
for (const engine of engines) {
  const name = engine.name();
  const browser = await engine.launch(
    name === "chromium" && !process.env.CI ? { channel: "chrome" } : {},
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
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
  await page.goto(base);
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.tap();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await menu.tap();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Explore tools" })
    .tap();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeHidden();
  await expect(
    page.getByRole("searchbox", { name: "Search catalog" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("checkbox", { name: "Open source", exact: false }),
  ).toBeHidden();
  await page.getByRole("searchbox", { name: "Search catalog" }).fill("symbols");
  await expect(page.getByRole("status")).toHaveText(/1 tool/);
  await page.getByRole("button", { name: "Filters", exact: true }).tap();
  await page
    .getByRole("dialog", { name: "Filters", exact: true })
    .getByRole("checkbox", { name: "Open source", exact: false })
    .check();
  await page.getByRole("button", { name: "Show 1 result", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "Filters 1", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Filters 1", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("link", { name: "Visual Toolkit", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all", exact: true }).tap();
  await expect(page.getByRole("status")).toHaveText(countLabel());
  await page
    .getByRole("searchbox", { name: "Search catalog" })
    .fill("no-such-tool");
  await expect(
    page.getByRole("heading", { name: "No tools match just yet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).tap();
  await page
    .getByRole("link", { name: "Dimension Engine Showcase", exact: true })
    .tap();
  await expect(
    page.getByRole("link", { name: /Open browser preview/ }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: secondImage.title, exact: true })
    .tap();
  await expect(
    page.getByRole("button", { name: secondImage.title, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Expand product screenshot" }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.body).overflow),
    "hidden",
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(
    page.getByRole("button", { name: "Close screenshot" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Close screenshot" }).tap();
  await expect(
    page.getByRole("button", { name: "Expand product screenshot" }),
  ).toBeFocused();
  await menu.tap();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Share a project" })
    .tap();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("textbox", { name: "Project name", exact: true })
    .fill("Phone draft");
  await page.getByRole("link", { name: "Preview & save ↓", exact: true }).tap();
  await expect(page.locator("#listing-preview")).toBeFocused();
  await page
    .getByRole("link", { name: "↑ Back to editing", exact: true })
    .tap();
  await expect(
    page.getByRole("textbox", { name: "Project name", exact: true }),
  ).toHaveValue("Phone draft");
  await page.getByLabel("Open YAML file").setInputFiles({
    name: "project.yaml",
    mimeType: "text/yaml",
    buffer: Buffer.from(
      (
        await readFile(
          new URL("../public/templates/project-v2.yaml", import.meta.url),
          "utf8",
        )
      ).replaceAll(
        "https://example.org",
        "https://github.com/open-industrial-collective/website",
      ),
    ),
  });
  await page.getByRole("link", { name: "Preview & save ↓", exact: true }).tap();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download project.yaml" }).tap();
  assert.equal((await download).suggestedFilename(), "project.yaml");
  await page
    .getByRole("link", { name: "↑ Back to editing", exact: true })
    .tap();
  await page.getByRole("button", { name: "Simple form", exact: true }).tap();
  await expect(
    page.getByRole("textbox", { name: "Project name", exact: true }),
  ).not.toHaveValue("Phone draft");
  const widths =
    name === "chromium"
      ? [320, 360, 390, 430, 600, 768, 844, 900, 1024, 1440]
      : [320, 390, 768, 844];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    for (const route of routes) {
      await page.goto(base + route);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${name} overflow ${width} ${route}`,
      );
      const smallInputs = await page
        .locator("input:not([type=file]),select,textarea")
        .evaluateAll((elements) =>
          elements
            .filter(
              (e) =>
                e.getBoundingClientRect().width &&
                parseFloat(getComputedStyle(e).fontSize) < 16,
            )
            .map((e) => e.getAttribute("aria-label") || e.id),
        );
      if (width <= 900)
        assert.deepEqual(
          smallInputs,
          [],
          `${name} zoom-prone inputs ${width} ${route}`,
        );
      const smallButtons = await page
        .locator("button")
        .evaluateAll((elements) =>
          elements
            .filter(
              (e) =>
                e.getBoundingClientRect().width &&
                e.getBoundingClientRect().height < 43.5,
            )
            .map((e) => e.textContent || e.getAttribute("aria-label")),
        );
      if (width <= 900)
        assert.deepEqual(
          smallButtons,
          [],
          `${name} small buttons ${width} ${route}`,
        );
      if ([320, 390, 768, 1440].includes(width))
        await page.screenshot({
          path: new URL(
            `../qa/mobile/${name}-${width}-${route.replaceAll("/", "_") || "home"}.png`,
            import.meta.url,
          ).pathname,
          fullPage: true,
          animations: "disabled",
        });
    }
    if (width <= 900) {
      await menu.tap();
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
    }
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    `${name}: touch workflows, ${routes.length} routes at ${widths.join("/")}px, readable inputs, touch targets, no overflow or runtime errors passed.`,
  );
}
