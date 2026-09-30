import validate from "./validate-v2.generated.js";
import { parseDocument } from "yaml";
import { validateProject, type Project } from "./catalog";
export type Media =
  | {
      id: string;
      type: "image";
      src: string;
      /** Generated still preview for an imported animated GIF; never authored. */
      poster?: string;
      alt: string;
      title?: string;
      caption?: string;
      credit?: string;
      rights?: string;
    }
  | {
      id: string;
      type: "video";
      url: string;
      title: string;
      poster?: string;
      transcript?: string;
    };
export type Action = {
  id: string;
  type: "demo" | "download" | "install" | "docs";
  url: string;
  primary: boolean;
  label?: string;
  description?: string;
};
export type Resource = {
  id: string;
  kind: "source" | "download" | "container" | "document";
  title: string;
  url: string;
  description?: string;
  format?: string;
  version?: string;
  access: "public" | "account-required" | "see-provider";
  license?: { name: string; url: string };
  setup?: string;
  sha256?: string;
  image?: string;
};
export type Profile = {
  schema: "oic/project/v2";
  discovery?: import("./discovery").Discovery;
  id: string;
  name: string;
  summary: string;
  category: Project["category"];
  tags: string[];
  platforms: string[];
  publisher: { name: string; url?: string };
  description: { text: string } | { file: string };
  branding?: { logo: { on_light: string; on_dark?: string; alt: string } };
  media?: Media[];
  source: { availability: Project["source"]; repository?: string };
  license: { name: string; url: string; spdx_expression?: string };
  access: {
    edition: string;
    cost: "free";
    notes: string;
    account_required: boolean | "unknown";
  };
  requirements: {
    name: string;
    kind: "software" | "hardware" | "service";
    cost: "free" | "paid" | "optional-paid" | "unknown";
    notes: string;
    version?: string;
    url?: string;
    applies_to?: string[];
  }[];
  actions: Action[];
  resources?: Resource[];
  links?: Partial<
    Record<
      | "homepage"
      | "docs"
      | "wiki"
      | "issues"
      | "discussions"
      | "changelog"
      | "support",
      string
    >
  >;
  faq?: { question: string; answer: string }[];
  lifecycle: {
    stage: "preview" | "beta" | "stable";
    maintenance: "active" | "maintenance-only" | "archived";
  };
  release?: { version: string; url: string; date?: string };
  visibility: "listed" | "withdrawn";
};
export type AuthoredProfile = Project | Profile;
// Drafts use the same YAML shape but may omit required factual answers. Keep
// parsing bounded and structural so a saved form draft can return to the form.
export function parseDraft(text: string): {
  draft?: AuthoredProfile;
  errors: string[];
} {
  if (new TextEncoder().encode(text).length > 65536)
    return { errors: ["Keep project-draft.yaml under 64 KB."] };
  try {
    const doc = parseDocument(text, { uniqueKeys: true, customTags: [] });
    if (doc.errors.length || doc.warnings.length)
      return { errors: [...doc.errors, ...doc.warnings].map((e) => e.message) };
    const value = doc.toJS({ maxAliasCount: 0 });
    const object = (v: unknown): v is Record<string, any> =>
      !!v && typeof v === "object" && !Array.isArray(v);
    if (
      !object(value) ||
      !["oic/project/v1", "oic/project/v2"].includes(value.schema)
    )
      return { errors: ["Open an OIC v1 or v2 project YAML file."] };
    const strings = (items: unknown) =>
      Array.isArray(items) && items.every((item) => typeof item === "string");
    if (
      value.schema === "oic/project/v2" &&
      (!object(value.publisher) ||
        !object(value.description) ||
        !object(value.source) ||
        !object(value.license) ||
        !object(value.access) ||
        !object(value.lifecycle) ||
        !Array.isArray(value.actions) ||
        value.actions.length < 1 ||
        !value.actions.every(
          (action: unknown) =>
            object(action) &&
            typeof action.id === "string" &&
            typeof action.type === "string" &&
            typeof action.url === "string" &&
            typeof action.primary === "boolean",
        ) ||
        !strings(value.tags) ||
        !strings(value.platforms) ||
        !Array.isArray(value.requirements) ||
        typeof value.publisher.name !== "string" ||
        typeof value.source.availability !== "string" ||
        typeof value.license.name !== "string" ||
        typeof value.license.url !== "string" ||
        typeof value.access.edition !== "string" ||
        typeof value.access.notes !== "string" ||
        typeof value.lifecycle.stage !== "string" ||
        typeof value.lifecycle.maintenance !== "string" ||
        (value.discovery !== undefined &&
          (!object(value.discovery) ||
            (value.discovery.capabilities !== undefined &&
              !strings(value.discovery.capabilities)))) ||
        (value.media !== undefined &&
          (!Array.isArray(value.media) || !value.media.every(object))) ||
        (value.resources !== undefined &&
          (!Array.isArray(value.resources) || !value.resources.every(object))))
    )
      return {
        errors: [
          "This draft needs the basic v2 sections to open in the form. Continue in YAML mode or start from the template.",
        ],
      };
    if (
      value.schema === "oic/project/v1" &&
      (!strings(value.tags) || !strings(value.platforms))
    )
      return {
        errors: [
          "This v1 draft needs tags and platforms arrays to open in the form.",
        ],
      };
    return { draft: value as AuthoredProfile, errors: [] };
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : "Invalid YAML."],
    };
  }
}
export const actionLabel = (a: Action) =>
  a.label ||
  {
    demo: "Try the demo",
    download: "Download",
    install: "Install",
    docs: "Read the docs",
  }[a.type];
