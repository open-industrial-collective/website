import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(import.meta.dirname, "../dist");
const catalog = JSON.parse(
  await readFile(join(dist, "data/catalog.json"), "utf8"),
);
const visible = catalog.filter((project) => project.visibility !== "withdrawn");
const paths = [
  "/",
  "/explore",
  "/share",
  "/community",
  "/about",
  "/how-it-works",
  "/platforms",
  "/guide",
  "/charter",
  ...visible.map((project) => `/projects/${project.id}`),
];
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
assert.deepEqual(
  urls,
  paths.map((path) => `https://openindustrialcollective.org${path}`),
);

for (const path of paths) {
  const file = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  const html = await readFile(join(dist, file), "utf8");
  assert.match(html, /<h1[\s>]/, `${path} needs rendered page content`);
  assert.match(
    html,
    /<meta name="description" content="[^"]+"/,
    `${path} needs a description`,
  );
  assert.ok(
    html.includes(
      `<link rel="canonical" href="https://openindustrialcollective.org${path}" />`,
    ),
    `${path} needs its own canonical`,
  );
  assert.ok(
    !html.includes("<!-- SEO_START -->"),
    `${path} contains an unfilled metadata marker`,
  );
}

const missing = await readFile(join(dist, "404.html"), "utf8");
assert.match(missing, /name="robots" content="noindex, follow"/);
assert.doesNotMatch(missing, /rel="canonical"/);
const robots = await readFile(join(dist, "robots.txt"), "utf8");
assert.match(
  robots,
  /Sitemap: https:\/\/openindustrialcollective\.org\/sitemap\.xml/,
);
console.log(
  `Checked ${paths.length} rendered pages, sitemap, robots and 404 metadata`,
);
