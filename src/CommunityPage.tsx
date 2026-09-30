import {
  ArrowRight,
  ArrowUpRight,
  GitPullRequest,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { site } from "./site.config";
import { publicStewards } from "./people";

export function CommunityPage() {
  return (
    <div className="container page people-page">
      <div className="page-heading people-heading">
        <div className="eyebrow">PEOPLE & JOIN</div>
        <h1>There’s room to contribute.</h1>
        <p>
          Meet the people currently responsible for OIC, and find a practical
          way to help shape the catalog.
        </p>
        <div className="people-heading-actions">
          <a
            className="button primary"
            href={site.participation}
            target="_blank"
            rel="noopener noreferrer"
          >
            Offer a contribution <ArrowUpRight size={17} />
          </a>
          <a className="people-quiet-link" href="#ways-to-join">
            See ways to help <ArrowRight size={16} />
          </a>
        </div>
      </div>

      <section
        className="people-stewardship"
        aria-labelledby="stewardship-title"
      >
        <div className="people-stewardship-copy">
          <span className="eyebrow">CURRENT STEWARDSHIP</span>
          <h2 id="stewardship-title">Who’s looking after OIC?</h2>
          <p>
            Grindstone Systems initiated OIC and currently maintains this
            website. The goal is shared stewardship built around real work and
            accepted responsibilities.
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

      <section
        className="people-section people-actions-section"
        id="ways-to-join"
        aria-labelledby="ways-title"
        tabIndex={-1}
      >
        <div className="people-section-intro">
          <span className="eyebrow">TAKE PART</span>
          <h2 id="ways-title">Start with a useful action.</h2>
          <p>
            No membership or fee is needed to browse, share, or point out a gap.
            Organization access follows an accepted responsibility, not a public
            application.
          </p>
        </div>
        <div className="people-action-grid">
          <Link to="/explore" className="people-action-card">
            <span>01</span>
            <Users size={25} />
            <h3>Try a tool</h3>
            <p>
              Explore the catalog and tell us when a listing needs a correction.
            </p>
            <b>
              Explore tools <ArrowRight size={16} />
            </b>
          </Link>
          <Link to="/share" className="people-action-card">
            <span>02</span>
            <GitPullRequest size={25} />
            <h3>Share your project</h3>
            <p>
              Prepare a portable profile for a free industrial tool you
              maintain.
            </p>
            <b>
              Prepare a listing <ArrowRight size={16} />
            </b>
          </Link>
          <a
            href={site.participation}
            className="people-action-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>03</span>
            <ShieldCheck size={25} />
            <h3>Help the Collective</h3>
            <p>Offer a concrete improvement through a public GitHub issue.</p>
            <b>
              Offer a contribution <ArrowUpRight size={16} />
            </b>
          </a>
        </div>
        <p className="people-actions-note">
          OIC is currently founder-led. Public contributions are a starting
          point for collaboration; they do not grant an organization role.
          Please keep private plant and personal information out of public
          issues.
        </p>
      </section>
    </div>
  );
}
