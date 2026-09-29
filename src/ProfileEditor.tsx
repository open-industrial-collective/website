import { useMemo, useState } from "react";
import { stringify } from "yaml";
import { Link } from "react-router-dom";
import {
  parseProfile,
  normalizeProfile,
  referencedFiles,
  type AuthoredProfile,
  type Profile,
  type Resource,
} from "./profile";
import { categories, sourceLabels } from "./catalog";
import { site } from "./site.config";
import { ProfileText, ProfileSections } from "./ProfileContent";
const empty: Profile = {
  schema: "oic/project/v2",
  id: "",
  name: "",
  summary: "",
  category: "Engineering",
  tags: ["Industrial"],
  platforms: ["Web browser"],
  publisher: { name: "" },
  description: { text: "" },
  source: { availability: "closed-source" },
  license: { name: "", url: "" },
  access: {
    edition: "Free edition",
    cost: "free",
    notes: "",
    account_required: "unknown",
  },
  requirements: [],
  actions: [{ id: "start", type: "demo", url: "", primary: true }],
  lifecycle: { stage: "preview", maintenance: "active" },
  visibility: "listed",
};
export function ProfileEditor() {
  const [text, setText] = useState(stringify(empty));
  const [mode, setMode] = useState<"form" | "yaml">("form");
  const [draft, setDraft] = useState<AuthoredProfile>(empty);
  const [message, setMessage] = useState("");
  const yaml = mode === "yaml" ? text : stringify(draft);
  const result = useMemo(() => parseProfile(yaml), [yaml]);
  const display = result.project ? normalizeProfile(result.project) : null;
  const set = (path: string, value: unknown) => {
    const copy = structuredClone(draft) as unknown as Record<string, unknown>;
    const keys = path.split(".");
    let parent: any = copy;
    for (const k of keys.slice(0, -1)) parent = parent[k] ??= {};
    parent[keys.at(-1)!] = value;
    setDraft(copy as unknown as AuthoredProfile);
  };
  const field = (label: string, path: string, multiline = false) => {
    let value: any = draft;
    for (const k of path.split(".")) value = value?.[k];
    return (
      <label className="field" key={path}>
        <span>{label}</span>
        {multiline ? (
          <textarea
            rows={4}
            value={value || ""}
            onChange={(e) => set(path, e.target.value)}
          />
        ) : (
          <input
            type={
              path.endsWith(".url") ||
              path.endsWith("repository") ||
              path === "license_url" ||
              path === "get_started"
                ? "url"
                : "text"
            }
            autoCapitalize={
              path === "id" ||
              path.endsWith(".url") ||
              path.endsWith("repository") ||
              path === "license_url" ||
              path === "get_started"
                ? "none"
                : "sentences"
            }
            spellCheck={
              !(
                path === "id" ||
                path.endsWith(".url") ||
                path.endsWith("repository")
              )
            }
            value={value || ""}
            onChange={(e) => set(path, e.target.value)}
          />
        )}
      </label>
    );
  };
  const choose = (
    label: string,
    path: string,
    values: Record<string, string>,
  ) => {
    let value: any = draft;
    for (const key of path.split(".")) value = value?.[key];
    return (
      <label className="field">
        <span>{label}</span>
        <select
          aria-label={label}
          value={String(value)}
          onChange={(e) =>
            set(
              path,
              path === "access.account_required" && e.target.value !== "unknown"
                ? e.target.value === "true"
                : e.target.value,
            )
          }
        >
          {Object.entries(values).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </label>
    );
  };
  const switchMode = (next: "form" | "yaml") => {
    if (next === mode) return;
    if (next === "yaml") setText(stringify(draft));
    else {
      const parsed = parseProfile(text);
      if (!parsed.project) {
        setMessage("Fix the YAML before switching to the form.");
        return;
      }
      setDraft(parsed.project);
    }
    setMode(next);
    setMessage("");
  };
  const isV2 = draft.schema === "oic/project/v2";
  const updateResources = (resources: Resource[]) =>
    set("resources", resources);
  const addResource = () => {
    if (draft.schema !== "oic/project/v2") return;
    const resources = draft.resources || [];
    let number = 1;
    while (resources.some((r) => r.id === `resource-${number}`)) number++;
    updateResources([
      ...resources,
      {
        id: `resource-${number}`,
        kind: "download",
        title: "",
        url: "",
        access: "public",
      },
    ]);
  };
  const updateResource = (index: number, patch: Partial<Resource>) => {
    if (draft.schema !== "oic/project/v2") return;
    const resources = structuredClone(draft.resources || []);
    const next = { ...resources[index], ...patch };
    if (next.kind !== "container") delete next.image;
    if (next.kind !== "download") delete next.sha256;
    resources[index] = next;
    updateResources(resources);
  };
  const files =
    result.project?.schema === "oic/project/v2"
      ? referencedFiles(result.project)
      : [];
  const save = () => {
    const url = URL.createObjectURL(new Blob([yaml], { type: "text/yaml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.yaml";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Downloaded project.yaml. Your listing has not been submitted.");
  };
  return (
    <div className="container page">
      <div className="page-heading">
        <div className="eyebrow">BUILT BY YOU · SHARED THROUGH OIC</div>
        <h1>Give your project a home.</h1>
        <p>
          Keep a profile in your repository. OIC turns it into a clear, useful
          project page.
        </p>
      </div>
      <a
        className="mobile-editor-jump text-link"
        href="#listing-preview"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("listing-preview")?.focus();
        }}
      >
        Preview & save ↓
      </a>
      <div className="share-layout">
        <section className="form-panel" id="listing-form" tabIndex={-1}>
          <div className="form-toolbar">
            <div className="segmented">
              <button
                aria-pressed={mode === "form"}
                onClick={() => switchMode("form")}
              >
                Simple form
              </button>
              <button
                aria-pressed={mode === "yaml"}
                onClick={() => switchMode("yaml")}
              >
                Edit YAML
              </button>
            </div>
            <label className="upload-button">
              Open YAML
              <input
                type="file"
                aria-label="Open YAML file"
                accept=".yaml,.yml"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 65536) {
                    setMessage("Keep project.yaml under 64 KB.");
                    return;
                  }
                  setText(await file.text());
                  setMode("yaml");
                  setMessage("");
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {mode === "yaml" ? (
            <label className="field yaml-field">
              <span>project.yaml</span>
              <textarea
                aria-label="Project YAML"
                rows={32}
                spellCheck={false}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
          ) : (
            <div className="fields">
              {field("Project name", "name")}
              {field("URL slug", "id")}
              {field("One-line description", "summary")}
              {field("Publisher", isV2 ? "publisher.name" : "maintainer")}
              <div className="field-pair">
                {choose(
                  "Category",
                  "category",
                  Object.fromEntries(categories.map((c) => [c, c])),
                )}
                {choose(
                  "Source availability",
                  isV2 ? "source.availability" : "source",
                  sourceLabels,
                )}
              </div>
              {(isV2 ? draft.source.availability : draft.source) !==
                "closed-source" &&
                field(
                  "Source repository",
                  isV2 ? "source.repository" : "repository",
                )}
              {(["tags", "platforms"] as const).map((key) => (
                <label className="field" key={key}>
                  <span>
                    {key === "tags" ? "Tags" : "Platforms"} · separate with
                    commas
                  </span>
                  <input
                    value={draft[key].join(",")}
                    onChange={(e) =>
                      set(
                        key,
                        e.target.value.split(",").map((v) => v.trim()),
                      )
                    }
                  />
                </label>
              ))}
              {isV2 && (
                <div className="field-pair">
                  {field("Free edition name", "access.edition")}
                  {choose("Account required", "access.account_required", {
                    unknown: "Check the terms",
                    false: "No account needed",
                    true: "Account required",
                  })}
                </div>
              )}

              {isV2 && "file" in draft.description
                ? field("Overview file", "description.file")
                : field(
                    "About the project",
                    isV2 ? "description.text" : "description",
                    true,
                  )}
              {field(
                "License or free-use terms",
                isV2 ? "license.name" : "license",
              )}
              {field(
                "License / terms URL",
                isV2 ? "license.url" : "license_url",
              )}
              {field(
                "What’s free & what it requires",
                isV2 ? "access.notes" : "cost_notes",
                true,
              )}
              {field(
                "Primary destination",
                isV2
                  ? `actions.${draft.actions.findIndex((a) => a.primary)}.url`
                  : "get_started",
              )}
              {isV2 && (
                <details className="resource-editor">
                  <summary>
                    Files & resources{" "}
                    <span>{draft.resources?.length || 0}</span>
                  </summary>
                  <p>
                    Offer a repository, package, container image or document.
                    Each item links to the location you manage. Add separate
                    terms when an item uses a different license.
                  </p>
                  {(draft.resources || []).map((resource, index) => (
                    <div className="resource-editor-item" key={index}>
                      <div className="resource-editor-title">
                        <h3>{resource.title || `Resource ${index + 1}`}</h3>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() =>
                            updateResources(
                              (draft.resources || []).filter(
                                (_, i) => i !== index,
                              ),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="field-pair">
                        <label className="field">
                          <span>Type</span>
                          <select
                            aria-label="Resource type"
                            value={resource.kind}
                            onChange={(e) =>
                              updateResource(index, {
                                kind: e.target.value as Resource["kind"],
                              })
                            }
                          >
                            <option value="download">Downloadable file</option>
                            <option value="source">Source repository</option>
                            <option value="container">Container image</option>
                            <option value="document">Document</option>
                          </select>
                        </label>
                        <label className="field">
                          <span>Access</span>
                          <select
                            aria-label="Resource access"
                            value={resource.access}
                            onChange={(e) =>
                              updateResource(index, {
                                access: e.target.value as Resource["access"],
                              })
                            }
                          >
                            <option value="public">Public access</option>
                            <option value="account-required">
                              Account required
                            </option>
                            <option value="see-provider">
                              Check provider access
                            </option>
                          </select>
                        </label>
                      </div>
                      <label className="field">
                        <span>Resource ID</span>
                        <input
                          value={resource.id}
                          autoCapitalize="none"
                          spellCheck={false}
                          onChange={(e) =>
                            updateResource(index, { id: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Title</span>
                        <input
                          value={resource.title}
                          onChange={(e) =>
                            updateResource(index, { title: e.target.value })
                          }
                          placeholder="Ignition module · Windows ZIP · Installation guide"
                        />
                      </label>
                      <label className="field">
                        <span>HTTPS destination</span>
                        <input
                          type="url"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={resource.url}
                          onChange={(e) =>
                            updateResource(index, { url: e.target.value })
                          }
                          placeholder="https://example.org/releases/..."
                        />
                      </label>
                      <label className="field">
                        <span>What’s included</span>
                        <textarea
                          rows={2}
                          value={resource.description || ""}
                          onChange={(e) =>
                            updateResource(index, {
                              description: e.target.value || undefined,
                            })
                          }
                        />
                      </label>
                      <div className="field-pair">
                        <label className="field">
                          <span>Format (optional)</span>
                          <input
                            value={resource.format || ""}
                            onChange={(e) =>
                              updateResource(index, {
                                format: e.target.value || undefined,
                              })
                            }
                            placeholder=".modl, .zip, PDF"
                          />
                        </label>
                        <label className="field">
                          <span>Version (optional)</span>
                          <input
                            value={resource.version || ""}
                            onChange={(e) =>
                              updateResource(index, {
                                version: e.target.value || undefined,
                              })
                            }
                          />
                        </label>
                      </div>
                      {resource.kind === "container" && (
                        <label className="field">
                          <span>Image reference</span>
                          <input
                            value={resource.image || ""}
                            autoCapitalize="none"
                            spellCheck={false}
                            onChange={(e) =>
                              updateResource(index, { image: e.target.value })
                            }
                            placeholder="ghcr.io/publisher/image:1.0"
                          />
                        </label>
                      )}
                      {resource.kind === "download" && (
                        <label className="field">
                          <span>SHA-256 checksum (optional)</span>
                          <input
                            value={resource.sha256 || ""}
                            autoCapitalize="none"
                            spellCheck={false}
                            onChange={(e) =>
                              updateResource(index, {
                                sha256: e.target.value || undefined,
                              })
                            }
                          />
                        </label>
                      )}
                      <label className="field">
                        <span>Setup or platform requirement (optional)</span>
                        <input
                          value={resource.setup || ""}
                          onChange={(e) =>
                            updateResource(index, {
                              setup: e.target.value || undefined,
                            })
                          }
                          placeholder="Ignition 8.1 with Perspective"
                        />
                      </label>
                      <label className="resource-license-toggle">
                        <input
                          type="checkbox"
                          checked={!!resource.license}
                          onChange={(e) =>
                            updateResource(index, {
                              license: e.target.checked
                                ? { name: "", url: "" }
                                : undefined,
                            })
                          }
                        />{" "}
                        Different terms for this resource
                      </label>
                      {resource.license && (
                        <div className="field-pair">
                          <label className="field">
                            <span>Resource terms name</span>
                            <input
                              value={resource.license.name}
                              onChange={(e) =>
                                updateResource(index, {
                                  license: {
                                    ...resource.license!,
                                    name: e.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          <label className="field">
                            <span>Resource terms URL</span>
                            <input
                              type="url"
                              value={resource.license.url}
                              onChange={(e) =>
                                updateResource(index, {
                                  license: {
                                    ...resource.license!,
                                    url: e.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button"
                    onClick={addResource}
                    disabled={(draft.resources?.length || 0) >= 20}
                  >
                    Add resource
                  </button>
                </details>
              )}
              {!isV2 && (
                <label className="field">
                  <span>Software requirements</span>
                  <select
                    aria-label="Software requirements"
                    value={draft.software_requirements || "see-terms"}
                    onChange={(e) =>
                      set("software_requirements", e.target.value)
                    }
                  >
                    <option value="see-terms">
                      Check software requirements
                    </option>
                    <option value="no-paid-required">
                      Free software setup available
                    </option>
                    <option value="paid-platform-required">
                      Paid platform required
                    </option>
                  </select>
                </label>
              )}
              <p className="small-text">
                Use Edit YAML for logos, galleries, videos, requirements, FAQs,
                links and release details. Switching views preserves every
                supported field.
              </p>
            </div>
          )}
          <div className="form-foot">
            <span>Kept in this page only. Download to save.</span>
            <a href="/templates/project-v2.yaml" download>
              Full v2 template ↓
            </a>
          </div>
        </section>
        <aside
          className="submission-preview"
          id="listing-preview"
          tabIndex={-1}
        >
          <a
            className="mobile-editor-jump text-link"
            href="#listing-form"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("listing-form")?.focus();
            }}
          >
            ↑ Back to editing
          </a>
          <div className="eyebrow">YOUR LISTING PREVIEW</div>
          {display ? (
            <article className="project-card preview-card">
              <span className="card-category">{display.category}</span>
              <h2>{display.name}</h2>
              <p>{display.summary}</p>
              <span>By {display.maintainer}</span>
              <p>
                {display.software_requirements === "paid-platform-required"
                  ? "Paid platform required"
                  : ""}
              </p>
              <details>
                <summary>Preview page content</summary>
                <ProfileText>{display.description}</ProfileText>
                <p>{display.cost_notes}</p>
                {display.profile && (
                  <ProfileSections profile={display.profile} />
                )}
              </details>
            </article>
          ) : (
            <div className="preview-placeholder">
              <h2>Your project, right here.</h2>
              <p>Complete the required fields to see your listing.</p>
            </div>
          )}
          <div className="validation">
            <h3>{display ? "Ready to export" : "A few details to finish"}</h3>
            {result.errors.length > 0 && (
              <details>
                <summary>{result.errors.length} items need attention</summary>
                <ul>
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </details>
            )}
            {files.length > 0 && (
              <p className="small-text">
                YAML validated. {files.length} repository files still need
                checking during import. Images and file-based text are not
                loaded by this browser preview.
              </p>
            )}
            <button
              className="button primary"
              disabled={!display}
              onClick={save}
            >
              Download project.yaml
            </button>
            <p role="status">{message}</p>
          </div>
          <div className="next-step">
            <h3>Publish from your repository.</h3>
            <ol>
              <li>
                Commit project.yaml and its files under <code>.oic/</code>.
              </li>
              <li>
                Request a listing using your public repository URL. Private
                software can use a public listing-only repository.
              </li>
              <li>
                OIC reviews the profile and imports an approved snapshot. Later
                changes go through the same review.
              </li>
            </ol>
            <a
              className="button"
              href={`${site.repository}/issues/new?template=listing.yml`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Request a listing ↗
            </a>
            <Link className="text-link" to="/guide">
              How review works →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
