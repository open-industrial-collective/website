import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/catalog.generated.json";
import {
  discovery,
  filterProjects,
  facetOptions,
  matches,
  normalizeSearch,
  values,
} from "../src/discovery.ts";
import type { Listing } from "../src/catalog.ts";
import { parseProfile } from "../src/profile.ts";
import { stringify } from "yaml";
const realCatalog = data as Listing[];
const base = realCatalog.find((p) => p.profile)!;
const make = (
  id: string,
  category: Listing["category"],
  source: Listing["source"],
  tags: string[],
): Listing => ({
  ...base,
  id,
  name: id,
  summary: tags.join(" "),
  description: tags.join(" "),
  category,
  source,
  tags,
  platforms: ["Windows"],
  profile: undefined,
  authored: undefined,
});
const catalog: Listing[] = [
  base,
  make("test-a", "Data & connectivity", "source-available", ["MQTT"]),
  make("test-b", "Data & connectivity", "open-source", ["MQTT"]),
  make("test-c", "Visualization", "open-source", ["MQTT"]),
];
const query = (s: string) => new URLSearchParams(s);
test("OR within a group, AND across groups, legacy URLs and unknown values", () => {
  assert.equal(filterProjects(catalog, query("q=MQTT")).length, 3);
  assert.equal(
    filterProjects(
      catalog,
      query("source=open-source&source=source-available&q=MQTT"),
    ).length,
    3,
  );
  assert.equal(
    filterProjects(catalog, query("source=closed-source&q=MQTT")).length,
    0,
  );
  assert.equal(
    filterProjects(catalog, query("category=Visualization")).length,
    2,
  );
  assert.equal(filterProjects(catalog, query("offline=yes")).length, 0);
  assert.equal(filterProjects(catalog, query("works=Ignition")).length, 0);
  assert.equal(
    filterProjects(catalog, query("capability=does-not-exist")).length,
    0,
  );
});
test("aliases, facets and multiword search work without removing constraints", () => {
  assert.equal(
    normalizeSearch("overall equipment effectiveness"),
    normalizeSearch("OEE"),
  );
  assert.equal(normalizeSearch("gateway backup"), normalizeSearch("gwbk"));
  assert.equal(
    normalizeSearch("historical trends"),
    normalizeSearch("history"),
  );
  assert.equal(filterProjects(catalog, query("q=MQTT+Windows")).length, 3);
  const options = facetOptions(
    catalog,
    query("q=MQTT&source=source-available"),
    "source",
  );
  assert.equal(options.find((o) => o.value === "open-source")?.count, 2);
  assert.equal(options.find((o) => o.value === "source-available")?.count, 1);
  assert.deepEqual(
    facetOptions(catalog, query("q=MQTT&source=closed-source"), "source").find(
      (o) => o.value === "closed-source",
    ),
    { value: "closed-source", count: 0 },
  );
});
test("package environments and deployment must match one valid option", () => {
  const p = structuredClone(catalog.find((p) => p.profile)!);
  p.profile!.discovery = {
    primary: "development",
    options: [
      { delivery: "web", environments: ["Browser"], deployment: ["hosted"] },
      {
        delivery: "container",
        environments: ["Linux"],
        deployment: ["server"],
      },
    ],
  };
  assert.equal(matches(p, query("delivery=web&environment=Linux")), false);
  assert.equal(
    matches(p, query("delivery=container&deployment=hosted")),
    false,
  );
  assert.equal(
    matches(p, query("delivery=container&deployment=server&environment=Linux")),
    true,
  );
  assert.equal(
    matches(p, query("delivery=web&delivery=container&environment=Linux")),
    true,
  );
  assert.equal(
    filterProjects([p], query("delivery=web&delivery=container")).length,
    1,
  );
});
test("release ordering never substitutes listing review date; added uses stable first publication", () => {
  const a = structuredClone(catalog.find((p) => p.profile)!);
  a.name = "Z";
  a.listing.added = "2026-01-01";
  a.listing.reviewed = "2026-12-01";
  a.profile!.release = {
    version: "1",
    url: "https://example.org/release",
    date: "2026-08-01",
  };
  const b = structuredClone(catalog.find((p) => !p.profile)!);
  b.name = "A";
  b.listing.added = "2026-02-01";
  assert.equal(filterProjects([a, b], query("sort=released"))[0].name, "Z");
  assert.equal(filterProjects([a, b], query("sort=added"))[0].name, "A");
  assert.equal(values(b, "stage").length, 0);
});
test("optional discovery metadata round trips and rejects unsafe or dangling evidence", () => {
  const original = catalog.find(
    (p) => p.authored?.schema === "oic/project/v2",
  )!.authored!;
  if (original.schema !== "oic/project/v2") throw new Error("fixture");
  const p = structuredClone(original);
  p.discovery = {
    primary: "visualization",
    works_with: [
      {
        name: "Example host",
        relationship: "exports",
        version: "1.x",
        evidence_url: "https://example.org/docs",
      },
    ],
    options: [
      { delivery: "web", environments: ["Browser"], deployment: ["hosted"] },
    ],
    air_gap: "unknown",
  };
  assert.deepEqual(parseProfile(stringify(p)).project, p);
  p.discovery.options![0].resource_id = "missing";
  assert.match(
    parseProfile(stringify(p)).errors.join(" "),
    /Unknown discovery resource/,
  );
  delete p.discovery.options![0].resource_id;
  p.discovery.air_gap = "documented";
  assert.match(parseProfile(stringify(p)).errors.join(" "), /evidence URL/);
  p.discovery.air_gap_url = "javascript:alert(1)";
  assert.ok(parseProfile(stringify(p)).errors.length);
});
