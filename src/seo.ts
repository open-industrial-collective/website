import data from "./catalog.generated.json";
import type { Listing } from "./catalog";
import { site } from "./site.config";

const projects = data as Listing[];
const pages: Record<string, [string, string]> = {
  "/": ["Free industrial tools and shared know-how", site.description],
  "/explore": [
    "Explore free industrial tools",
    "Browse free industrial software for engineering, operations, visualization and connectivity. Compare source availability, access terms and requirements.",
  ],
  "/explore/glossary": ["Explore filters and classification", "Understand OIC capability categories, package formats, platform relationships and search filters."],
  "/share": [
    "Share a free industrial tool",
    "Prepare a portable OIC project profile and request a listing for your free industrial software, module or browser demo.",
  ],
  "/community": [
    "People and participation",
    "See who currently stewards OIC and how builders and practitioners can contribute as the Collective grows.",
  ],
  "/about": [
    "Why Open Industrial Collective exists",
    "OIC connects industrial expertise to adoption through useful technology, open sharing and evidence people can inspect. Learn the Build, Share, Prove mission and what exists today.",
  ],
  "/how-it-works": [
    "How OIC works",
    "Find and share free industrial tools with clear access, terms and requirements. Get direct answers about listing review, source rights, platform costs and the limits of verification.",
  ],
  "/platforms": [
    "Industrial platforms and software costs",
    "Free tools can run on commercial platforms. Understand separate platform costs and explore the Ignition ecosystem.",
  ],
  "/guide": [
    "Industrial tool listing guide",
    "Describe a free industrial tool, explain its terms and requirements, and learn how OIC reviews catalog listings.",
  ],
  "/charter": [
    "OIC Listing Charter",
    "The public standard for free industrial tool listings, admission review, automated checks, and the limits of catalog verification.",
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
