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
        <h1>Choose a way to help.</h1>
        <p>
          Found a useful tool, built one, or spotted something we could improve?
          Start here.
        </p>
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
            <h3>Suggest a tool</h3>
            <p>
              Send a name, public link and why it helps. You do not need to
              maintain it or write YAML.
            </p>
            <b>
              Public GitHub Issue · sign-in required <ArrowUpRight size={16} />
            </b>
          </a>
          <Link to="/share" className="people-action-card">
            <span>02</span>
            <GitPullRequest size={25} />
            <h3>Share a tool you maintain</h3>
            <p>
              Prepare a portable YAML profile for your free edition and request
              human review.
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
            <h3>Help improve OIC</h3>
            <p>
              Offer a focused contribution to the catalog, guides or website.
            </p>
            <b>
              Public GitHub Issue · sign-in required <ArrowUpRight size={16} />
            </b>
          </a>
        </div>
        <p className="people-actions-note">
          Found an error in a listing?{" "}
          <a href={site.correction} target="_blank" rel="noopener noreferrer">
            Suggest a correction on GitHub ↗
          </a>{" "}
          (sign-in required; public Issue). For private security reports, use
          the <Link to="/safety">security route</Link>. Keep private plant and
          personal information out of public Issues.
        </p>
      </section>
      <section
        className="people-stewardship"
        aria-labelledby="stewardship-title"
      >
        <div className="people-stewardship-copy">
          <span className="eyebrow">CURRENT STEWARDSHIP</span>
          <h2 id="stewardship-title">Who’s looking after OIC?</h2>
          <p>
            Grindstone Systems initiated OIC and currently maintains this
            website. Shared stewardship grows through real work and accepted
            responsibilities. A public Issue does not grant organization access.
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
                <h3>{steward.name}</h3>
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
