import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigationType,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  ArrowLeft,
  Box,
  Boxes,
  Cable,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  FileCode2,
  GitPullRequest,
  Globe2,
  Layers3,
  Menu,
  MessageSquare,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { stringify } from "yaml";
import data from "./catalog.generated.json";
import {
  parseProject,
  sourceLabels,
  softwareLabels,
  type Category,
  type Listing,
  type Project,
} from "./catalog";
import { site } from "./site.config";
import { HowItWorks, Platforms } from "./Ecosystem";
import { OicMark } from "./Logo";
import { ShowcasePreview } from "./ShowcasePreview";
import { ProfileEditor } from "./ProfileEditor";
import { actionLabel } from "./profile";
import { ProfileText, ProfileSections } from "./ProfileContent";
import { CollectiveSculpture } from "./CollectiveSculpture";
import { CommunityPage } from "./CommunityPage";
import { pageSeo } from "./seo";
import { CharterPage } from "./CharterPage";
import Explore, { FitDetails, DiscoveryGlossary } from "./Explore";
const projects = data as Listing[];
const publishedProjects = projects.filter(
  (project) => project.listing.origin === "community",
);
const categoryIcons: Record<Category, LucideIcon> = {
  "Data & connectivity": Cable,
  Visualization: Layers3,
  Operations: Settings2,
  Engineering: Box,
  "AI & automation": Workflow,
};
function Icon({ project, size = 26 }: { project: Project; size?: number }) {
  if (project.profile?.branding?.logo.on_light)
    return (
      <span className="project-icon">
        <img
          width={size}
          height={size}
          src={project.profile.branding.logo.on_light}
          alt={project.profile.branding.logo.alt}
        />
      </span>
    );
  const I = categoryIcons[project.category];
  return (
    <span className={`project-icon ${project.id}`}>
      <I size={size} strokeWidth={1.6} />
    </span>
  );
}
function External({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={16} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
function download(name: string, value: string, type = "text/yaml") {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const scrollPositions = new Map<string, number>();
function ScrollAndTitle() {
  const { pathname, hash, key, search } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    const remember = () => {
      scrollPositions.set(key, window.scrollY);
      if (pathname === "/explore")
        scrollPositions.set(pathname + search, window.scrollY);
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [key, pathname, search]);
  useEffect(() => {
    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = original;
    };
  }, []);
  useEffect(() => {
    const seo = pageSeo(pathname);
    document.title = seo.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", seo.description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (seo.canonical) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.append(canonical);
      }
      canonical.setAttribute("href", seo.canonical);
    } else canonical?.remove();
    let robots = document.querySelector('meta[name="robots"]');
    if (seo.noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.append(robots);
      }
      robots.setAttribute("content", "noindex, follow");
    } else robots?.remove();
    for (const [property, content] of Object.entries({
      "og:title": seo.title,
      "og:description": seo.description,
      "og:url": seo.canonical || "",
      "og:image": seo.image,
    })) {
      document
        .querySelector(`meta[property="${property}"]`)
        ?.setAttribute("content", content);
    }
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute("content", seo.title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", seo.description);
    document
      .querySelector('meta[name="twitter:image"]')
      ?.setAttribute("content", seo.image);
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else
      window.scrollTo(
        0,
        (navigationType === "POP"
          ? scrollPositions.get(key)
          : pathname === "/explore"
            ? scrollPositions.get(pathname + search)
            : 0) || 0,
      );
    (target || document.querySelector("main"))?.focus({ preventScroll: true });
  }, [pathname, hash]);
  return null;
}
export default function App() {
  const [menu, setMenu] = useState(false);
  const { pathname, search, hash } = useLocation();
  const header = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => setMenu(false), [pathname, search, hash]);
  useEffect(() => {
    if (!menu) return;
    const dismiss = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuToggle.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 901px)");
    const resize = () => {
      if (desktop.matches) setMenu(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, [menu]);
  return (
    <>
      <ScrollAndTitle />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header
        ref={header}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setMenu(false);
        }}
        className={`header ${pathname === "/" ? "header-home" : ""}`}
      >
        <div className="container header-inner">
          <Link
            className="brand"
            to="/"
            aria-label="Open Industrial Collective home"
          >
            <span className="brand-symbol">
              <OicMark />
            </span>
            <span className="brand-name">
              Open Industrial
              <br />
              Collective
            </span>
          </Link>
          <button
            ref={menuToggle}
            className="menu-toggle"
            aria-controls="main-navigation"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <nav
            id="main-navigation"
            aria-label="Main navigation"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) setMenu(false);
            }}
            className={menu ? "open" : ""}
          >
            <NavLink to="/explore">Explore tools</NavLink>
            <NavLink to="/about">Why OIC</NavLink>
            <NavLink to="/how-it-works">How it works</NavLink>
            <NavLink to="/community">People & join</NavLink>
            <NavLink className="nav-share" to="/share">
              Share a project
            </NavLink>
          </nav>
          <Link className="button header-share" to="/share">
            <span>Share a project</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/glossary" element={<DiscoveryGlossary />} />
          <Route path="/projects/:id" element={<Detail />} />
          <Route path="/share" element={<ProfileEditor />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/charter" element={<CharterPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        <div className="container footer-top">
          <Link to="/" className="footer-brand">
            <OicMark />
            <span>Open Industrial Collective</span>
          </Link>
          <span>Free tools. Shared progress.</span>
          <div>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/platforms">Platforms</Link>
            <Link to="/guide">Listing guide</Link>
            <Link to="/charter">Listing Charter</Link>
            <Link to="/community">People & join</Link>
            <Link to="/guide#review">How we review</Link>
            <a href="/data/catalog.json">Catalog data</a>
            <Link to="/about">About</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            Initiated by Grindstone Systems. Built for the industrial community.
          </span>
          <span>Early access · Help shape what comes next.</span>
        </div>
      </footer>
    </>
  );
}
function Home() {
  const [query, setQuery] = useState("");
  const featured = publishedProjects.find(
    (project) => project.id === site.featuredProject,
  );
  return (
    <div className="workshop-home">
      <section className="container workshop-opening">
        <div className="workshop-hero-layout">
          <div className="workshop-hero-copy">
            <span className="workshop-edition">
              Free industrial tools, in one place
            </span>
            <h1>
              Find the tool.
              <br className="desktop-break" /> Get to work.
            </h1>
            <p className="workshop-intro">
              Discover useful industrial software, see exactly what’s free, and
              go straight to its maker.
            </p>
            <div className="workshop-actions">
              <Link className="button primary" to="/explore">
                Explore tools <ArrowRight size={18} />
              </Link>
              <Link className="workshop-why" to="/#why-oic">
                Why OIC? <ArrowDown size={16} />
              </Link>
            </div>
          </div>
          <div className="workshop-brand-art">
            <CollectiveSculpture />
            <span>Built to move useful work forward.</span>
          </div>
        </div>
        <div className="workshop-search-row">
          <form className="workshop-search" action="/explore" role="search">
            <Search size={19} />
            <input
              aria-label="Search tools"
              name="q"
              placeholder="Search tools, tasks, or platforms"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              Search <ArrowRight size={17} />
            </button>
          </form>
          <p>
            Every listed edition is free to use. Platform costs are shown
            clearly.
          </p>
        </div>
      </section>
      {featured && (
        <section
          className="container workshop-feature"
          aria-label="Featured project"
        >
          <div className="workshop-section-label">
            <span>See what’s inside</span>
            <span className="feature-kind">
              {featured.profile?.access.edition || featured.category}
            </span>
          </div>
          <article className="workshop-project">
            <div className="workshop-project-title">
              <span className="project-byline">
                <span /> Featured tool
              </span>
              <h2>
                <Link to={`/projects/${featured.id}`}>{featured.name}</Link>
              </h2>
            </div>
            <ShowcasePreview media={featured.profile?.media} priority />
            <div className="workshop-project-copy">
              <p>{featured.summary}</p>
            </div>
            <div className="workshop-project-actions">
              <External className="button primary" href={featured.get_started}>
                {featured.profile
                  ? actionLabel(
                      featured.profile.actions.find((a) => a.primary)!,
                    )
                  : "Get started"}
              </External>
              <Link
                className="workshop-details"
                to={`/projects/${featured.id}`}
              >
                Project details & requirements <ArrowRight size={16} />
              </Link>
              <span>
                By {featured.maintainer}
                {featured.profile?.access.account_required === false &&
                  " · No account needed"}
              </span>
            </div>
          </article>
        </section>
      )}
      <section className="workshop-purpose" id="why-oic" tabIndex={-1}>
        <div className="container workshop-purpose-inner">
          <div className="workshop-section-label">
            <span>Why OIC exists</span>
            <OicMark />
          </div>
          <h2>Good tools should be easier to find.</h2>
          <div className="workshop-purpose-copy">
            <p>
              Builders keep their projects. OIC gives people one clear place to
              discover them and understand access, terms, and requirements.
            </p>
            <Link className="workshop-link" to="/about">
              More about OIC <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container workshop-contribute">
        <span className="workshop-small-label">Built something useful?</span>
        <h2>Put your tool on the map.</h2>
        <div>
          <p>
            Share a free edition with clear terms and a direct way to try it.
          </p>
          <Link className="button primary" to="/share">
            Prepare a listing <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="workshop-contribute-note">
          Your software stays with you. OIC reviews the listing before
          publication.{" "}
          <Link to="/how-it-works">
            How sharing works <ArrowRight size={14} />
          </Link>
        </span>
      </section>
    </div>
  );
}
function ProjectCard({
  project: p,
  preview = false,
}: {
  project: Project;
  preview?: boolean;
}) {
  const isExample = (p as Listing).listing?.origin === "curated";
  return (
    <article
      className={`project-card ${preview ? "preview-card" : ""} ${isExample ? "example-card" : ""}`}
    >
      {p.profile?.media?.[0]?.type === "image" && !preview && (
        <img
          className="card-preview-image"
          src={
            p.profile!.media![0].type === "image"
              ? p.profile!.media![0].poster || p.profile!.media![0].src
              : ""
          }
          alt={
            p.profile!.media![0].type === "image"
              ? p.profile!.media![0].alt
              : ""
          }
          width="1048"
          height="762"
          loading="lazy"
        />
      )}
      <div className="card-top">
        <Icon project={p} />
        <span className="free-label">
          {isExample ? "EXAMPLE · FREE TO USE" : "FREE TO USE"}
        </span>
      </div>
      <span className="card-category">{p.category}</span>
      <h3>
        {preview ? (
          p.name
        ) : (
          <Link to={`/projects/${p.id}`}>
            {p.name}
            <ArrowUpRight size={20} />
          </Link>
        )}
      </h3>
      <p>{p.summary}</p>
      <div className="tags">
        {p.tags.slice(0, 3).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <p
        className={`software-note ${p.software_requirements === "paid-platform-required" ? "paid" : ""}`}
      >
        <Layers3 size={14} />{" "}
        {softwareLabels[p.software_requirements || "see-terms"]}
      </p>
      <div className="card-bottom">
        <span>
          <Code2 size={14} />
          {sourceLabels[p.source]}
        </span>
        <span>{p.license}</span>
      </div>
    </article>
  );
}
function ListingCorrection({ project }: { project: Listing }) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <details className="listing-details correction">
      <summary>
        Suggest a correction <ChevronRight size={16} />
      </summary>
      <p>Help clarify a term, fix a link, or explain a missing requirement.</p>
      <label className="field">
        <span>What should change?</span>
        <textarea
          rows={4}
          maxLength={5000}
          placeholder="Describe the correction and include a public source, if available."
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setSaved(false);
          }}
        />
      </label>
      <button
        className="button"
        disabled={!note.trim()}
        onClick={() => {
          download(
            `${project.id}-correction.md`,
            `# Listing correction: ${project.name}\n\nListing: ${site.url}/projects/${project.id}\nProject: ${project.homepage}\n\n## Suggested correction\n\n${note.trim()}\n`,
            "text/markdown",
          );
          setSaved(true);
        }}
      >
        <Download size={16} />
        Download correction note
      </button>
      <p className="small-text">
        Download your note, then attach it to a correction issue in the public
        catalog.
      </p>
      <a
        className="text-link"
        href={`${site.repository}/issues/new?template=correction.yml`}
      >
        Open a correction issue ↗
      </a>
      <p role="status" className="feedback">
        {saved ? "Downloaded. No report has been sent." : ""}
      </p>
    </details>
  );
}
function Detail() {
  const { id } = useParams();
  const location = useLocation();
  const backTo =
    typeof location.state?.explore === "string" &&
    /^\/explore(?:\?|$)/.test(location.state.explore)
      ? location.state.explore
      : "/explore";
  const p = projects.find((p) => p.id === id);
  if (!p) return <NotFound />;
  const related = publishedProjects
    .filter((project) => project.id !== p.id)
    .slice(0, 3);
  const manifest = () => {
    if (p.authored) return stringify(p.authored);
    const { listing: _, ...manifest } = p;
    return stringify(manifest);
  };
  return (
    <div className="container page">
      <Link className="back" to={backTo}>
        <ArrowLeft size={16} />
        All tools
      </Link>
      <div className="detail-heading">
        <Icon project={p} size={38} />
        <div>
          <div className="eyebrow">{p.category}</div>
          <h1>{p.name}</h1>
          <p>By {p.maintainer}</p>
        </div>
        <span className="free-label">
          {p.listing.origin === "curated"
            ? "EXAMPLE LISTING · FREE TO USE"
            : "FREE TO USE"}
        </span>
      </div>
      <div className="detail-layout">
        <div>
          <ShowcasePreview media={p.profile?.media} />
          <p className="detail-summary">{p.summary}</p>
          <div className="tags">
            {p.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>

          <section className="detail-section">
            <h2>What it does</h2>
            <ProfileText>{p.description}</ProfileText>
          </section>
          <section className="detail-section">
            <h2>What’s free & what you’ll need</h2>
            <p className="software-note">
              {softwareLabels[p.software_requirements || "see-terms"]}
            </p>
            <p>{p.cost_notes}</p>
            <Link className="text-link" to="/platforms">
              Understand platform costs <ArrowRight size={15} />
            </Link>
            <div className="platforms">
              {p.platforms.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>License & access</h2>
            <div className="access-facts">
              <span>
                <Code2 size={21} />
                {sourceLabels[p.source]}
              </span>
              <span>
                <CheckCircle2 size={21} />
                Listed edition is free
              </span>
            </div>
            <p>
              {p.source === "open-source"
                ? "Source code is available under the license below. Check the terms before modifying or redistributing."
                : p.source === "source-available"
                  ? "You can inspect the source, but the license may limit modifications or redistribution."
                  : "Source code is not published. The software is available under the provider’s free-use terms."}
            </p>
            <External href={p.license_url} className="text-link">
              Read {p.license}
              {/terms$/i.test(p.license) ? "" : " terms"}
            </External>
          </section>
          <FitDetails project={p} />
          {p.profile && <ProfileSections profile={p.profile} />}
          <details className="listing-details">
            <summary>
              About this listing <ChevronRight size={16} />
            </summary>
            <p>
              {p.listing.origin === "curated"
                ? `Curated by OIC from the project’s public pages. Not submitted by the original maintainer.`
                : `Submitted by ${p.listing.submitted_by || p.maintainer} and reviewed for publication by OIC.`}{" "}
              Listing reviewed {p.listing.reviewed}. This does not establish
              affiliation, a security audit, or production certification.
            </p>
            {p.listing.source && (
              <p>
                Profile source:{" "}
                <External
                  href={`https://github.com/${p.listing.source.repository}/tree/${p.listing.source.commit}`}
                >
                  Approved repository snapshot ·{" "}
                  {p.listing.source.commit.slice(0, 7)}
                </External>
              </p>
            )}
            <button
              className="text-link"
              onClick={() => download(`${p.id}.yaml`, manifest())}
            >
              <Download size={16} />
              Download listing YAML
            </button>
            <Link className="text-link review-link" to="/guide#review">
              What listing review means <ArrowRight size={15} />
            </Link>
          </details>
          <ListingCorrection project={p} />
        </div>
        <aside className="get-started">
          <div className="eyebrow">
            {p.profile?.access.edition || "MAKE SOMETHING WITH IT"}
          </div>
          <h2>Start exploring.</h2>
          <p>
            {p.profile?.actions.find((a) => a.primary)?.description ||
              "Get the tool and setup instructions directly from its creators."}
          </p>
          {p.profile ? (
            [...p.profile.actions]
              .sort((a, b) => Number(b.primary) - Number(a.primary))
              .map((a) => (
                <External
                  key={a.id}
                  className={`button ${a.primary ? "primary" : "secondary"}`}
                  href={a.url}
                >
                  {actionLabel(a)}
                </External>
              ))
          ) : (
            <External className="button primary" href={p.get_started}>
              Get started
            </External>
          )}
          {p.profile?.resources?.length ? (
            <a className="resource-jump" href="#get-files">
              <Download size={16} /> Browse files & resources{" "}
              <ArrowRight size={15} />
            </a>
          ) : null}
          <div className="resource-links">
            <External href={p.homepage}>
              <Globe2 size={17} />
              Project website
            </External>
            {p.repository && (
              <External href={p.repository}>
                <Code2 size={17} />
                Source repository
              </External>
            )}
            {p.documentation && (
              <External href={p.documentation}>
                <FileCode2 size={17} />
                Documentation
              </External>
            )}
          </div>
          {p.profile?.links &&
            Object.entries(p.profile.links)
              .filter(([key]) => !["homepage", "docs"].includes(key))
              .map(([key, url]) => (
                <External className="text-link" key={key} href={url!}>
                  {key[0].toUpperCase() + key.slice(1)}
                </External>
              ))}
          <span className="small-text">
            Downloads and support are provided by the project.
          </span>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="related">
          <div className="section-heading">
            <h2>Keep exploring.</h2>
            <Link className="text-link" to="/explore">
              All tools <ArrowRight size={16} />
            </Link>
          </div>
          <div className="project-grid">
            {related.map((x) => (
              <ProjectCard key={x.id} project={x} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
function About() {
  return (
    <div className="container page about-page story-page">
      <header className="story-hero">
        <span className="eyebrow">WHY OIC</span>
        <h1>
          Useful tools get lost.
          <br />
          <span>We bring them into view.</span>
        </h1>
        <p>
          Industrial software is built in workshops, plants, studios, and small
          teams everywhere. OIC helps the next person find that work and
          understand whether it fits.
        </p>
        <Link className="button primary" to="/explore">
          Explore the catalog <ArrowRight size={17} />
        </Link>
      </header>
      <section className="story-statement" aria-label="Our purpose">
        <span>THE IDEA</span>
        <p>
          One clear listing can turn a useful project into a useful starting
          point for someone else.
        </p>
        <OicMark />
      </section>
      <section className="story-grid" aria-label="What we believe">
        <article>
          <span>01</span>
          <h2>Access should be clear.</h2>
          <p>
            Every listed tool has a free edition. We show its scope, required
            platforms, and any separate costs.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Words should mean something.</h2>
          <p>
            Open source, source available, and closed source are distinct. Each
            listing links to the actual terms.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Credit stays with the maker.</h2>
          <p>
            Projects keep their own home, identity, releases, and support. OIC
            points people to them.
          </p>
        </article>
      </section>
      <section className="story-bottom">
        <div>
          <span className="eyebrow">WHERE WE ARE TODAY</span>
          <h2>A small catalog with room to grow.</h2>
          <p>
            OIC is initiated and maintained by Grindstone Systems. Listings are
            reviewed for clear access and accurate presentation; that review is
            not a safety or production certification.
          </p>
        </div>
        <div className="story-next">
          <Link to="/how-it-works">
            How listings work <ArrowRight size={17} />
          </Link>
          <Link to="/community">
            Meet the people and take part <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
function Guide() {
  return (
    <div className="container page guide-page">
      <div className="page-heading">
        <div className="eyebrow">CONTRIBUTOR GUIDE</div>
        <h1>One small file. A useful connection.</h1>
        <p>
          Your project stays in its own home. Publish a profile in your
          repository, then request a listing.
        </p>
      </div>
      <div className="guide-layout">
        <div>
          <section className="guide-step">
            <b>01</b>
            <div>
              <h2>Describe the actual tool</h2>
              <p>
                Give it a short description, category, platforms, and a working
                link to get started. Name the creator or maintainer. List only
                public information you have permission to share.
              </p>
              <p>
                Describe a genuinely useful free tool or edition, rather than a
                time-limited trial. State what is free, who can use it, any
                limits, and what it needs: hardware, a host platform, an
                account, hosting, integration, or support. Separate optional
                paid extras from the free scope; reviewers need the actual
                terms.
              </p>
            </div>
          </section>
          <section className="guide-step">
            <b>02</b>
            <div>
              <h2>Make the terms clear</h2>
              <p>
                Choose open source, source available, or closed source. Link to
                the license or free-use terms. A public repository alone doesn’t
                mean a project is open source.
              </p>
              <p>
                Closed-source tools don’t need a public code repository. They do
                need a legitimate way to access the free software and read its
                terms.
              </p>
              <p>
                Add the files and resources people need: a repository, release
                package, container image or document. Link each item to the
                location you manage, and name separate terms or platform
                requirements when they differ.
              </p>
            </div>
          </section>
          <section className="guide-step">
            <b>03</b>
            <div>
              <h2>Preview, then propose</h2>
              <p>
                Use the form or open an existing YAML file to preview the
                listing. Save it as <code>.oic/project.yaml</code> with your
                logo, screenshots and optional overview file. Commit them to
                your repository, then request a listing. A public listing-only
                repository works for private software.
              </p>
              <p>
                {site.repository
                  ? "Request a listing using your public profile repository."
                  : "The public contribution repository is not connected yet. You can prepare and download your listing now; it will not be published automatically."}
              </p>
            </div>
          </section>
          <section className="guide-step" id="review" tabIndex={-1}>
            <b>04</b>
            <div>
              <h2>A person reviews it</h2>
              <p>
                Inclusion depends on a useful ongoing free edition, accurate
                attribution, working project and terms links, clear
                requirements, and an honest description. A maintainer checks
                these before publication; updates follow the same process.
                Curated links and community submissions are labeled separately.
              </p>
              <p>
                Spam, impersonation, misleading free-use claims, and known
                malicious content do not belong in the catalog. These checks
                also apply to projects from OIC’s founders.
              </p>
              <p>
                YAML validation checks the file’s structure. Listing review
                checks its claims against sources. Neither proves that software
                is safe or suitable for production.
              </p>
              <Link className="text-link" to="/how-it-works#quality">
                What keeps the catalog useful <ArrowRight size={15} />
              </Link>
              <p>
                <Link to="/charter">Read the public Listing Charter</Link> for
                the full admission standard and review limits.
              </p>
              <details className="review-explainer">
                <summary>What about evaluations?</summary>
                <p>
                  A self-test records what a project’s own team tested. An
                  independent review adds a separate reviewer and a defined
                  scope. Neither is interchangeable with a catalog listing.
                </p>
                <p>
                  The current catalog does not award grades or publish
                  independent verification. When a scoped report is available,
                  it should name the release, tests, reviewer, and limits.
                </p>
              </details>
            </div>
          </section>
          <section className="guide-step" id="corrections" tabIndex={-1}>
            <b>05</b>
            <div>
              <h2>Keep the information useful</h2>
              <p>
                Found an unclear term, broken link, or missing requirement? Open
                “Suggest a correction” on the project page and download a note
                with the detail and its source.
              </p>
              <p>
                Correction notes stay on your device until you attach them to an
                issue in the public catalog. For profile updates, edit your
                repository: OIC checks registered sources daily and prepares
                changes for review.
              </p>
            </div>
          </section>
        </div>
        <aside className="guide-aside">
          <FileCode2 size={34} />
          <h2>Start with your project.</h2>
          <p>
            No special tooling required. Fill in the form or edit the YAML
            directly.
          </p>
          <Link className="button primary" to="/share">
            Prepare a listing <ArrowRight size={16} />
          </Link>
          <a className="button" href="/templates/project-v2.yaml" download>
            <Download size={16} />
            Download template
          </a>
          <a className="text-link" href="/data/project-v2.schema.json">
            View the schema <ArrowUpRight size={16} />
          </a>
        </aside>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <div className="container page empty-state">
      <Box size={42} />
      <h1>This page isn’t in the toolbox.</h1>
      <p>The link may have changed, or the project isn’t listed yet.</p>
      <Link className="button primary" to="/explore">
        Explore tools <ArrowRight size={17} />
      </Link>
    </div>
  );
}
