import { countLabel } from "./catalog-counts.mjs";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import { mkdir, readFile } from "node:fs/promises";
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
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
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
await page
  .getByRole("heading", { name: /Find the tool. Get to work./ })
  .waitFor();
await expect(
  page
    .getByRole("link", { name: "Dimension Engine Showcase", exact: true })
    .first(),
).toBeVisible();
await expect(page.getByText(/Browse .* example listings/)).toHaveCount(0);
await expect(
  page.getByRole("link", { name: /Open browser preview/ }),
).toHaveAttribute("href", "https://dimension-engine-showcase.vercel.app/");
await page
  .getByRole("button", { name: secondImage.title, exact: true })
  .click();
await expect(
  page.getByRole("button", { name: secondImage.title, exact: true }),
).toHaveAttribute("aria-pressed", "true");
await expect(page.getByAltText(secondImage.alt, { exact: true })).toBeVisible();
await page.getByRole("button", { name: firstImage.title, exact: true }).click();
await expect(page.getByAltText(firstImage.alt, { exact: true })).toBeVisible();
await page.getByRole("button", { name: "Next media" }).first().click();
await expect(page.getByAltText(secondImage.alt, { exact: true })).toBeVisible();
await page.locator(".showcase-screen").first().focus();
await page.keyboard.press("ArrowLeft");
await expect(page.getByAltText(firstImage.alt, { exact: true })).toBeVisible();
await page.getByRole("button", { name: "Expand product screenshot" }).click();
await expect(
  page.getByRole("dialog", { name: `${firstImage.title} screenshot` }),
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

await page
  .getByRole("link", { name: "Dimension Engine Showcase", exact: true })
  .first()
  .click();
await page.waitForURL("**/projects/dimension-engine-showcase");
await expect(
  page.getByText(showcase.cost_notes, { exact: false }).first(),
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
  .fill("symbols");
await page.getByRole("button", { name: "Search", exact: true }).click();
await page.waitForURL("**/explore?q=symbols");
await expect(page.getByRole("status")).toHaveText("1 tool");
await page
  .getByRole("searchbox", { name: "Search catalog" })
  .fill("no-matching-tool");
await expect(page.getByRole("status")).toHaveText("0 tools");
await page.getByRole("button", { name: "Clear all filters" }).click();
await expect(page.getByRole("status")).toHaveText(countLabel());
await page.getByRole("checkbox", { name: "Closed source" }).check();
await expect(page.getByRole("status")).toHaveText("1 tool");
await page.getByRole("checkbox", { name: "Closed source" }).uncheck();
await page.getByRole("checkbox", { name: "Open source", exact: false }).check();
await expect(page.getByRole("status")).toHaveText(
  countLabel((project) => project.source === "open-source"),
);
await page.getByRole("link", { name: "Visual Toolkit", exact: true }).click();
await page
  .getByRole("heading", { name: "Visual Toolkit", exact: true })
  .waitFor();
await page.reload();
await expect(
  page.getByRole("link", { name: /Open the builder/ }),
).toHaveAttribute(
  "href",
  "https://grindstone-systems.github.io/visual-toolkit/",
);
await page.getByText("Suggest a correction", { exact: true }).click();
await page
  .getByLabel("What should change?", { exact: true })
  .fill("Clarify the license restrictions and link to the upstream terms.");
const correctionDownload = page.waitForEvent("download");
await page.getByRole("button", { name: "Download correction note" }).click();
assert.equal(
  (await correctionDownload).suggestedFilename(),
  "visual-toolkit-correction.md",
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
await expect(page.getByRole("status")).toHaveText(countLabel());
await page.getByRole("checkbox", { name: "Ignition Perspective" }).check();
await expect(page.getByRole("status")).toHaveText("1 tool");
await expect(
  page.getByRole("link", { name: "Visual Toolkit", exact: true }),
).toBeVisible();
await page.goto(base + "/how-it-works#quality");
await expect(
  page.getByRole("heading", { name: "What keeps the catalog useful?" }),
).toBeInViewport();
await page
  .getByText("Has OIC verified these tools for production use?", {
    exact: true,
  })
  .click();
await expect(
  page.getByText("The catalog does not certify software", { exact: false }),
).toBeVisible();
await page.goto(base + "/about");
await expect(
  page.getByRole("heading", { name: "Industrial ideas need a path to trust." }),
).toBeVisible();
await expect(
  page.getByRole("heading", { name: "Build. Share. Prove." }),
).toBeVisible();
await page.goto(base + "/share");
await page
  .getByRole("button", { name: "Download ready project.yaml" })
  .waitFor();
await expect(
  page.getByRole("heading", { name: "Start with the essentials" }),
).toBeVisible();
await expect(
  page.getByText(/schema or structure items need attention/),
).toHaveCount(0);
await expect(
  page.getByRole("button", { name: "Download ready project.yaml" }),
).toBeDisabled();
await page.getByRole("button", { name: "Continue" }).click();
await expect(page.getByText(/highlighted project details/)).toBeVisible();
await expect(
  page.getByRole("textbox", { name: "Project name" }),
).toHaveAttribute("aria-invalid", "true");
await page
  .getByRole("textbox", { name: "Project name" })
  .fill("My unfinished tool");
const draftDownload = page.waitForEvent("download");
await page.getByRole("button", { name: "Download unfinished draft" }).click();
const unfinished = await draftDownload;
assert.equal(unfinished.suggestedFilename(), "project-draft.yaml");
await page.getByLabel("Open YAML file", { exact: true }).setInputFiles({
  name: "project-draft.yaml",
  mimeType: "text/yaml",
  buffer: await readFile(await unfinished.path()),
});
await expect(page.getByRole("textbox", { name: "Project name" })).toHaveValue(
  "My unfinished tool",
);
await page
  .getByRole("textbox", { name: "Listing URL name" })
  .fill("my-unfinished-tool");
await page
  .getByRole("textbox", { name: "One-sentence summary" })
  .fill("A free example for preparing industrial workflow diagrams.");
await page
  .getByRole("textbox", { name: "Project publisher" })
  .fill("Example publisher");
await page.getByLabel("Category", { exact: true }).selectOption("Engineering");
await page
  .getByLabel("Source availability", { exact: true })
  .selectOption("closed-source");
await page
  .getByRole("textbox", { name: /Tags · separate/ })
  .fill("Engineering");
await page
  .getByRole("textbox", { name: /Platforms · separate/ })
  .fill("Web browser");
await page.getByRole("button", { name: "Continue" }).click();
await expect(
  page.getByRole("heading", { name: "Access & details" }),
).toBeVisible();
await page
  .getByRole("textbox", { name: "Free edition name" })
  .fill("Free browser edition");
await page
  .getByRole("checkbox", { name: /I confirm this edition is free/ })
  .check();
await page
  .getByRole("textbox", { name: "About the project" })
  .fill("A browser tool for industrial workflow diagrams.");
await page
  .getByRole("textbox", { name: "License or free-use terms" })
  .fill("Free preview terms");
await page
  .getByRole("textbox", { name: "License / terms URL" })
  .fill(
    "https://github.com/open-industrial-collective/website/blob/main/CHARTER.md",
  );
await page
  .getByRole("textbox", { name: "What’s free & what it requires" })
  .fill("The browser edition is free. No paid platform is required.");
await page
  .getByRole("textbox", { name: "Primary destination" })
  .fill("https://github.com/open-industrial-collective/website");
await page.getByLabel("Main link type").selectOption("demo");
await page.getByLabel("Release stage").selectOption("preview");
await page.getByLabel("Maintenance").selectOption("active");
await page.getByRole("button", { name: "Continue" }).click();
await expect(
  page.getByRole("heading", { name: "Review & save" }),
).toBeVisible();
await expect(
  page.getByRole("button", { name: "Download ready project.yaml" }),
).toBeEnabled();
await page
  .getByLabel("Open YAML file", { exact: true })
  .setInputFiles(
    new URL("../public/templates/project.yaml", import.meta.url).pathname,
  );
await page.getByRole("heading", { name: "Draft needs changes" }).waitFor();
await expect(page.getByText(/Replace the blocked links/)).toBeVisible();
await expect(
  page.getByRole("button", { name: "Download ready project.yaml" }),
).toBeDisabled();
const blockedDraft = page.waitForEvent("download");
await page.getByRole("button", { name: "Download unfinished draft" }).click();
assert.equal((await blockedDraft).suggestedFilename(), "project-draft.yaml");
await page.getByLabel("Open YAML file", { exact: true }).setInputFiles({
  name: "project.yaml",
  mimeType: "text/yaml",
  buffer: Buffer.from(
    (
      await readFile(
        new URL("../public/templates/project.yaml", import.meta.url),
        "utf8",
      )
    ).replaceAll(
      "https://example.org",
      "https://github.com/open-industrial-collective/website",
    ),
  ),
});
await page.getByRole("heading", { name: "Ready for human review" }).waitFor();
await expect(
  page.getByRole("button", { name: "Download ready project.yaml" }),
).toBeEnabled();
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Download ready project.yaml" }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "project.yaml");
await page.getByRole("button", { name: "Simple form", exact: true }).click();
await page
  .getByRole("textbox", { name: "Project name" })
  .fill("Free Test Tool");
await page
  .getByRole("heading", { name: "Free Test Tool", exact: true })
  .waitFor();
await page.getByRole("button", { name: "02 Access" }).click();
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
const richPath = new URL(
  "../public/templates/project-v2.yaml",
  import.meta.url,
);
const originalRich = parse(await readFile(richPath, "utf8"));
await page
  .getByLabel("Open YAML file", { exact: true })
  .setInputFiles(richPath.pathname);
await expect(
  page.getByText(/repository files still need checking/),
).toBeVisible();
await page.getByRole("button", { name: "Simple form", exact: true }).click();
await page
  .getByRole("textbox", { name: "Project name", exact: true })
  .fill("Independent Rich Tool");
await page.getByRole("button", { name: "Edit YAML", exact: true }).click();
assert.deepEqual(
  parse(await page.getByLabel("Project YAML", { exact: true }).inputValue()),
  { ...originalRich, name: "Independent Rich Tool" },
);
await page.getByRole("button", { name: "Simple form", exact: true }).click();
await page.getByRole("button", { name: "02 Access" }).click();
await page.getByText("Files & resources 0", { exact: true }).click();
await page.getByRole("button", { name: "Add resource" }).click();
await expect(
  page.locator(".resource-editor:not(.media-editor) .resource-editor-item"),
).toHaveCount(1);
await page
  .getByLabel("Resource type", { exact: true })
  .selectOption("container");
await page
  .getByRole("textbox", { name: "Image reference" })
  .fill("ghcr.io/example/tool:1.0");
await page
  .getByLabel("Resource type", { exact: true })
  .selectOption("download");
await expect(
  page.getByRole("textbox", { name: "Image reference" }),
).toHaveCount(0);
await page
  .getByRole("textbox", { name: "Title", exact: true })
  .fill("Ignition module");
await page
  .getByRole("textbox", { name: "HTTPS destination" })
  .fill(
    "https://github.com/open-industrial-collective/website/releases/tool.modl",
  );
await page.getByRole("textbox", { name: "Format (optional)" }).fill(".modl");
await page.locator(".media-editor > summary").click();
await page.getByRole("button", { name: "Add image or GIF" }).click();
await page
  .getByRole("textbox", { name: "Image or GIF file path" })
  .last()
  .fill("./media/screenshot.jpg");
await page
  .getByRole("textbox", { name: "What the image shows" })
  .last()
  .fill("A tool dashboard");
await page
  .locator(".media-editor .resource-editor-item")
  .last()
  .getByRole("textbox", { name: "Title", exact: true })
  .fill("Tool dashboard");
await page.getByText("Preview page content", { exact: true }).click();
await expect(page.locator(".resource-card")).toContainText("Ignition module");
await expect(page.locator(".resource-card .resource-action")).toHaveAttribute(
  "href",
  "https://github.com/open-industrial-collective/website/releases/tool.modl",
);
await page.screenshot({
  path: new URL("../qa/resource-editor-desktop.png", import.meta.url).pathname,
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 390, height: 844 });
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  "resource editor overflows on mobile",
);
await page.screenshot({
  path: new URL("../qa/resource-editor-mobile.png", import.meta.url).pathname,
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole("button", { name: "Edit YAML", exact: true }).click();
const editedResource = parse(
  await page.getByLabel("Project YAML", { exact: true }).inputValue(),
).resources[0];
assert.equal(editedResource.format, ".modl");
assert.equal(editedResource.image, undefined);
assert.equal(
  parse(
    await page.getByLabel("Project YAML", { exact: true }).inputValue(),
  ).media.at(-1).src,
  "./media/screenshot.jpg",
);
await expect(
  page.getByRole("link", { name: /Open listing request/ }),
).toHaveAttribute(
  "href",
  "https://github.com/open-industrial-collective/website/issues/new?template=listing.yml",
);
await page
  .getByLabel("Project YAML", { exact: true })
  .fill("name: bad\nid: invalid\n");
await expect(
  page.getByRole("button", { name: "Download ready project.yaml" }),
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
  "/charter",
  "/platforms",
  "/how-it-works",

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
      .getByRole("link", { name: "Community", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Choose a way to help." })
      .waitFor();
    await expect(
      page.getByRole("heading", { name: "Grindstone Systems" }),
    ).toBeVisible();
    await expect(
      page.getByText("Interim website and program stewardship"),
    ).toBeVisible();
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
    "/charter",
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
