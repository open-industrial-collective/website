import type { Listing } from "./catalog";
import { sourceLabels, softwareLabels } from "./catalog";
import { actionLabel } from "./profile";

export const capabilities = {
  connectivity: "Connectivity & integration",
  visualization: "Visualization & interfaces",
  operations: "Production & operations",
  data: "Data & analytics",
  automation: "AI & automation",
  development: "Development & testing",
  infrastructure: "Infrastructure & deployment",
  security: "Security & governance",
} as const;
export const productTypes = {
  application: "Application",
  tool: "Tool",
  demo: "Interactive demo",
  extension: "Platform extension",
  resource: "Project or resource pack",
  library: "Library or SDK",
  assets: "Visual asset pack",
};
const browseKinds = {
  "interactive-demo": "Interactive demo",
  "web-application": "Web application",
  "web-tool": "Web tool",
  "ignition-module": "Ignition module",
};
export const deliveries = {
  web: "Hosted web tool",
  container: "Container image",
  installer: "Native installer",
  module: "Ignition module",
  project: "Project import",
  source: "Source package",
  assets: "Downloadable assets",
};
export const deployments = {
  local: "Local device",
  server: "On-prem server",
  cloud: "Cloud",
  hosted: "Publisher-hosted",
};
export type Discovery = {
  primary: keyof typeof capabilities;
  secondary?: (keyof typeof capabilities)[];
  capabilities?: string[];
  product_type?: keyof typeof productTypes;
  interfaces?: string[];
  works_with?: {
    name: string;
    relationship: "requires" | "integrates" | "exports";
    version?: string;
    evidence_url?: string;
  }[];
  // Each option is a valid combination, never a union of incompatible packages.
  options?: {
    resource_id?: string;
    delivery: keyof typeof deliveries;
    environments: string[];
    deployment: (keyof typeof deployments)[];
  }[];
  offline?: "yes" | "no" | "unknown";
  air_gap?: "documented" | "no" | "unknown";
  air_gap_url?: string;
  commercial_use?: "yes" | "no" | "unknown";
  support?: ("community" | "publisher" | "paid")[];
};
const legacy: Record<string, Discovery["primary"]> = {
  "Data & connectivity": "connectivity",
  Visualization: "visualization",
  Operations: "operations",
  Engineering: "development",
  "AI & automation": "automation",
};
// Editorial classification uses only facts in approved catalog descriptions. It does not alter author snapshots.
export function discovery(p: Listing): Discovery {
  if (p.profile?.discovery) return p.profile.discovery;
  const base: Discovery = { primary: legacy[p.category], capabilities: p.tags };
  return base;
}
export function browseKind(
  p: Listing,
): keyof typeof browseKinds | keyof typeof productTypes | undefined {
  const d = discovery(p);
  if (d.options?.length && d.options.every((o) => o.delivery === "module"))
    return "ignition-module";
  if (d.product_type === "demo") return "interactive-demo";
  if (d.product_type === "tool" && d.options?.some((o) => o.delivery === "web"))
    return "web-tool";
  if (
    d.product_type === "application" &&
    /preview|showcase/i.test(p.profile?.access.edition || "")
  )
    return "interactive-demo";
  if (
    d.product_type === "application" &&
    /builder|toolkit|\btool\b/i.test(p.profile?.access.edition || "")
  )
    return "web-tool";
  if (
    d.product_type === "application" &&
    d.options?.some((o) => o.delivery === "web")
  )
    return "web-application";
  return d.product_type;
}
export const groups = [
  "capability",
  "type",
  "works",
  "delivery",
  "environment",
  "deployment",
  "source",
  "try",
  "software",
  "stage",
  "offline",
  "airgap",
  "rights",
  "support",
] as const;
export type Group = (typeof groups)[number];
export const groupLabels: Record<Group, string> = {
  capability: "Capability",
  type: "Kind",
  works: "Works with",
  delivery: "Delivery",
  environment: "Runs on",
  deployment: "Deployment",
  source: "Source availability",
  try: "Try it",
  software: "Software costs",
  stage: "Release stage",
  offline: "Offline operation",
  airgap: "Air-gap installation",
  rights: "Commercial use",
  support: "Support",
};
export const labels: Partial<Record<Group, Record<string, string>>> = {
  capability: capabilities,
  type: { ...productTypes, ...browseKinds },
  delivery: deliveries,
  deployment: deployments,
  source: sourceLabels,
  software: softwareLabels,
  try: {
    demo: "Live demo",
    download: "Downloadable package",
    source: "Available source",
  },
  stage: {
    preview: "Preview",
    beta: "Beta",
    stable: "Stable",
    archived: "Archived",
  },
  offline: { yes: "Offline operation declared" },
  airgap: { documented: "Installation documented" },
  rights: { yes: "Commercial use permitted" },
  support: {
    community: "Community",
    publisher: "Publisher",
    paid: "Paid support available",
  },
};
export const label = (group: Group, value: string) =>
  labels[group]?.[value] || value;
