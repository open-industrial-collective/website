import { ArrowRight, ArrowUpRight, GitPullRequest, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { site } from "./site.config";
import { publicStewards } from "./people";

const roles = [
  {
    number: "01",
    title: "Participant",
    detail: "Explore tools, ask practical questions and point out what is missing.",
  },
  {
    number: "02",
    title: "Contributor",
    detail: "Share a project, improve a listing or help make a guide more useful.",
  },
  {
    number: "03",
    title: "Steward",
    detail: "Accept a defined responsibility for the catalog, community or technical work.",
  },
];

export function CommunityPage() {
  return (
    <div className="container page people-page">
      <div className="page-heading people-heading">
        <div className="eyebrow">PEOPLE & PARTICIPATION</div>
        <h1>Made useful together.</h1>
        <p>
          OIC starts with free industrial tools. It grows when builders and
          practitioners improve what everyone can find, understand and try.
        </p>
        <div className="people-heading-actions">
          <Link className="button primary" to="/share">
            Share a project <ArrowRight size={17} />
          </Link>
          <a className="people-quiet-link" href="#ways-to-join">
            Find your way in <ArrowRight size={16} />
          </a>
        </div>
      </div>

      <section className="people-stewardship" aria-labelledby="stewardship-title">
        <div className="people-stewardship-copy">
          <span className="eyebrow">CURRENT STEWARDSHIP</span>
          <h2 id="stewardship-title">One starting point. Room to grow.</h2>
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
              <div className="people-founder-mark" aria-hidden="true">{steward.initials}</div>
              <div>
                <span className="people-role-tag">{steward.role}</span>
                <h3>{steward.name}</h3>
                <p>{steward.scope}</p>
                {steward.profileUrl && (
                  <a href={steward.profileUrl} target="_blank" rel="noopener noreferrer">
                    Profile <ArrowUpRight size={14} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="people-section" id="ways-to-join" aria-labelledby="ways-title" tabIndex={-1}>
        <div className="people-section-intro">
          <span className="eyebrow">HOW TO TAKE PART</span>
          <h2 id="ways-title">Start where you can help.</h2>
          <p>
            You can contribute without joining the GitHub organization. There
            is no OIC membership fee or application for general participation.
          </p>
        </div>
        <div className="people-steps">
          {roles.map((role) => (
            <article className="people-step" key={role.number}>
              <span className="people-step-number">{role.number}</span>
              <h3>{role.title}</h3>
              <p>{role.detail}</p>
            </article>
          ))}
        </div>
        <div className="people-entry-grid">
          <Link to="/explore" className="people-entry">
            <Users size={23} strokeWidth={1.7} />
            <span><strong>Find a gap</strong><small>Try a tool and check its listing.</small></span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/share" className="people-entry">
            <GitPullRequest size={23} strokeWidth={1.7} />
            <span><strong>Share your work</strong><small>Prepare a portable project profile.</small></span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="people-section people-principles" aria-labelledby="steward-title">
        <div className="people-section-intro">
          <span className="eyebrow">AS OIC GROWS</span>
          <h2 id="steward-title">Stewardship has a job to do.</h2>
          <p>
            A steward accepts a specific scope, review partner and decision
            responsibility. Roles can cover the catalog, community, website or
            industrial practice. GitHub access follows the work; it is not a
            public badge or a prerequisite for contributing.
          </p>
        </div>
        <div className="people-principle-card">
          <ShieldCheck size={24} strokeWidth={1.6} />
          <div>
            <h3>Clear roles, visible limits</h3>
            <p>
              Individual steward profiles will appear here after each person
              accepts a role and agrees to be listed. A project listing alone
              does not make its author an OIC steward.
            </p>
          </div>
        </div>
      </section>

      <div className="people-endnote">
        <div>
          <span className="eyebrow">JOINING TODAY</span>
          <h2>Useful contributions come first.</h2>
          <p>
            Have a concrete correction, question or small task in mind? Offer a
            contribution in a public GitHub Issue. It is a starting point for
            useful work, not an application for organization access. Please do
            not post private plant or personal information there.
          </p>
        </div>
        <a className="button" href={site.participation} target="_blank" rel="noopener noreferrer">
          Offer a contribution <ArrowUpRight size={17} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      {site.discussions && (
        <a className="people-discussions" href={site.discussions} target="_blank" rel="noopener noreferrer">
          Join the OIC discussion <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}
