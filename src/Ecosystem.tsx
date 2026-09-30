import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Code2,
  FileCode2,
  Globe2,
  Layers3,
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

const howQuestions = [
  {
    title: "Finding and trying tools",
    items: [
      {
        question: "Is every tool here free?",
        answer: (
          <>
            The listed edition has an ongoing free way to use it. A required
            host platform, hardware, account, or service may have a separate
            cost. Each project page explains the free scope and known
            requirements.
          </>
        ),
      },
      {
        question: "Does “open” mean every project shares its source?",
        answer: (
          <>
            No. OIC is open to discovery and participation across business
            models. Listings label software as open source, source available, or
            closed source and link to its actual terms. Those labels describe
            different rights.
          </>
        ),
      },
      {
        question: "How do I know whether a tool fits my environment?",
        answer: (
          <>
            Start with its capabilities, free scope, platform needs, release
            stage, publisher and documentation. Follow the original project link
            and evaluate the tool under your own security and change-control
            process. A catalog page is a starting point for that decision. Read
            the <Link to="/safety">industrial use and security guide</Link> before
            connecting anything to a plant.
          </>
        ),
      },
      {
        question: "Who is behind a listing?",
        answer: (
          <>
            Each page identifies its publisher and source. Publisher-submitted
            listings are distinguished from entries OIC curated from public
            information. A listing does not make its author an OIC steward.
          </>
        ),
      },
    ],
  },
  {
    title: "Sharing a project",
    items: [
      {
        question: "What can be listed?",
        answer: (
          <>
            A useful industrial tool or edition with genuine ongoing free use, a
            responsible publisher, clear terms, practical details and a safe
            route to try or obtain it. The{" "}
            <Link to="/charter">Listing Charter</Link> explains the full
            admission standard.
          </>
        ),
      },
      {
        question: "Must I publish my source code?",
        answer: (
          <>
            No. The listing profile needs a public repository so it can be
            reviewed. The application itself may be open source, source
            available or closed source. Keep your software, releases and support
            where you choose.
          </>
        ),
      },
      {
        question: "Does the form publish or upload my project?",
        answer: (
          <>
            No. The form prepares a YAML listing in your browser and lets you
            download it. To request publication, place the profile in a public
            repository and open a listing issue. A maintainer reviews it before
            it appears on OIC.
          </>
        ),
      },
      {
        question: "What happens when I update a listing?",
        answer: (
          <>
            Registered profiles are checked for changes. OIC reviews each
            proposed update against a specific source commit before publication;
            an unsuccessful refresh leaves the last approved listing visible.
          </>
        ),
      },
    ],
  },
  {
    title: "Review and evidence",
    items: [
      {
        question: "What does OIC review today?",
        answer: (
          <>
            Automated checks catch malformed profiles and unsafe link formats. A
            maintainer checks the free path, attribution, terms, requirements,
            links and practical usefulness. This is catalog admission review,
            including for founder projects.
          </>
        ),
      },
      {
        question: "Has OIC verified these tools for production use?",
        answer: (
          <>
            No. The catalog does not certify software or independently verify
            downloads. OIC is developing separate, scoped evaluation methods
            that identify exact versions, test conditions, observations and
            limitations. Public verification claims need their own evidence and
            review.
          </>
        ),
      },
      {
        question: "Can I help without a project to list?",
        answer: (
          <>
            Yes. Try a tool, report a missing requirement or offer a concrete
            improvement. Industrial practitioners can help identify the
            questions and failure modes that future evaluations should address.{" "}
            <Link to="/community">See ways to take part</Link>.
          </>
        ),
      },
    ],
  },
];

export function HowItWorks() {
  return (
    <div className="container page how-guide-page">
      <header className="how-guide-hero">
        <span className="eyebrow">HOW IT WORKS</span>
        <h1>
          Find a tool. <span>Understand it.</span> Share what you build.
        </h1>
        <p>
          OIC starts with useful free industrial software and clear information.
          Here is how to explore the catalog, contribute a listing, and
          understand what its review means.
        </p>
        <Link className="how-safety-link" to="/safety">
          Use & security guidance <ArrowRight size={16} />
        </Link>
      </header>

      <section
        className="how-answers"
        id="quality"
        tabIndex={-1}
        aria-labelledby="answers-title"
      >
        <div className="how-answers-intro">
          <span className="eyebrow">GOOD TO KNOW</span>
          <h2 id="answers-title">What keeps the catalog useful?</h2>
          <p>
            Direct answers to the questions that matter before trying a tool or
            sharing one.
          </p>
          <Link to="/charter">
            Read the Listing Charter <ArrowRight size={16} />
          </Link>
        </div>
        <div className="how-answer-groups">
          {howQuestions.map((group) => (
            <section className="how-answer-group" key={group.title}>
              <h3>{group.title}</h3>
              {group.items.map((item) => (
                <details key={item.question} className="how-answer">
                  <summary>
                    <span>{item.question}</span>
                    <ChevronDown size={19} />
                  </summary>
                  <div className="how-answer-body">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </section>
          ))}
        </div>
      </section>

      <section className="how-journey-section" aria-labelledby="journey-title">
        <div className="how-journey-intro">
          <span className="eyebrow">YOUR NEXT STEP</span>
          <h2 id="journey-title">Put the answers to work.</h2>
        </div>
        <div className="how-journeys" aria-label="Two ways to use OIC">
          <section className="how-journey">
            <span className="how-journey-label">FOR PEOPLE EXPLORING</span>
            <h2>From search to a sensible trial.</h2>
            <ol>
              <li>
                <b>01</b>
                <span>Find a tool for the work you need to do.</span>
              </li>
              <li>
                <b>02</b>
                <span>Check its free scope, terms and requirements.</span>
              </li>
              <li>
                <b>03</b>
                <span>Visit the maker and evaluate it for your setting.</span>
              </li>
            </ol>
            <Link to="/explore">
              Explore tools <ArrowRight size={17} />
            </Link>
          </section>
          <section className="how-journey">
            <span className="how-journey-label">FOR PEOPLE BUILDING</span>
            <h2>From your project to a clear listing.</h2>
            <ol>
              <li>
                <b>01</b>
                <span>Describe the free edition in a portable profile.</span>
              </li>
              <li>
                <b>02</b>
                <span>Keep the project and releases under your control.</span>
              </li>
              <li>
                <b>03</b>
                <span>Request a listing for human review.</span>
              </li>
            </ol>
            <Link to="/share">
              Prepare a listing <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </section>

      <section className="how-guide-end">
        <div>
          <span className="eyebrow">THE BIGGER IDEA</span>
          <h2>Build. Share. Prove.</h2>
          <p>
            Discovery is the first step. OIC's broader work is to help
            industrial expertise become useful technology and, over time, make
            claims about that technology inspectable.
          </p>
        </div>
        <Link to="/about">
          Why OIC exists <ArrowRight size={17} />
        </Link>
      </section>
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