export function values(p: Listing, group: Group): string[] {
  const d = discovery(p),
    profile = p.profile;
  switch (group) {
    case "capability":
      return [d.primary, ...(d.secondary || [])];
    case "type":
      return browseKind(p) ? [browseKind(p)!] : [];
    case "works":
      return (d.works_with || []).map((w) => w.name);
    case "delivery":
      return (d.options || []).map((o) => o.delivery);
    case "environment":
      return (
        d.options?.flatMap((o) => o.environments) ||
        p.platforms.filter((v) =>
          ["Linux", "Windows", "macOS", "Browser", "Raspberry Pi"].includes(v),
        )
      );
    case "deployment":
      return (d.options || []).flatMap((o) => o.deployment);
    case "source":
      return [p.source];
    case "software":
      return [p.software_requirements || "see-terms"];
    case "stage":
      return profile
        ? [
            profile.lifecycle.maintenance === "archived"
              ? "archived"
              : profile.lifecycle.stage,
          ]
        : [];
    case "offline":
      return d.offline === "yes" ? ["yes"] : [];
    case "airgap":
      return d.air_gap === "documented" && d.air_gap_url ? ["documented"] : [];
    case "rights":
      return d.commercial_use === "yes" ? ["yes"] : [];
    case "support":
      return d.support || [];
    case "try":
      return [
        ...(profile?.actions.some((a) => a.type === "demo") ? ["demo"] : []),
        ...(profile?.actions.some((a) => a.type === "download") ||
        profile?.resources?.some((r) => r.kind === "download")
          ? ["download"]
          : []),
        ...(p.repository ? ["source"] : []),
      ];
  }
}
const aliases: [RegExp, string][] = [
  [/overall equipment effectiveness/g, "oee"],
  [/gateway backup|gwbk/g, "gatewaybackup"],
  [/historical trends|historical trend|history/g, "history"],
  [/docker|containerized|containers/g, "container"],
  [/opc[ -]?ua/g, "opcua"],
];
export function normalizeSearch(text: string) {
  let s = text.toLowerCase();
  for (const [pattern, replacement] of aliases)
    s = s.replace(pattern, replacement);
  return s.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
export function searchScore(p: Listing, query: string) {
  const d = discovery(p);
  const title = normalizeSearch(p.name);
  const text = normalizeSearch(
    [
      p.name,
      p.summary,
      p.description,
      p.maintainer,
      ...p.tags,
      ...p.platforms,
      ...groups.flatMap((g) => values(p, g).map((v) => label(g, v))),
      ...(d.capabilities || []),
      ...(d.interfaces || []),
    ].join(" "),
  );
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  return terms.every((t) => text.includes(t))
    ? 1 + terms.reduce((n, t) => n + (title.includes(t) ? 5 : 0), 0)
    : 0;
}
export function selections(params: URLSearchParams, group: Group) {
  const current = params.getAll(group);
  if (group === "capability" && params.has("category"))
    current.push(legacy[params.get("category")!] || params.get("category")!);
  if (group === "environment" && params.has("platform"))
    current.push(params.get("platform")!);
  return [...new Set(current)];
}
export function matches(p: Listing, params: URLSearchParams, omit?: Group) {
  if (!searchScore(p, params.get("q") || "")) return false;
  for (const group of groups) {
    if (group === omit) continue;
    const selected = selections(params, group);
    const available =
      group === "type" && discovery(p).product_type
        ? [...values(p, group), discovery(p).product_type!]
        : values(p, group);
    if (selected.length && !selected.some((v) => available.includes(v)))
      return false;
  }
  const packageGroups = (
    ["delivery", "environment", "deployment"] as Group[]
  ).filter((g) => g !== omit && selections(params, g).length);
  if (packageGroups.length > 1) {
    const options = discovery(p).options || [];
    if (
      !options.some((o) =>
        packageGroups.every((g) =>
          selections(params, g).some((v) =>
            (g === "delivery"
              ? [o.delivery]
              : g === "environment"
                ? o.environments
                : o.deployment
            ).includes(v as never),
          ),
        ),
      )
    )
      return false;
  }
  return true;
}
export function filterProjects(projects: Listing[], params: URLSearchParams) {
  const sort = params.get("sort") || (params.get("q") ? "relevance" : "added");
  return projects
    .filter((p) => matches(p, params))
    .sort((a, b) => {
      const date = (p: Listing) =>
        sort === "released"
          ? p.profile?.release?.date || ""
          : p.listing.added || "";
      return (
        (sort === "relevance"
          ? searchScore(b, params.get("q") || "") -
            searchScore(a, params.get("q") || "")
          : sort === "added" || sort === "released"
            ? date(b).localeCompare(date(a))
            : 0) || a.name.localeCompare(b.name)
      );
    });
}
export function facetOptions(
  projects: Listing[],
  params: URLSearchParams,
  group: Group,
) {
  return [
    ...new Set([
      ...projects.flatMap((p) => values(p, group)),
      ...selections(params, group),
    ]),
  ]
    .map((value) => {
      const candidate = new URLSearchParams(params);
      candidate.delete(group);
      if (group === "capability") candidate.delete("category");
      if (group === "environment") candidate.delete("platform");
      candidate.append(group, value);
      return {
        value,
        count: projects.filter((p) => matches(p, candidate)).length,
      };
    })
    .filter((o) => o.count || selections(params, group).includes(o.value))
    .sort((a, b) => label(group, a.value).localeCompare(label(group, b.value)));
}
export function primaryAction(p: Listing) {
  const action = p.profile?.actions.find((a) => a.primary);
  return {
    url: action?.url || p.get_started,
    label: action ? actionLabel(action) : "Get started",
  };
}
export const relationshipLabels = {
  requires: "Requires",
  integrates: "Integrates with",
  exports: "Exports for",
};
export function fitFacts(p: Listing): [string, string][] {
  const d = discovery(p),
    v = (g: Group) =>
      [...new Set(values(p, g))].map((x) => label(g, x)).join(", ") ||
      "Not provided";
  return [
    ["Job", p.summary],
    ["Capability", v("capability")],
    ["Product type", v("type")],
    [
      "Works with",
      d.works_with
        ?.map(
          (w) =>
            `${relationshipLabels[w.relationship]} ${w.name}${w.version ? ` (${w.version})` : ""}`,
        )
        .join("; ") || "Not provided",
    ],
    ["Runs on", v("environment")],
    ["Delivery", v("delivery")],
    ["Deployment", v("deployment")],
    ["Interfaces", d.interfaces?.join(", ") || "Not provided"],
    ["Free scope", p.cost_notes],
    ["Software costs", v("software")],
    [
      "Requirements",
      p.profile
        ? p.profile.requirements
            .map((r) => `${r.name}: ${r.notes}`)
            .join("; ") || "No requirements declared"
        : "See publisher setup instructions",
    ],
    ["Source & terms", `${sourceLabels[p.source]} · ${p.license}`],
    ["Release stage", v("stage")],
    ["Maintenance", p.profile?.lifecycle.maintenance || "Not provided"],
    ["Support", v("support")],
    ["Offline operation", d.offline || "Not provided"],
    ["Air-gap installation", d.air_gap || "Not provided"],
    ["Commercial use", d.commercial_use || "Not provided"],
    ["Evidence", "Listing review only; no independent assessment recorded"],
  ];
}
export const collections = [
  {
    name: "Try in your browser",
    description: "Open a hosted preview without installing software.",
    params: "delivery=web&try=demo",
  },
  {
    name: "Industrial visualization",
    description: "Explore interfaces and tools for making processes visible.",
    params: "capability=visualization",
  },
  {
    name: "Works with Ignition",
    description:
      "Tools with a declared required platform, integration or export destination.",
    params: "works=Ignition+Perspective",
  },
];
