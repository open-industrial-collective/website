import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Columns3,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import data from "./catalog.generated.json";
import { sourceLabels, type Listing } from "./catalog";
import {
  capabilities,
  collections,
  discovery,
  facetOptions,
  filterProjects,
  fitFacts,
  groupLabels,
  groups,
  label,
  primaryAction,
  productTypes,
  relationshipLabels,
  selections,
  values,
  type Group,
} from "./discovery";
const projects = data as Listing[];

function Modal({
  title,
  close,
  children,
  className = "",
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`explore-dialog ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          className="icon-control"
          aria-label={`Close ${title.toLowerCase()}`}
          onClick={close}
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
function ToolCard({
  p,
  selected,
  disabled,
  toggle,
  returnTo,
}: {
  p: Listing;
  selected: boolean;
  disabled: boolean;
  toggle: () => void;
  returnTo: string;
}) {
  const d = discovery(p),
    action = primaryAction(p),
    image = p.profile?.media?.find((m) => m.type === "image");
  const stage = values(p, "stage")[0];
  return (
    <article className="tool-card">
      <Link
        className={`tool-art ${image ? "" : "tool-art-placeholder"}`}
        to={`/projects/${p.id}`}
        state={{ explore: returnTo }}
        tabIndex={-1}
        aria-hidden="true"
      >
        {image?.type === "image" ? (
          <img src={image.src} alt="" loading="lazy" />
        ) : (
          <>
            <span>
              {p.name === "Eclipse Mosquitto"
                ? "MQ"
                : p.name === "Node-RED"
                  ? "n→"
                  : p.name === "MQTT Explorer"
                    ? "MQ↗"
                    : p.name.slice(0, 2)}
            </span>
            <small>{capabilities[d.primary]}</small>
          </>
        )}
      </Link>
      <div className="tool-content">
        <div className="tool-kicker">
          <span>{d.product_type ? productTypes[d.product_type] : "Tool"}</span>
          {stage && <span className="stage-pill">{label("stage", stage)}</span>}
        </div>
        <h2>
          <Link to={`/projects/${p.id}`} state={{ explore: returnTo }}>
            {p.name}
            <ArrowUpRight size={17} />
          </Link>
        </h2>
        <p className="tool-publisher">By {p.maintainer}</p>
        <p className="tool-summary">{p.summary}</p>
        <div className="tool-fit">
          <span>{capabilities[d.primary]}</span>
          <span>
            {d.works_with?.length
              ? d.works_with
                  .map((w) => `${relationshipLabels[w.relationship]} ${w.name}`)
                  .join(" · ")
              : values(p, "environment").join(" · ") ||
                "Environment not provided"}
          </span>
        </div>
        <div className="tool-access">
          <strong>
            Free · {p.profile?.access.edition || "Listed edition"}
          </strong>
          <span>{sourceLabels[p.source]}</span>
          {p.software_requirements === "paid-platform-required" && (
            <strong className="required-cost">Paid platform required</strong>
          )}
        </div>
        <details className="free-scope">
          <summary>Free scope & requirements</summary>
          <p>{p.cost_notes}</p>
        </details>
        <div className="tool-actions">
          <a href={action.url} target="_blank" rel="noopener noreferrer">
            {action.label}
            <ArrowUpRight size={15} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button
            disabled={disabled}
            aria-label={`Compare ${p.name}`}
            aria-pressed={selected}
            onClick={toggle}
          >
            {selected ? <Check size={15} /> : <Columns3 size={15} />} Compare
          </button>
        </div>
        <small className="tool-origin">
          {p.listing.origin === "curated"
            ? "OIC curated · Not a maintainer submission"
            : "Publisher-submitted listing"}
        </small>
      </div>
    </article>
  );
}
export function FitDetails({ project }: { project: Listing }) {
  const d = discovery(project);
  return (
    <section className="detail-section">
      <h2>Fit at a glance</h2>
      <dl className="fit-facts">
        {fitFacts(project)
          .filter(([name]) =>
            [
              "Capability",
              "Product type",
              "Works with",
              "Deployment",
              "Interfaces",
              "Release stage",
              "Offline operation",
              "Air-gap installation",
            ].includes(name),
          )
          .map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      {d.works_with
        ?.filter((w) => w.evidence_url)
        .map((w) => (
          <p key={w.name}>
            <a href={w.evidence_url} target="_blank" rel="noopener noreferrer">
              {w.name} compatibility reference ↗
            </a>
          </p>
        ))}
      {d.air_gap_url && (
        <p>
          <a href={d.air_gap_url} target="_blank" rel="noopener noreferrer">
            Air-gap installation reference ↗
          </a>
        </p>
      )}
      <p className="small-text">
        Profile declarations and OIC classification; compatibility has not been
        independently tested.
      </p>
    </section>
  );
}
function FilterGroup({
  group,
  params,
  toggle,
}: {
  group: Group;
  params: URLSearchParams;
  toggle: (group: Group, value: string) => void;
}) {
  const options = facetOptions(projects, params, group);
  if (!options.length) return null;
  return (
    <fieldset>
      <legend>{groupLabels[group]}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="checkbox"
            checked={selections(params, group).includes(o.value)}
            onChange={() => toggle(group, o.value)}
          />
          <span>{label(group, o.value)}</span>
          <small>{o.count}</small>
        </label>
      ))}
    </fieldset>
  );
}
export default function Explore() {
  const [params, setParams] = useSearchParams(), location = useLocation();
  const [drawer, setDrawer] = useState(false),
    [compareOpen, setCompareOpen] = useState(false),
    [suggesting, setSuggesting] = useState(false);
  const [queryDraft, setQueryDraft] = useState(params.get("q") || "");
  const query = params.get("q") || "";
  useEffect(() => {
    setQueryDraft(query);
  }, [query]);
  useEffect(() => {
    if (queryDraft === query) return;
    const timer = setTimeout(() => change("q", queryDraft, true), 200);
    return () => clearTimeout(timer);
  }, [queryDraft, query]);
  const filtered = filterProjects(projects, params),
    active = groups.flatMap((g) =>
      selections(params, g).map((v) => ({ g, v })),
    );
  const compared = [...new Set(params.getAll("compare"))]
    .filter((id) => projects.some((p) => p.id === id))
    .slice(0, 3);
  const comparison = compared.map((id) => projects.find((p) => p.id === id)!);
  const view = params.get("view") === "list" ? "list" : "grid";
  const returnTo = location.pathname + location.search;
  function change(key: string, value: string, replace = false) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        value ? next.set(key, value) : next.delete(key);
        return next;
      },
      { replace },
    );
  }
  function toggle(group: Group, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev),
        selected = selections(prev, group);
      next.delete(group);
      if (group === "capability") next.delete("category");
      if (group === "environment") next.delete("platform");
      for (const v of selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value])
        next.append(group, v);
      return next;
    });
  }
  function clear() {
    setQueryDraft("");
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const g of [...groups, "q", "category", "platform"]) next.delete(g);
      return next;
    });
  }
  function toggleCompare(id: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("compare");
      for (const v of compared.includes(id)
        ? compared.filter((v) => v !== id)
        : [...compared, id].slice(0, 3))
        next.append("compare", v);
      return next;
    });
  }
  const filterContent = (
    <>
      <div className="filter-heading">
        <strong>Refine your search</strong>
        {active.length > 0 && <button onClick={clear}>Clear all</button>}
      </div>
      {(
        [
          "capability",
          "type",
          "works",
          "deployment",
          "source",
          "try",
        ] as Group[]
      ).map((g) => (
        <FilterGroup key={g} group={g} params={params} toggle={toggle} />
      ))}
      <details className="advanced-filters">
        <summary>More filters</summary>
        {(
          [
            "delivery",
            "environment",
            "software",
            "stage",
            "offline",
            "airgap",
            "rights",
            "support",
          ] as Group[]
        ).map((g) => (
          <FilterGroup key={g} group={g} params={params} toggle={toggle} />
        ))}
      </details>
      <p className="filter-explanation">
        Choose any within a group. Groups combine. Missing details never count
        as a match.
      </p>
      <Link to="/explore/glossary">
        About these filters <ArrowUpRight size={13} />
      </Link>
    </>
  );
  const suggestions = queryDraft.trim()
    ? projects
        .filter((p) => p.name.toLowerCase().includes(queryDraft.toLowerCase()))
        .slice(0, 3)
    : [];
  const suggestedFacets = groups
    .filter((g) =>
      ["capability", "works", "delivery", "environment"].includes(g),
    )
    .flatMap((g) =>
      [...new Set(projects.flatMap((p) => values(p, g)))]
        .filter(
          (v) =>
            queryDraft.length > 1 &&
            label(g, v).toLowerCase().includes(queryDraft.toLowerCase()),
        )
        .map((v) => ({ g, v })),
    )
    .slice(0, 3);
  const relaxations = [
    ...active.map(({ g, v }) => {
      const next = new URLSearchParams(params);
      const remaining = selections(next, g).filter((x) => x !== v);
      next.delete(g);
      if (g === "capability") next.delete("category");
      if (g === "environment") next.delete("platform");
      remaining.forEach((x) => next.append(g, x));
      return {
        text: `Remove ${label(g, v)}`,
        next,
        count: filterProjects(projects, next).length,
      };
    }),
    ...(query
      ? (() => {
          const next = new URLSearchParams(params);
          next.delete("q");
          return [
            {
              text: "Clear search",
              next,
              count: filterProjects(projects, next).length,
            },
          ];
        })()
      : []),
  ]
    .filter((r) => r.count)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  return (
    <div
      className={`container page explore-page ${compared.length ? "has-comparison" : ""}`}
    >
      <div className="explore-intro">
        <div className="eyebrow">THE COLLECTIVE TOOLBOX</div>
        <h1>Find your next useful tool.</h1>
        <p>
          Free industrial software. Clear requirements. A direct route to trying
          it.
        </p>
      </div>
      <div className="explore-search-row">
        <div className="explore-search">
          <Search size={22} />
          <input
            type="search"
            aria-label="Search catalog"
            placeholder="Search tools, jobs, or interfaces…"
            value={queryDraft}
            onChange={(e) => {
              setQueryDraft(e.target.value);
              setSuggesting(true);
            }}
            onFocus={() => setSuggesting(true)}
            onBlur={(e) => {
              if (!e.currentTarget.parentElement?.contains(e.relatedTarget))
                setSuggesting(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSuggesting(false);
              if (e.key === "Enter") {
                change("q", queryDraft);
                setSuggesting(false);
              }
            }}
          />
          {queryDraft && (
            <button
              className="icon-control"
              aria-label="Clear search"
              onClick={() => {
                setQueryDraft("");
                change("q", "");
              }}
            >
              <X size={18} />
            </button>
          )}
          {suggesting &&
            (suggestions.length > 0 || suggestedFacets.length > 0) && (
              <div
                className="search-suggestions"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget))
                    setSuggesting(false);
                }}
              >
                <small>Suggestions</small>
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    state={{ explore: returnTo }}
                  >
                    {p.name}
                    <small>Tool</small>
                  </Link>
                ))}
                {suggestedFacets.map(({ g, v }) => (
                  <button
                    key={g + v}
                    onClick={() => {
                      setQueryDraft("");
                      setParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete("q");
                        next.delete(g);
                        next.append(g, v);
                        return next;
                      });
                      setSuggesting(false);
                    }}
                  >
                    {label(g, v)}
                    <small>Filter · {groupLabels[g]}</small>
                  </button>
                ))}
              </div>
            )}
        </div>
        <button
          className="button explore-filter-toggle"
          onClick={() => setDrawer(true)}
          aria-haspopup="dialog"
          aria-expanded={drawer}
        >
          <SlidersHorizontal size={18} />
          Filters {active.length > 0 && <span>{active.length}</span>}
        </button>
      </div>
      <div className="explore-shortcuts" aria-label="Curated collections">
        <span>Start here</span>
        {collections
          .filter(
            (c) =>
              filterProjects(projects, new URLSearchParams(c.params)).length >
              0,
          )
          .map((c) => (
            <Link
              key={c.name}
              title={`Curated by OIC. ${c.description}`}
              to={`/explore?${c.params}`}
            >
              {c.name}
              <ArrowRight size={13} />
            </Link>
          ))}
      </div>
      <div className="explore-workspace">
        <aside className="explore-filters" aria-label="Catalog filters">
          {filterContent}
        </aside>
        <section className="explore-results" aria-label="Tool results">
          <div className="explore-toolbar">
            <span role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
            </span>
            <div>
              <label className="sr-only" htmlFor="explore-sort">
                Sort tools
              </label>
              <select
                id="explore-sort"
                value={params.get("sort") || (query ? "relevance" : "added")}
                onChange={(e) => change("sort", e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="added">Recently added</option>
                <option value="released">Recently released</option>
                <option value="name">Name A–Z</option>
              </select>
              <div className="view-toggle">
                <button
                  className="icon-control"
                  aria-label="Card view"
                  aria-pressed={view === "grid"}
                  onClick={() => change("view", "")}
                >
                  <Grid2X2 size={17} />
                </button>
                <button
                  className="icon-control"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => change("view", "list")}
                >
                  <List size={19} />
                </button>
              </div>
            </div>
          </div>
          {(active.length > 0 || query) && (
            <div className="active-filters">
              {query && (
                <button
                  onClick={() => {
                    setQueryDraft("");
                    change("q", "");
                  }}
                >
                  Search: {query}
                  <X size={13} />
                </button>
              )}
              {active.map(({ g, v }) => (
                <button
                  key={g + v}
                  onClick={() => toggle(g, v)}
                  aria-label={`Remove ${label(g, v)}`}
                >
                  {label(g, v)}
                  <X size={13} />
                </button>
              ))}
              <button className="clear-all" onClick={clear}>
                Clear all
              </button>
            </div>
          )}
          <div className={`tool-results ${view}`}>
            {filtered.map((p) => (
              <ToolCard
                key={p.id}
                p={p}
                returnTo={returnTo}
                selected={compared.includes(p.id)}
                disabled={compared.length === 3 && !compared.includes(p.id)}
                toggle={() => toggleCompare(p.id)}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="explore-empty">
              <Search size={30} />
              <h2>No tools match just yet.</h2>
              <p>Keep your search, or loosen one constraint.</p>
              {relaxations.map((r) => (
                <button
                  className="button"
                  key={r.text}
                  onClick={() => setParams(r.next)}
                >
                  {r.text}
                  <span>
                    {r.count} {r.count === 1 ? "result" : "results"}
                  </span>
                </button>
              ))}
              <button className="text-link" onClick={clear}>
                Clear all filters
              </button>
            </div>
          )}
          <p className="explore-footnote">
            A growing catalog, curated by OIC. Listing review is not production
            certification.
          </p>
        </section>
      </div>
      {drawer && (
        <Modal
          title="Filters"
          close={() => setDrawer(false)}
          className="filter-drawer"
        >
          <div className="drawer-body">{filterContent}</div>
          <footer>
            <button className="button primary" onClick={() => setDrawer(false)}>
              Show {filtered.length}{" "}
              {filtered.length === 1 ? "result" : "results"}
              <ArrowRight size={16} />
            </button>
          </footer>
        </Modal>
      )}
      {compared.length > 0 && (
        <div
          className="comparison-tray"
          role="region"
          aria-label="Selected for comparison"
        >
          <div>
            <strong>{compared.length}/3 selected</strong>
            <div>
              {comparison.map((p) => (
                <button
                  key={p.id}
                  aria-label={`Remove ${p.name} from comparison`}
                  onClick={() => toggleCompare(p.id)}
                >
                  {p.name}
                  <X size={13} />
                </button>
              ))}
            </div>
          </div>
          <button
            className="button primary"
            disabled={compared.length < 2}
            onClick={() => setCompareOpen(true)}
          >
            Compare{compared.length < 2 ? " · choose one more" : ""}
            <Columns3 size={16} />
          </button>
        </div>
      )}
      {compareOpen && (
        <Modal
          title="Compare tools"
          close={() => setCompareOpen(false)}
          className="compare-dialog"
        >
          <p className="compare-note">
            Different jobs can complement each other. This compares declared
            information, not quality or production suitability.
          </p>
          <div className="comparison-cards">
            {comparison.map((p) => (
              <section key={p.id}>
                <h3>{p.name}</h3>
                <dl>
                  {fitFacts(p).map(([name, value]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  className="button"
                  href={primaryAction(p).url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {primaryAction(p).label}
                  <ArrowUpRight size={15} />
                </a>
              </section>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
export function DiscoveryGlossary() {
  return (
    <div className="container page glossary-page">
      <Link className="back" to="/explore">
        ← Explore tools
      </Link>
      <div className="page-heading">
        <h1>Find the right fit.</h1>
        <p>What our filters mean, and what they don’t imply.</p>
      </div>
      <section>
        <h2>Start with the job</h2>
        <dl className="fit-facts">
          {Object.entries(capabilities).map(([id, name]) => (
            <div key={id}>
              <dt>
                <Link to={`/explore?capability=${id}`}>{name}</Link>
              </dt>
              <dd>
                {
                  {
                    connectivity:
                      "Move data between devices, applications and services.",
                    visualization:
                      "Build interfaces, dashboards and visual assets.",
                    operations: "Support production, quality and traceability.",
                    data: "Store, process and analyze industrial data.",
                    automation: "Automate workflows and apply AI tools.",
                    development: "Develop, simulate, debug and test.",
                    infrastructure: "Deploy, monitor and maintain systems.",
                    security: "Manage access, secrets and policy.",
                  }[id]
                }
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h2>Keep the dimensions separate</h2>
        <p>
          Product type describes what you get. Delivery describes its format.
          Runs on describes the operating environment; deployment says where it
          operates. Interfaces describe how it exchanges data.
        </p>
        <p>
          “Requires” means a platform is needed to run. “Integrates with” means
          it exchanges data with that platform. “Exports for” means it creates
          assets for it. A shared name never establishes version compatibility.
        </p>
        <p>
          Offline operation does not establish air-gap installation. Positive
          filters include only explicitly declared information. Missing
          information is shown as “Not provided”. Package filters must match the
          same declared delivery option.
        </p>
      </section>
      <section>
        <h2>Search and collections</h2>
        <p>
          Selecting multiple options in one group broadens that group; selecting
          another group narrows the results. Search recognizes aliases such as
          OEE, gateway backup and historical trends. Filter counts include the
          other selected groups. Unknown release dates sort last.
        </p>
        <p>
          Collections are curated by OIC and derived from the same listings.
          They group useful starting points, including complementary tools,
          without implying an integration has been tested.
        </p>
        {collections.map((c) => (
          <p key={c.name}>
            <Link to={`/explore?${c.params}`}>{c.name}</Link> — {c.description}
          </p>
        ))}
      </section>
      <Link className="text-link" to="/charter">
        Read the listing standard <ArrowRight size={16} />
      </Link>
    </div>
  );
}
