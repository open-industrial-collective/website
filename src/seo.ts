import data from "./catalog.generated.json";
import type { Listing } from "./catalog";
import { site } from "./site.config";

const projects = data as Listing[];
const pages: Record<string, [string, string]> = {
  "/": ["Free industrial software. More room to innovate.", site.description],
  "/explore": [
    "Explore free industrial projects",
    "Browse free industrial software for engineering, operations, visualization and connectivity. Compare source availability, access terms and requirements.",
  ],
  "/explore/glossary": [
    "Explore filters and classification",
    "Understand OIC capability categories, package formats, platform relationships and search filters.",
  ],
  "/share": [
    "Share a free industrial project",
    "Prepare a portable OIC project profile and request a listing for your free industrial software, module or browser demo.",
  ],
  "/community": [
    "Help shape what industry can use",
    "Suggest a free industrial tool, share one you maintain, offer a contribution, or see who currently stewards OIC.",
  ],
  "/about": [
    "Why Open Industrial Collective exists",
    "OIC connects industrial expertise to adoption through useful technology, open sharing and evidence people can inspect. Learn the Build, Share, Prove mission and what exists today.",
  ],
  "/how-it-works": [
    "From promising tool to practical use",
    "Find and share free industrial tools with clear access, terms and requirements. Get direct answers about listing review, source rights, platform costs and the limits of verification.",
  ],
  "/platforms": [
    "Free software and platform requirements",
    "Free tools can run on commercial platforms. Understand separate platform costs and explore the Ignition ecosystem.",
  ],
  "/guide": [
    "Share your tool. Keep your project.",
    "Describe a free industrial tool, explain its terms and requirements, and learn how OIC reviews catalog listings.",
  ],
  "/charter": [
    "OIC Listing Charter",
    "The public standard for free industrial tool listings, admission review, automated checks, and the limits of catalog verification.",
  ],
  "/safety": [
    "Industrial use and security guidance",
    "Understand OIC listing limits, plant deployment checks, publisher responsibilities and private security reporting, with CISA and NIST references.",
  ],
};

export function indexablePaths() {
  return [
    ...Object.keys(pages),
    ...projects.map((project) => `/projects/${project.id}`),
  ];
}

export function pageSeo(pathname: string) {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const project = projects.find((item) => path === `/projects/${item.id}`);
  const [heading, description] = project
    ? [project.name, project.summary]
    : pages[path] || ["Page not found", site.description];
  const known = Boolean(project || pages[path]);
  const image = project?.profile?.media?.find(
    (media) => media.type === "image",
  );
  return {
    path,
    title: `${heading} — ${site.name}`,
    description,
    canonical: known ? `${site.url}${path}` : undefined,
    image:
      image?.type === "image"
        ? new URL(image.src, site.url).href
        : `${site.url}/brand/oic-social.png`,
    noindex: !known,
    structuredData:
      path === "/"
        ? {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            alternateName: "OIC",
            url: `${site.url}/`,
            description: site.description,
          }
        : project
          ? {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: project.name,
              description: project.summary,
              url: project.homepage,
              mainEntityOfPage: `${site.url}${path}`,
              applicationCategory: "BusinessApplication",
              license: project.license_url,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: project.cost_notes,
              },
            }
          : undefined,
  };
}
