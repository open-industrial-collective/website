import {
  ArrowRight,
  ArrowUpRight,
  GitPullRequest,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { site } from "./site.config";
import { publicStewards } from "./people";

export function CommunityPage() {
  return (
    <div className="container page people-page">
      <div className="page-heading people-heading">
        <div className="eyebrow">COMMUNITY</div>
        <h1>Help shape what industry can use.</h1>
        <p>Suggest a free tool, share one you built, or help make OIC more useful.</p>
        <img className="oic-page-art oic-community-art" src="/images/illustrations/community.webp" alt="" width="1536" height="1024" loading="lazy" />
      </div>
      <section className="people-actions-section" aria-labelledby="ways-title">
        <h2 className="sr-only" id="ways-title">
          Ways to take part
        </h2>
        <div className="people-action-grid">
          <a
            href={site.toolSuggestion}
            className="people-action-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>01</span>
            <Lightbulb size={25} />
            <h3>Recommend a tool</h3>
            <p>
              Share a link and why it helps. You do not need to maintain it or
              write YAML.
            </p>
            <b>
              Public GitHub Issue · sign-in required <ArrowUpRight size={16} />
            </b>
          </a>
          <Link to="/share" className="people-action-card">
            <span>02</span>
            <GitPullRequest size={25} />
            <h3>List your tool</h3>
            <p>
              Prepare its profile for review. You keep your software and releases
              under your control.
            </p>
            <b>
              Prepare your listing <ArrowRight size={16} />
            </b>
          </Link>
          <a
            href={site.participation}
            className="people-action-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>03</span>
            <Wrench size={25} />
            <h3>Contribute to OIC</h3>
            <p>
              Take on a focused improvement to the catalog, guides or website.
            </p>
            <b>
              Public GitHub Issue · sign-in required <ArrowUpRight size={16} />
            </b>
          </a>
        </div>
      </section>
      <section
        className="people-stewardship"
        aria-labelledby="stewardship-title"
      >
        <div className="people-stewardship-copy">
          <span className="eyebrow">CURRENT STEWARDSHIP</span>
          <h2 id="stewardship-title">Stewardship grows through participation.</h2>
          <p>
            Grindstone Systems leads OIC today. Shared responsibility will grow
            as contributors take on real work.
          </p>
          <a
            href="https://github.com/open-industrial-collective"
            target="_blank"
            rel="noopener noreferrer"
            className="people-org-link"
          >
            View the OIC GitHub organization <ArrowUpRight size={16} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="people-roster">
          {publicStewards.map((steward) => (
            <article className="people-founder-card" key={steward.id}>
              <div className="people-founder-mark" aria-hidden="true">
                {steward.initials}
              </div>
              <div>
                <span className="people-role-tag">{steward.role}</span>
                <h3>
                  {steward.websiteUrl ? (
                    <a href={steward.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {steward.name} <ArrowUpRight size={17} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : steward.name}
                </h3>
                <p>{steward.scope}</p>
                {steward.profileUrl && (
                  <a
                    href={steward.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Profile <ArrowUpRight size={14} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
