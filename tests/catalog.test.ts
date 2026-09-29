import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stringify } from "yaml";
import { parseProfile, normalizeProfile } from "../src/profile.ts";
import { parseProject } from "../src/catalog.ts";
const valid = readFileSync(
  new URL("../public/templates/project.yaml", import.meta.url),
  "utf8",
);
test("free closed-source listing works without public source", () => {
  const p = parseProject(valid);
  assert.equal(p.errors.length, 0);
  assert.equal(p.project?.source, "closed-source");
});
test("source availability requires a source link", () => {
  assert.ok(
    parseProject(valid.replace("source: closed-source", "source: open-source"))
      .errors.length,
  );
});
test("reject paid listings, grading fields, unsafe links and duplicate YAML keys", () => {
  for (const text of [
    valid.replace("cost: free", "cost: paid"),
    valid + "grade: A\n",
    valid.replace("https://example.org/download", "javascript:alert(1)"),
    valid + "id: duplicate\n",
    valid.replace(
      "https://example.org/download",
      "https://user:password@example.org",
    ),
  ])
    assert.ok(parseProject(text).errors.length, text);
});
test("plain-text content round trips safely without executing templates or HTML", () => {
  const p = parseProject(valid).project!;
  const text = stringify({
    ...p,
    name: "<script>alert(1)</script>",
    summary: "${notExecuted} is plain text",
  });
  assert.equal(parseProject(text).project?.name, "<script>alert(1)</script>");
});
test("reject alias expansion, custom YAML tags, multiple documents and oversized uploads", () => {
  for (const text of [
    valid + "other: &a [x]\nmore: *a\n",
    valid.replace("cost: free", "cost: !foo free"),
    valid + "\n---\n" + valid,
    "#".repeat(33000),
  ])
    assert.ok(parseProject(text).errors.length);
});
test("published profiles validate and retain free access", () => {
  for (const id of ["dimension-engine-showcase", "visual-toolkit"]) {
    const p = parseProfile(readFileSync(new URL(`../content/projects/${id}.yaml`, import.meta.url), "utf8"));
    assert.deepEqual(p.errors, []);
    assert.ok(p.project);
    assert.equal(normalizeProfile(p.project!).cost, "free");
  }
});

test("free tools may declare paid platforms without accepting paid tool editions", () => {
  const project = parseProject(valid).project!;
  const module = {
    ...project,
    platforms: ["Ignition"],
    software_requirements: "paid-platform-required",
    cost_notes: "Module is free. A separate Ignition license is required.",
  };
  assert.equal(
    parseProject(stringify(module)).project?.software_requirements,
    "paid-platform-required",
  );
  assert.ok(parseProject(stringify({ ...module, cost: "paid" })).errors.length);
  const { software_requirements: _, ...legacy } = project;
  assert.ok(
    parseProject(stringify(legacy)).project,
    "Existing v1 files still import",
  );
  assert.ok(
    parseProject(stringify({ ...module, software_requirements: "certified" }))
      .errors.length,
  );
});

test("owner preview links to public demo without exposing its private repository", () => {
  const { project: raw, errors } = parseProfile(
    readFileSync(
      new URL("../content/projects/dimension-engine-showcase.yaml", import.meta.url),
      "utf8",
    ),
  );
  const project = raw ? normalizeProfile(raw) : undefined;
  assert.deepEqual(errors, []);
  assert.equal(project?.source, "closed-source");
  assert.equal(project?.repository, undefined);
  assert.equal(project?.homepage, "https://dimension-engine-showcase.vercel.app/");
  assert.equal(project?.software_requirements, "no-paid-required");
});
