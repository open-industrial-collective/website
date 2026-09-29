import validate from "./validate.generated.js";
import { parseDocument } from "yaml";
export const categories = [
  "Data & connectivity",
  "Visualization",
  "Operations",
  "Engineering",
  "AI & automation",
] as const;
export type Category = (typeof categories)[number];
export type Project = {
  profile?: import("./profile").Profile;
  authored?: import("./profile").AuthoredProfile;
  schema: "oic/project/v1";
  id: string;
  name: string;
  summary: string;
  description: string;
  category: Category;
  tags: string[];
  platforms: string[];
  source: "open-source" | "source-available" | "closed-source";
  license: string;
  license_url: string;
  cost: "free";
  software_requirements?:
    "no-paid-required" | "paid-platform-required" | "see-terms";
  cost_notes: string;
  homepage: string;
  get_started: string;
  repository?: string;
  documentation?: string;
  maintainer: string;
};
export type Listing = Project & {
  listing: {
    origin: "curated" | "community";
    reviewed: string;
    submitted_by?: string;
    source?: {repository: string; commit: string; digest: string};
  };
};
export function validateProject(value: unknown): {
  project?: Project;
  errors: string[];
} {
  if (!validate(value))
    return {
      errors: (validate.errors ?? []).map(
        (e) =>
          `${e.instancePath || "project"} ${e.message}${e.keyword === "additionalProperties" ? `: ${e.params.additionalProperty}` : ""}`,
      ),
    };
  const project = value as Project;
  for (const value of [
    project.homepage,
    project.get_started,
    project.license_url,
    project.repository,
    project.documentation,
  ].filter(Boolean)) {
    try {
      const url = new URL(value!);
      if (
        url.protocol !== "https:" ||
        !url.hostname ||
        url.username ||
        url.password
      )
        return {
          errors: ["Links must be HTTPS URLs without embedded credentials."],
        };
    } catch {
      return { errors: ["Links must be valid HTTPS URLs."] };
    }
  }
  const strings = [
    project.name,
    project.summary,
    project.description,
    project.license,
    project.cost_notes,
    project.maintainer,
    ...project.tags,
    ...project.platforms,
  ];
  if (strings.some((s) => !s.trim()))
    return { errors: ["Text fields must not be blank."] };
  return { project, errors: [] };
}
export function parseProject(text: string) {
  if (new TextEncoder().encode(text).length > 32768)
    return { errors: ["Keep project.yaml under 32 KB."] };
  try {
    const doc = parseDocument(text, { uniqueKeys: true, customTags: [] });
    if (doc.errors.length || doc.warnings.length)
      return { errors: [...doc.errors, ...doc.warnings].map((e) => e.message) };
    return validateProject(doc.toJS({ maxAliasCount: 0 }));
  } catch (e) {
    return {
      errors: [e instanceof Error ? e.message : "Could not read YAML."],
    };
  }
}
export const sourceLabels = {
  "open-source": "Open source",
  "source-available": "Source available",
  "closed-source": "Closed source",
};

export const softwareLabels = {
  "no-paid-required": "Free software setup available",
  "paid-platform-required": "Paid platform required",
  "see-terms": "Check software requirements",
};
