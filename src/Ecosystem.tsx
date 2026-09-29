import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileCode2,
  Globe2,
  Layers3,
  Search,
  Users,
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
    <div className="container page ecosystem-page">
      <div className="page-heading">
        <div className="eyebrow">HOW OIC WORKS</div>
        <h1>
          Your project.
          <br />
          <span>A wider connection.</span>
        </h1>
        <p>
          Keep your software where it belongs. Share a small description that
          helps people find it, understand it, and get started.
        </p>
      </div>
      <div className="three-columns flow-cards">
        <section className="info-card">
          <Code2 />
          <span className="eyebrow">01 / KEEP YOUR HOME</span>
          <h2>You own the project.</h2>
          <p>
            Your code, releases, license, and support stay with you. A
            closed-source tool can link to its own website and downloads.
          </p>
        </section>
        <section className="info-card">
          <FileCode2 />
          <span className="eyebrow">02 / DESCRIBE IT ONCE</span>
          <h2>A file people can read.</h2>
          <p>
            YAML is a plain-text format: a few named fields for what your tool
            does, who maintains it, what’s free, and what it needs.
          </p>
        </section>
        <section className="info-card">
          <Globe2 />
          <span className="eyebrow">03 / MAKE A CONNECTION</span>
          <h2>Help people discover it.</h2>
          <p>
            OIC turns included listing files into searchable project pages, with
            links back to the original project.
          </p>
        </section>
      </div>
      <section className="yaml-story">
        <div>
          <div className="eyebrow">MEET PROJECT.YAML</div>
          <h2>A description you can take with you.</h2>
          <p>
            Use the form if you prefer. It creates the same file you could write
            in a text editor. Keep it alongside your project as{" "}
            <code>.oic/project.yaml</code>, or share it separately.
          </p>
          <p>
            The file describes the software; it does not upload the software.
            Include public information only, never secrets or plant data. Its
            format is published, so another catalog could read it too. There is
            no automatic discovery or synchronization today.
          </p>
          <Link className="button primary" to="/share">
            Make your listing <ArrowRight size={16} />
          </Link>
          <a className="text-link" href="/templates/project.yaml" download>
            Download the full template <ArrowRight size={16} />
          </a>
        </div>
        <figure className="yaml-example">
          <figcaption>
            <FileCode2 size={18} /> project.yaml{" "}
            <span>Illustrative excerpt</span>
          </figcaption>
          <pre>
            <code>{`name: Example module
summary: Explain the job it helps someone do.
platforms: [Ignition]
source: closed-source
cost: free
software_requirements: paid-platform-required
cost_notes: >-
  The module is free. A compatible Ignition
  license is required separately.
maintainer: Your team
get_started: https://example.org/start`}</code>
          </pre>
          <p>
            A few fields from a listing, not a downloadable project. The full
            template includes terms, attribution, and the other required fields.
          </p>
        </figure>
      </section>
      <section className="ecosystem-section" id="participation" tabIndex={-1}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">OPEN PARTICIPATION</div>
            <h2>No permission needed to build or share.</h2>
          </div>
        </div>
        <div className="two-columns">
          <div>
            <h3>Your project is yours.</h3>
            <p>
              Anyone can create a YAML file and publish it with their project.
              You don’t need an OIC account, a membership fee, or our approval
              to do that. Your project can also appear in other directories.
            </p>
          </div>
          <div>
            <h3>This catalog has clear inclusion checks.</h3>
            <p>
              OIC maintainers currently decide what appears on this site. We
              check useful free access, attribution, links, and honest
              requirements. Those checks apply equally to founder projects and
              everyone else.
            </p>
            <Link className="text-link" to="/guide#review">
              Read the inclusion checks <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="ecosystem-section" id="quality" tabIndex={-1}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">USEFUL INFORMATION, VISIBLE LIMITS</div>
            <h2>What keeps the catalog useful?</h2>
          </div>
        </div>
        <div className="three-columns">
          <section className="info-card">
            <FileCode2 />
            <h3>Consistent information</h3>
            <p>
              Automatic checks require the expected fields, supported values,
              and HTTPS link formats. They reject malformed listings. A valid
              file can still contain an inaccurate claim.
            </p>
            <span className="small-text">
              Working now: local validation and catalog build checks.
            </span>
          </section>
          <section className="info-card">
            <Search />
            <h3>Claims with a source</h3>
            <p>
              Listing review checks the project’s public terms, access,
              attribution, and requirements. Every catalog page shows where the
              listing came from and when it was reviewed.
            </p>
            <span className="small-text">
              Working now: a small, manually reviewed catalog.
            </span>
          </section>
          <section className="info-card">
            <Users />
            <h3>Room for correction</h3>
            <p>
              People using a tool can spot missing requirements and misleading
              claims. Project pages let you prepare a correction note and open an issue for review.
            </p>
            <span className="small-text">
              Save a note, then open a correction issue in the public catalog.
            </span>
          </section>
        </div>
        <p className="catalog-note">
          These checks reduce incomplete or misleading listings. They do not
          scan downloads, verify every claim, or certify software for
          production. Follow the project’s terms and evaluate it for your
          environment.
        </p>
      </section>
      <div className="notice">
        <FileCode2 size={24} />
        <div>
          <h3>What happens when I open a YAML file here?</h3>
          <p>
            It stays in your browser for validation and preview. Download to
            save your work. Nothing is sent until you open a listing request on GitHub. Registered profiles are checked daily; every published change requires review.
          </p>
          <Link className="text-link" to="/guide">
            Follow the listing guide <ArrowRight size={16} />
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
          <span className="platform-status">
            First browser preview listed
          </span>
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
