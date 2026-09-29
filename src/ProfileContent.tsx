import Markdown from "react-markdown";
import type { Profile } from "./profile";
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
