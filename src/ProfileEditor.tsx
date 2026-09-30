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
  type Media,
} from "./profile";
import { capabilities, productTypes } from "./discovery";
import { categories, sourceLabels } from "./catalog";
import { site } from "./site.config";
import { ProfileText, ProfileSections } from "./ProfileContent";
import { admissionPreflight } from "./admission";
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
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<AuthoredProfile>(empty);
  const [message, setMessage] = useState("");
  const yaml = mode === "yaml" ? text : stringify(draft);
  const result = useMemo(() => parseProfile(yaml), [yaml]);
  const findings = result.project ? admissionPreflight(result.project) : [];
  const blocked = findings.some((finding) => finding.level === "block");
  const display = result.project ? normalizeProfile(result.project) : null;
  const set = (path: string, value: unknown) => {
    const copy = structuredClone(draft) as unknown as Record<string, unknown>;
    const keys = path.split(".");
    let parent: any = copy;
    for (const k of keys.slice(0, -1)) parent = parent[k] ??= {};
    if (path === "discovery.product_type" && !value)
      delete parent[keys.at(-1)!];
    else parent[keys.at(-1)!] = value;
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
          value={value === undefined ? "" : String(value)}
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
      setStep(0);
    }
    setMode(next);
    setMessage("");
  };
  const isV2 = draft.schema === "oic/project/v2";
  const updateResources = (resources: Resource[]) =>
    set("resources", resources);
  const updateMedia = (media: Media[]) => set("media", media);
  const addMedia = (type: Media["type"]) => {
    if (draft.schema !== "oic/project/v2") return;
    const media = draft.media || [];
    let number = 1;
    while (media.some((item) => item.id === `media-${number}`)) number++;
    updateMedia([
      ...media,
      type === "image"
        ? { id: `media-${number}`, type, src: "", alt: "", title: "" }
        : { id: `media-${number}`, type, url: "", title: "" },
    ]);
  };
  const updateMediaItem = (index: number, patch: Partial<Media>) => {
    if (draft.schema !== "oic/project/v2") return;
    const media = structuredClone(draft.media || []);
    media[index] = { ...media[index], ...patch } as Media;
    updateMedia(media);
  };
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
      <div className="page-heading share-heading">
        <div className="eyebrow">SHARE A PROJECT</div>
        <h1>Show people what you’ve built.</h1>
        <p>
          Create a clear listing for a useful industrial tool people can use for
          free. Keep the profile in a public repository; OIC reviews it before
          it appears in the catalog.
        </p>
      </div>
      <section className="share-criteria" aria-label="Before you start">
        <div className="share-criteria-title">
          <span>BEFORE YOU START</span>
          <Link to="/charter">Full Listing Charter ↗</Link>
        </div>
        <div className="share-criteria-grid">
          <div>
            <b>01</b>
            <strong>A real free path</strong>
            <p>
              Ongoing free use, not just a trial. Disclose limits and any
              required paid host or hardware.
            </p>
          </div>
          <div>
            <b>02</b>
            <strong>Clear ownership & rights</strong>
            <p>
              Name the publisher, link the actual terms, and have permission to
              share the profile and media.
            </p>
          </div>
          <div>
            <b>03</b>
            <strong>Useful, honest detail</strong>
            <p>
              Show what it does, how to start, what it needs, and whether it is
              open source, source available, or closed source.
            </p>
          </div>
        </div>
        <p className="share-criteria-note">
          A public repo alone does not qualify. OIC checks the listing and its
          links, then a maintainer decides whether to publish it. Catalog review
          is not a security certification.
        </p>
      </section>
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
          <div className="share-wizard-heading">
            <span className="eyebrow">PREPARE YOUR LISTING</span>
            <h2>
              {mode === "yaml"
                ? "Edit the full profile"
                : ["The essentials", "Access & details", "Review & save"][step]}
            </h2>
            <p>
              {mode === "yaml"
                ? "All supported fields stay in this file. Switch back to the form at any time."
                : [
                    "Tell visitors what this tool is and who makes it.",
                    "Make free access, terms and requirements clear.",
                    "Check your draft, then download the YAML to your repository.",
                  ][step]}
            </p>
          </div>
          {mode === "form" && (
            <nav className="share-stepper" aria-label="Listing steps">
              {["Project", "Access", "Review"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => setStep(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </button>
              ))}
            </nav>
          )}
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
              {step === 0 && (
                <>
                  {field("Project name", "name")}
                  {field("Listing URL name", "id")}
                  <p className="field-hint">
                    Short lowercase name for the page address, such as{" "}
                    <code>my-industrial-tool</code>.
                  </p>
                  {field("One-sentence summary", "summary")}
                  {field(
                    "Project publisher",
                    isV2 ? "publisher.name" : "maintainer",
                  )}
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
                  {isV2 && (
                    <details className="editor-discovery">
                      <summary>Discovery details</summary>
                      {draft.discovery ? (
                        <>
                          <div className="field-pair">
                            {choose(
                              "Primary capability",
                              "discovery.primary",
                              capabilities,
                            )}
                            {choose("Product type", "discovery.product_type", {
                              "": "Not provided",
                              ...productTypes,
                            })}
                          </div>
                          <label className="field">
                            <span>
                              Specific capabilities · separate with commas
                            </span>
                            <input
                              value={(draft.discovery.capabilities || []).join(
                                ", ",
                              )}
                              onChange={(e) =>
                                set(
                                  "discovery.capabilities",
                                  e.target.value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter(Boolean),
                                )
                              }
                            />
                          </label>
                          <p className="field-hint">
                            Use YAML for package options, platform relationships
                            and evidence links.{" "}
                            <Link to="/explore/glossary">
                              See field definitions
                            </Link>
                            .
                          </p>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="button"
                          onClick={() =>
                            set("discovery", {
                              primary: (
                                {
                                  "Data & connectivity": "connectivity",
                                  Visualization: "visualization",
                                  Operations: "operations",
                                  Engineering: "development",
                                  "AI & automation": "automation",
                                } as const
                              )[draft.category],
                            })
                          }
                        >
                          Add discovery details
                        </button>
                      )}
                    </details>
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
                </>
              )}
              {step === 1 && (
                <>
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
                    <details className="resource-editor media-editor">
                      <summary>
                        Images, GIFs & video <span>{draft.media?.length || 0}</span>
                      </summary>
                      <p>
                        Add up to eight items in the order visitors should see
                        them. Put screenshots beside{" "}
                        <code>.oic/project.yaml</code> and use relative paths
                        such as <code>./media/screen.jpg</code>. Use a local <code>.gif</code> for a short product motion preview. GIFs are paused until a visitor plays them. Videos open at your HTTPS link.
                      </p>
                      {(draft.media || []).map((item, index) => (
                        <div className="resource-editor-item" key={item.id}>
                          <div className="resource-editor-title">
                            <h3>
                              {item.title ||
                                (item.type === "image"
                                  ? "Screenshot"
                                  : "Video")}{" "}
                              {index + 1}
                            </h3>
                            <button
                              type="button"
                              className="text-link"
                              onClick={() =>
                                updateMedia(
                                  (draft.media || []).filter(
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
                              <span>Media ID</span>
                              <input
                                value={item.id}
                                autoCapitalize="none"
                                spellCheck={false}
                                onChange={(e) =>
                                  updateMediaItem(index, { id: e.target.value })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Title</span>
                              <input
                                value={item.title || ""}
                                onChange={(e) =>
                                  updateMediaItem(index, {
                                    title: e.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>
                          {item.type === "image" ? (
                            <>
                              <label className="field">
                                <span>Image or GIF file path</span>
                                <input
                                  value={item.src}
                                  autoCapitalize="none"
                                  spellCheck={false}
                                  placeholder="./media/screenshot.jpg"
                                  onChange={(e) =>
                                    updateMediaItem(index, {
                                      src: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="field">
                                <span>What the image shows</span>
                                <input
                                  value={item.alt}
                                  onChange={(e) =>
                                    updateMediaItem(index, {
                                      alt: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="field">
                                <span>Caption (optional)</span>
                                <input
                                  value={item.caption || ""}
                                  onChange={(e) =>
                                    updateMediaItem(index, {
                                      caption: e.target.value || undefined,
                                    })
                                  }
                                />
                              </label>
                              <div className="field-pair">
                                <label className="field">
                                  <span>Credit (optional)</span>
                                  <input
                                    value={item.credit || ""}
                                    onChange={(e) =>
                                      updateMediaItem(index, {
                                        credit: e.target.value || undefined,
                                      })
                                    }
                                  />
                                </label>
                                <label className="field">
                                  <span>Display rights (optional)</span>
                                  <input
                                    value={item.rights || ""}
                                    onChange={(e) =>
                                      updateMediaItem(index, {
                                        rights: e.target.value || undefined,
                                      })
                                    }
                                  />
                                </label>
                              </div>
                            </>
                          ) : (
                            <>
                              <label className="field">
                                <span>Video HTTPS URL</span>
                                <input
                                  type="url"
                                  value={item.url}
                                  autoCapitalize="none"
                                  spellCheck={false}
                                  onChange={(e) =>
                                    updateMediaItem(index, {
                                      url: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="field">
                                <span>Poster image path (optional)</span>
                                <input
                                  value={item.poster || ""}
                                  autoCapitalize="none"
                                  spellCheck={false}
                                  placeholder="./media/video-poster.jpg"
                                  onChange={(e) =>
                                    updateMediaItem(index, {
                                      poster: e.target.value || undefined,
                                    })
                                  }
                                />
                              </label>
                              <label className="field">
                                <span>Transcript HTTPS URL (optional)</span>
                                <input
                                  type="url"
                                  value={item.transcript || ""}
                                  onChange={(e) =>
                                    updateMediaItem(index, {
                                      transcript: e.target.value || undefined,
                                    })
                                  }
                                />
                              </label>
                            </>
                          )}
                        </div>
                      ))}
                      <div className="media-editor-actions">
                        <button
                          type="button"
                          className="button"
                          onClick={() => addMedia("image")}
                          disabled={(draft.media?.length || 0) >= 8}
                        >
                          Add screenshot
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => addMedia("video")}
                          disabled={(draft.media?.length || 0) >= 8}
                        >
                          Add video
                        </button>
                      </div>
                      <p className="small-text">
                        Only share images and footage you have permission to
                        display. OIC asks for scoped display, resize and cache
                        permission during the listing request.
                      </p>
                    </details>
                  )}
                  {isV2 && (
                    <details className="resource-editor">
                      <summary>
                        Files & resources{" "}
                        <span>{draft.resources?.length || 0}</span>
                      </summary>
                      <p>
                        Offer a repository, package, container image or
                        document. Each item links to the location you manage.
                        Add separate terms when an item uses a different
                        license.
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
                                <option value="download">
                                  Downloadable file
                                </option>
                                <option value="source">
                                  Source repository
                                </option>
                                <option value="container">
                                  Container image
                                </option>
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
                                    access: e.target
                                      .value as Resource["access"],
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
                                  updateResource(index, {
                                    image: e.target.value,
                                  })
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
                            <span>
                              Setup or platform requirement (optional)
                            </span>
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
                    Use Edit YAML for logos, detailed requirements, FAQs, links
                    and release details. Switching views preserves every
                    supported field.
                  </p>
                </>
              )}
              {step === 2 && (
                <div className="share-review-guide">
                  <h3>Before you request a listing</h3>
                  <ol>
                    <li>
                      <strong>Check the preview.</strong> Fix missing fields and
                      blocked links. Preflight checks file structure and obvious
                      link problems only.
                    </li>
                    <li>
                      <strong>Save the profile.</strong> Put{" "}
                      <code>project.yaml</code> at{" "}
                      <code>.oic/project.yaml</code> with its declared images
                      and text in a public repository. A listing-only repo is
                      fine when your software source is private.
                    </li>
                    <li>
                      <strong>Request review.</strong> Send the public profile
                      repository URL in the issue form. OIC confirms control,
                      the free path, terms, media permission and practical value
                      before approving an exact snapshot. Updates receive the
                      same review.
                    </li>
                  </ol>
                  <p>
                    No listing is sent from this page. Downloading YAML or
                    passing preflight does not publish it.
                  </p>
                  <a
                    className="text-link"
                    href="#listing-preview"
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById("listing-preview")?.focus();
                    }}
                  >
                    See preview and download ↓
                  </a>
                </div>
              )}
              <div className="share-step-actions">
                {step > 0 && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => setStep(step - 1)}
                  >
                    ← Back
                  </button>
                )}
                {step < 2 && (
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setStep(step + 1)}
                  >
                    Continue <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
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
          <div className="eyebrow">LIVE LISTING PREVIEW</div>
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
            <h3>
              {display
                ? blocked
                  ? "Draft needs changes"
                  : "Ready to export"
                : "A few details to finish"}
            </h3>
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
            {findings.length > 0 && (
              <details open={blocked}>
                <summary>
                  {findings.length} Charter preflight{" "}
                  {findings.length === 1 ? "finding" : "findings"}
                </summary>
                <ul>
                  {findings.map((finding, i) => (
                    <li key={i}>
                      <strong>
                        {finding.level === "block"
                          ? "Fix before publication"
                          : "Review"}
                        :
                      </strong>{" "}
                      {finding.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <p className="small-text">
              Preflight checks the profile only. OIC reviews ownership,
              usefulness, terms and linked files before publication.{" "}
              <Link to="/charter">Read the Listing Charter</Link>.
            </p>
            {blocked && (
              <p className="small-text">
                You can save this draft now. Replace the blocked links before
                requesting publication.
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
            <h3>Submit for review</h3>
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
              Open listing request ↗
            </a>
            <Link className="text-link" to="/charter">
              Read the Listing Charter →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
