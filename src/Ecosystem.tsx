import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileCode2,
  Globe2,
  Layers3,
  ShieldCheck,
} from "lucide-react";

function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="text-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={16} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function HowItWorks() {
  return (
    <div className="container page story-page how-page">
      <header className="story-hero">
        <span className="eyebrow">HOW IT WORKS</span>
        <h1>
          From project to
          <br />
          <span>findable tool.</span>
        </h1>
        <p>
          The practical route for a maker to put a free industrial tool in front
          of the people who need it.
        </p>
        <Link className="button primary" to="/share">
          Prepare a listing <ArrowRight size={17} />
        </Link>
      </header>
      <div className="how-track" aria-label="Listing steps">
        <article>
          <span>01</span>
          <div>
            <h2>Describe the tool</h2>
            <p>
              Use the guided form or write a portable{" "}
              <code>.oic/project.yaml</code> file. Name the free edition, maker,
              terms, requirements, and a working path to try it.
            </p>
          </div>
          <FileCode2 size={27} />
        </article>
        <article>
          <span>02</span>
          <div>
            <h2>Request a listing</h2>
            <p>
              Keep software and releases where you choose. Share a public
              profile repository so OIC can review the exact version you want
              listed.
            </p>
          </div>
          <Code2 size={27} />
        </article>
        <article>
          <span>03</span>
          <div>
            <h2>Get discovered</h2>
            <p>
              After review, the listing becomes a searchable page with links
              back to your project. Later profile changes also wait for review
              before publication.
            </p>
          </div>
          <Globe2 size={27} />
        </article>
      </div>
      <section className="how-check" id="quality" tabIndex={-1}>
        <div>
          <span className="eyebrow">WHAT REVIEW MEANS</span>
          <h2>What keeps the catalog useful?</h2>
          <p>
            Automated checks catch missing fields and unsafe link formats. A
            maintainer checks the free access, attribution, terms, requirements,
            and destinations against the submitted source.
          </p>
          <Link className="text-link" to="/charter">
            Read the Listing Charter <ArrowRight size={16} />
          </Link>
        </div>
        <aside>
          <ShieldCheck size={25} />
          <h3>Clear limits</h3>
          <p>
            Catalog review does not test downloads, independently verify every
            claim, or certify a tool for production. Evaluate it for your own
            environment.
          </p>
        </aside>
      </section>
      <section className="how-faq">
        <h2>Good to know</h2>
        <details>
          <summary>Does my source code need to be public?</summary>
          <p>
            No. The listing file needs a public home for review. Software can be
            open source, source available, or closed source, with its actual
            terms stated.
          </p>
        </details>
        <details>
          <summary>Does the form submit my project?</summary>
          <p>
            No. It prepares and downloads a YAML file in your browser. You then
            request a listing through the public repository.
          </p>
        </details>
        <details>
          <summary>Can a free tool require a paid platform?</summary>
          <p>
            Yes. The listed edition must be free, and a required commercial host
            or service cost must be disclosed clearly.
          </p>
        </details>
      </section>
      <div className="story-bottom">
        <div>
          <span className="eyebrow">READY TO SHARE?</span>
          <h2>Start with a draft.</h2>
          <p>
            You can prepare a profile without creating an OIC account. Download
            it and keep control of your project.
          </p>
        </div>
        <div className="story-next">
          <Link to="/share">
            Open the listing form <ArrowRight size={17} />
          </Link>
          <Link to="/guide">
            Read the full listing guide <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Platforms() {
  return (
    <div className="container page ecosystem-page">
      <div className="page-heading">
        <div className="eyebrow">PLATFORMS & ECOSYSTEMS</div>
        <h1>
          Useful tools.
          <br />
          <span>Clear requirements.</span>
        </h1>
        <p>
          Every listed tool has a useful free edition. Required platforms,
          hardware, and services may have separate costs.
        </p>
      </div>
      <div className="two-columns cost-cards">
        <section className="info-card">
          <Code2 />
          <h2>Free software setup available</h2>
          <p>
            The listed edition has a way to run without buying a software
            license. You still provide hardware or hosting, and any optional
            services.
          </p>
          <Link className="text-link" to="/explore?software=no-paid-required">
            Find these tools <ArrowRight size={16} />
          </Link>
        </section>
        <section className="info-card">
          <Layers3 />
          <h2>Paid platform required</h2>
          <p>
            A free module or add-on can extend a platform you already use. Its
            host license or required modules may cost money. Those requirements
            belong beside the free label.
          </p>
          <Link className="text-link" to="/share">
            Describe your tool’s requirements <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <section className="platform-feature" id="ignition" tabIndex={-1}>
        <div className="platform-identity">
          <span className="eyebrow">PLATFORM SPOTLIGHT</span>
          <h2 className="sr-only">Ignition by Inductive Automation®</h2>
          <img
            className="platform-logo"
            src="/images/ignition-official-dark.png"
            alt="Ignition by Inductive Automation®"
            width="375"
            height="175"
          />
          <span className="platform-status">First browser preview listed</span>
        </div>
        <div>
          <h3>Free additions to an industrial platform.</h3>
          <p>
            Some early OIC projects are being built for Ignition. Each listing
            will explain compatible versions, required modules, and any
            separately licensed platform components. Dimension Engine Showcase
            is a public browser preview; additional projects are in preparation.
          </p>
          <p>
            Ignition Maker Edition is for personal, noncommercial use. It is not
            a free production license for a business.
          </p>
          <Out href="https://inductiveautomation.com/ignition/maker-edition">
            Read Maker Edition terms
          </Out>
          <p className="small-text">
            Ignition by Inductive Automation® is a registered trademark of
            Inductive Automation. OIC is an independent catalog; this reference
            does not imply a partnership, endorsement, or support from Inductive
            Automation.
          </p>
        </div>
      </section>
      <section className="ecosystem-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MORE THAN ONE WAY TO BE FOUND</div>
            <h2>A project can belong in several places.</h2>
          </div>
        </div>
        <div className="three-columns">
          <section className="info-card">
            <Layers3 />
            <h3>Module Showcase</h3>
            <p>
              Inductive Automation’s directory for third-party Ignition modules,
              including free and paid offerings. Authors apply for a listing and
              maintain their project destination.
            </p>
            <Out href="https://inductiveautomation.com/moduleshowcase/">
              Visit the Module Showcase
            </Out>
          </section>
          <section className="info-card">
            <FileCode2 />
            <h3>Ignition Exchange</h3>
            <p>
              Community resources for Ignition: scripts, UDTs, views, templates,
              and projects. Modules go to the Showcase. Public Exchange uploads
              require MIT licensing under its terms.
            </p>
            <Out href="https://inductiveautomation.com/exchange/">
              Explore the Exchange
            </Out>
          </section>
          <section className="info-card">
            <Globe2 />
            <h3>Open Industrial Collective</h3>
            <p>
              Discover free tools across platforms. See the job they help you
              do, their terms and requirements, and the route back to their
              creators. Keep your existing listings elsewhere.
            </p>
            <Link className="text-link" to="/how-it-works">
              How OIC connects projects <ArrowRight size={16} />
            </Link>
          </section>
        </div>
        <div className="platform-references">
          <span>For contributors:</span>
          <Out href="https://inductiveautomation.com/moduleshowcase/developer/">
            Module submission guidance
          </Out>
          <Out href="https://inductiveautomation.com/exchange/about">
            Exchange FAQ
          </Out>
          <Out href="https://inductiveautomation.com/exchange/terms">
            Exchange terms
          </Out>
        </div>
        <p className="catalog-note">
          These are links to independent resources. OIC does not import their
          catalogs or republish their downloads. External listings have their
          own submission rules and licenses.
        </p>
      </section>
      <section className="ecosystem-section">
        <h2>Start with the work. Find the platform that fits.</h2>
        <p>
          Ignition is one starting point. The same listing format works for
          standalone tools, open-source stacks, and free extensions to other
          commercial platforms.
        </p>
        <Link className="button primary" to="/explore">
          Explore the toolbox <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
