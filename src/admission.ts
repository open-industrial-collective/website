import type { AuthoredProfile } from "./profile";

export type AdmissionFinding = {
  level: "block" | "review";
  code: string;
  message: string;
};

// Deterministic, offline checks only. This cannot establish ownership, safety,
// free-use rights, or the contents of a publisher-hosted artifact.
export function admissionPreflight(
  project: AuthoredProfile,
): AdmissionFinding[] {
  const findings: AdmissionFinding[] = [];
  const urls: { label: string; value: string }[] = [];
  const add = (label: string, value?: string) => {
    if (value) urls.push({ label, value });
  };
  if (project.schema === "oic/project/v1") {
    add("Homepage", project.homepage);
    add("Get started", project.get_started);
    add("Terms", project.license_url);
    add("Repository", project.repository);
    add("Documentation", project.documentation);
  } else {
    add("Publisher", project.publisher.url);
    add("Terms", project.license.url);
    add("Source repository", project.source.repository);
    project.actions.forEach((action) => add(`Action ${action.id}`, action.url));
    project.resources?.forEach((resource) => {
      add(`Resource ${resource.id}`, resource.url);
      add(`Resource ${resource.id} terms`, resource.license?.url);
    });
    project.requirements.forEach((requirement) =>
      add(`Requirement ${requirement.name}`, requirement.url),
    );
    Object.entries(project.links || {}).forEach(([label, value]) =>
      add(`Link ${label}`, value),
    );
    add("Release", project.release?.url);
    project.media?.forEach((media) => {
      if (media.type === "video") {
        add(`Video ${media.id}`, media.url);
        add(`Video ${media.id} transcript`, media.transcript);
      }
    });
    for (const resource of project.resources || []) {
      if (resource.kind === "download" && !resource.sha256)
        findings.push({
          level: "review",
          code: "download-integrity",
          message: `${resource.title}: provide a publisher SHA-256 for a fixed release file when possible; a checksum is not a malware check.`,
        });
      if (
        resource.kind === "container" &&
        resource.image &&
        !resource.image.includes("@sha256:")
      )
        findings.push({
          level: "review",
          code: "mutable-image",
          message: `${resource.title}: use an immutable image digest when possible so visitors can identify the reviewed release.`,
        });
      if (resource.access !== "public")
        findings.push({
          level: "review",
          code: "access-terms",
          message: `${resource.title}: confirm the access steps and any account or provider restrictions.`,
        });
    }
    if (
      !project.links?.docs &&
      !project.actions.some((action) => action.type === "docs")
    )
      findings.push({
        level: "review",
        code: "documentation",
        message:
          "Add installation or usage guidance, or explain how a visitor can get started from the primary action.",
      });
  }
  for (const { label, value } of urls) {
    let hostname: string;
    try {
      const url = new URL(value);
      hostname = url.hostname.toLowerCase().replace(/\.$/, "");
      if (url.protocol !== "https:" || url.username || url.password)
        throw new Error("unsafe URL");
    } catch {
      findings.push({
        level: "block",
        code: "unsafe-url",
        message: `${label}: use a valid HTTPS URL without credentials.`,
      });
      continue;
    }
    if (
      hostname === "localhost" ||
      /\.(localhost|local|internal|test|invalid|example)$/.test(hostname) ||
      ["example.com", "example.org", "example.net"].includes(hostname) ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
      hostname.includes(":")
    )
      findings.push({
        level: "block",
        code: "nonpublic-url",
        message: `${label}: replace placeholder, private-network, or IP-only destinations with a public project URL.`,
      });
  }
  return findings;
}
