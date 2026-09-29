import Markdown from "react-markdown";
import { useState } from "react";
import {
  Box,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { Profile, Resource } from "./profile";
const resourceNames = {
  source: "Source repository",
  download: "Downloadable file",
  container: "Container image",
  document: "Document",
};
const resourceActions = {
  source: "View repository",
  download: "Get file",
  container: "View image",
  document: "Open document",
};
const resourceIcons = {
  source: Code2,
  download: Download,
  container: Box,
  document: FileText,
};
function ResourceCard({
  resource: r,
  license,
}: {
  resource: Resource;
  license: Profile["license"];
}) {
  const [copied, setCopied] = useState(false);
  const Icon = resourceIcons[r.kind];
  const terms = r.license || license;
  return (
    <article className="resource-card">
      <div className="resource-card-top">
        <span className="resource-kind">
          <Icon size={17} />
          {resourceNames[r.kind]}
        </span>
        {r.version && (
          <span className="resource-version">Version {r.version}</span>
        )}
      </div>
      <h3>{r.title}</h3>
      {r.description && <p>{r.description}</p>}
      <div className="resource-meta">
        {r.format && <span>{r.format}</span>}
        <span>
          {r.access === "public"
            ? "Public access"
            : r.access === "account-required"
              ? "Account required"
              : "Check provider access"}
        </span>
      </div>
      {r.setup && <p className="resource-setup">Requires: {r.setup}</p>}
      {r.image && (
        <div className="resource-command">
          <code>docker pull {r.image}</code>
          <button
            type="button"
            aria-label={`Copy pull command for ${r.title}`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`docker pull ${r.image}`);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            <Copy size={15} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      {r.sha256 && (
        <details className="resource-checksum">
          <summary>Publisher-provided SHA-256</summary>
          <code>{r.sha256}</code>
        </details>
      )}
      <div className="resource-card-foot">
        <a
          className="resource-action"
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {resourceActions[r.kind]} <ExternalLink size={15} />
        </a>
        <a href={terms.url} target="_blank" rel="noopener noreferrer">
          {r.license ? "Resource terms" : "Project terms"}: {terms.name}
        </a>
      </div>
    </article>
  );
}
export function ProfileText({ children }: { children: string }) {
  return (
    <Markdown
      skipHtml
      allowedElements={[
        "p",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "code",
        "pre",
        "a",
        "h2",
        "h3",
        "blockquote",
        "br",
      ]}
      urlTransform={(url) => {
        try {
          const u = new URL(url);
          return u.protocol === "https:" && !u.username && !u.password
            ? url
            : "";
        } catch {
          return "";
        }
      }}
      components={{
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </Markdown>
  );
}
export function ProfileSections({ profile: p }: { profile: Profile }) {
  return (
    <>
      {p.resources?.length ? (
        <section className="detail-section" id="get-files">
          <h2>Files & resources</h2>
          <p className="resource-intro">
            Choose the package or document that fits your setup. These links go
            to locations chosen by the project publisher.
          </p>
          <div className="resource-grid">
            {p.resources.map((r) => (
              <ResourceCard key={r.id} resource={r} license={p.license} />
            ))}
          </div>
        </section>
      ) : null}
      {p.requirements.length > 0 && (
        <section className="detail-section">
          <h2>Requirements</h2>
          {p.requirements.map((r, i) => (
            <div key={i} className="profile-requirement">
              <h3>
                {r.name} {r.version}
              </h3>
              <span className="pill">
                {
                  {
                    free: "Free",
                    paid: "Paid requirement",
                    "optional-paid": "Optional paid setup",
                    unknown: "Cost depends on your setup",
                  }[r.cost]
                }
                {r.applies_to &&
                  ` · ${r.applies_to.map((id) => p.actions.find((a) => a.id === id)?.label || id).join(", ")}`}
              </span>
              <p>{r.notes}</p>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  Details ↗
                </a>
              )}
            </div>
          ))}
        </section>
      )}
      {p.faq?.length ? (
        <section className="detail-section">
          <h2>Questions & answers</h2>
          {p.faq.map((f) => (
            <details key={f.question} className="profile-faq">
              <summary>{f.question}</summary>
              <ProfileText>{f.answer}</ProfileText>
            </details>
          ))}
        </section>
      ) : null}
      <section className="detail-section">
        <h2>Project status</h2>
        <p>
          {p.lifecycle.stage[0].toUpperCase() + p.lifecycle.stage.slice(1)} ·{" "}
          {p.lifecycle.maintenance.replace("-", " ")}
          {p.release && (
            <>
              {" "}
              · <a href={p.release.url}>Version {p.release.version}</a>
              {p.release.date && ` · ${p.release.date}`}
            </>
          )}
        </p>
      </section>
    </>
  );
}
