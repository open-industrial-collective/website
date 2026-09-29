import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { indexablePaths, renderPage } from "../.ssr/entry-server.js";

const dist = join(import.meta.dirname, "../dist");
const template = await readFile(join(dist, "index.html"), "utf8");
const baseUrl = "https://openindustrialcollective.org";

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function meta(attribute, name, content) {
  return `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
}

function headTags(seo) {
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta("name", "description", seo.description),
    meta("name", "robots", seo.noindex ? "noindex, follow" : "index, follow"),
    ...(seo.canonical
      ? [`<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`]
      : []),
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", "Open Industrial Collective"),
    meta("property", "og:title", seo.title),
    meta("property", "og:description", seo.description),
    ...(seo.canonical ? [meta("property", "og:url", seo.canonical)] : []),
    meta("property", "og:image", seo.image),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", seo.title),
    meta("name", "twitter:description", seo.description),
    meta("name", "twitter:image", seo.image),
  ];
  if (seo.structuredData) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, "\\u003c")}</script>`,
    );
  }
  return tags.join("\n    ");
}

const paths = indexablePaths();
if (new Set(paths).size !== paths.length)
  throw new Error("Duplicate indexable path");
for (const path of [...paths, "/404"]) {
  const { markup, seo } = renderPage(path);
  const html = template
    .replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, headTags(seo))
    .replace(
      '<div id="root"></div>',
      () => `<div id="root" data-path="${path}">${markup}</div>`,
    );
  if (
    !html.includes(markup) ||
    !html.includes(`<title>${escapeHtml(seo.title)}</title>`)
  ) {
    throw new Error(`Prerender markers missing for ${path}`);
  }
  const file =
    path === "/"
      ? "index.html"
      : path === "/404"
        ? "404.html"
        : `${path.slice(1)}.html`;
  const destination = join(dist, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${escapeHtml(baseUrl + path)}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(dist, "sitemap.xml"), sitemap);
console.log(
  `Prerendered ${paths.length} indexable routes, a 404 page, and sitemap.xml`,
);