export function parseProfile(text: string): {
  project?: AuthoredProfile;
  errors: string[];
} {
  if (new TextEncoder().encode(text).length > 65536)
    return { errors: ["Keep project.yaml under 64 KB."] };
  try {
    const doc = parseDocument(text, { uniqueKeys: true, customTags: [] });
    if (doc.errors.length || doc.warnings.length)
      return { errors: [...doc.errors, ...doc.warnings].map((e) => e.message) };
    const value = doc.toJS({ maxAliasCount: 0 });
    if (value?.schema === "oic/project/v1") return validateProject(value);
    if (!validate(value))
      return {
        errors: (validate.errors || []).map(
          (e) => `${e.instancePath || "project"} ${e.message}`,
        ),
      };
    const p = value as Profile;
    const errors: string[] = [];
    if (p.actions.filter((a) => a.primary).length !== 1)
      errors.push("Choose exactly one primary action.");
    for (const group of [p.actions, p.media || [], p.resources || []])
      if (new Set(group.map((a) => a.id)).size !== group.length)
        errors.push("IDs must be unique within each section.");
    for (const resource of p.resources || []) {
      if (resource.kind === "container" && !resource.image)
        errors.push(`Container ${resource.id} needs an image reference.`);
      if (resource.image && resource.kind !== "container")
        errors.push(`Only container resources can have an image reference.`);
      if (resource.sha256 && resource.kind !== "download")
        errors.push(`Only downloadable files can have a SHA-256 checksum.`);
    }
    for (const option of p.discovery?.options || [])
      if (
        option.resource_id &&
        !p.resources?.some((r) => r.id === option.resource_id)
      )
        errors.push(`Unknown discovery resource: ${option.resource_id}`);
    if (p.discovery?.air_gap === "documented" && !p.discovery.air_gap_url)
      errors.push("Documented air-gap installation needs an evidence URL.");
    if (p.source.availability !== "closed-source" && !p.source.repository)
      errors.push("Public source availability requires a repository URL.");
    for (const r of p.requirements)
      for (const id of r.applies_to || [])
        if (!p.actions.some((a) => a.id === id))
          errors.push(`Unknown requirement action: ${id}`);
    const inspect = (v: unknown) => {
      if (typeof v === "string" && v.startsWith("https:")) {
        try {
          const u = new URL(v);
          if (
            u.protocol !== "https:" ||
            u.username ||
            u.password ||
            !u.hostname
          )
            errors.push("Links must use HTTPS without credentials.");
        } catch {
          errors.push("Invalid HTTPS URL.");
        }
      } else if (v && typeof v === "object") Object.values(v).forEach(inspect);
    };
    inspect(p);
    for (const path of referencedFiles(p))
      if (!path.startsWith("./") || path.split("/").includes(".."))
        errors.push("Files must stay inside the manifest directory.");
    for (const m of p.media || [])
      if (m.type === "image" && !/\.(png|jpe?g|webp|gif)$/.test(m.src))
        errors.push("Images must be PNG, JPEG, WebP or GIF.");
    if ("file" in p.description && !p.description.file.endsWith(".md"))
      errors.push("Description files must be Markdown.");
    return errors.length ? { errors } : { project: p, errors: [] };
  } catch (e) {
    return { errors: [e instanceof Error ? e.message : "Invalid YAML"] };
  }
}
export function referencedFiles(p: Profile): string[] {
  return [
    ...new Set(
      [
        "file" in p.description ? p.description.file : undefined,
        p.branding?.logo.on_light,
        p.branding?.logo.on_dark,
        ...(p.media || []).map((m) => (m.type === "image" ? m.src : m.poster)),
      ].filter((x): x is string => !!x),
    ),
  ];
}
// One display model keeps all v1 listings working. Author YAML remains untouched for export.
export function normalizeProfile(
  p: AuthoredProfile,
  files: Record<string, string> = {},
): Project {
  if (p.schema === "oic/project/v1") return { ...p };
  const primary = p.actions.find((a) => a.primary)!;
  const display = structuredClone(p);
  if (display.branding) {
    display.branding.logo.on_light =
      files[display.branding.logo.on_light] || "";
    if (display.branding.logo.on_dark)
      display.branding.logo.on_dark =
        files[display.branding.logo.on_dark] || "";
  }
  display.media = (display.media || []).flatMap<Media>((m) =>
    m.type === "image"
      ? files[m.src]
        ? [
            {
              ...m,
              src: files[m.src],
              ...(files[`${m.src}#poster`]
                ? { poster: files[`${m.src}#poster`] }
                : {}),
            },
          ]
        : []
      : [{ ...m, poster: m.poster ? files[m.poster] : undefined }],
  );
  return {
    schema: "oic/project/v1",
    id: p.id,
    name: p.name,
    summary: p.summary,
    description:
      "text" in p.description
        ? p.description.text
        : files[p.description.file] || "",
    category: p.category,
    tags: p.tags,
    platforms: p.platforms,
    source: p.source.availability,
    repository: p.source.repository,
    license: p.license.name,
    license_url: p.license.url,
    cost: "free",
    cost_notes: p.access.notes,
    software_requirements: p.requirements.some(
      (r) =>
        r.cost === "paid" &&
        (!r.applies_to || r.applies_to.includes(primary.id)),
    )
      ? "paid-platform-required"
      : p.requirements.some(
            (r) =>
              r.kind === "software" &&
              r.cost === "unknown" &&
              (!r.applies_to || r.applies_to.includes(primary.id)),
          )
        ? "see-terms"
        : "no-paid-required",
    homepage: p.links?.homepage || p.publisher.url || primary.url,
    get_started: primary.url,
    documentation: p.links?.docs,
    maintainer: p.publisher.name,
    profile: display,
    authored: p,
  };
}
