import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parse, stringify } from "yaml";
import { checkProfile } from "../scripts/check-profile.ts";
import { createSnapshot, localReader, type Snapshot } from "../scripts/profile-snapshot.ts";

// An approved snapshot, written back out as the publisher's repository.
function publisherRepo(id = "visual-toolkit") {
  const snap: Snapshot = JSON.parse(readFileSync(new URL(`../content/snapshots/${id}.json`, import.meta.url), "utf8"));
  const dir = mkdtempSync(join(tmpdir(), "oic-check-"));
  mkdirSync(join(dir, ".oic"));
  writeFileSync(join(dir, ".oic/project.yaml"), snap.manifest);
  for (const [name, f] of Object.entries(snap.files)) {
    const out = join(dir, ".oic", name);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, f.kind === "text" ? f.content : Buffer.from(f.content, "base64"));
  }
  return dir;
}
const git = (dir: string, ...args: string[]) =>
  execFileSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { encoding: "utf8" }).trim();

test("an approved profile passes the publisher check with no blocking findings", async () => {
  const r = await checkProfile(publisherRepo());
  assert.deepEqual(r.errors, []);
  assert.equal(r.id, "visual-toolkit");
  assert.ok(r.files > 0);
  assert.equal(r.findings.filter((f) => f.level === "block").length, 0);
});

test("placeholder destinations in the template are blocking findings", async () => {
  const dir = mkdtempSync(join(tmpdir(), "oic-check-"));
  mkdirSync(join(dir, ".oic"));
  const p = parse(readFileSync(new URL("../public/templates/project-v2.yaml", import.meta.url), "utf8"));
  delete p.branding;
  delete p.media;
  writeFileSync(join(dir, ".oic/project.yaml"), stringify(p));
  const r = await checkProfile(dir);
  assert.deepEqual(r.errors, []);
  assert.ok(r.findings.some((f) => f.level === "block" && f.code === "nonpublic-url"));
});

test("missing and symlinked declared files fail like they do on import", async () => {
  const dir = publisherRepo();
  const manifest = parse(readFileSync(join(dir, ".oic/project.yaml"), "utf8"));
  const media = join(dir, ".oic", manifest.media[0].src);
  const copy = join(dir, "elsewhere.bin");
  writeFileSync(copy, readFileSync(media));
  unlinkSync(media);
  assert.match((await checkProfile(dir)).errors[0]!, /Missing file/);
  symlinkSync(copy, media);
  assert.match((await checkProfile(dir)).errors[0]!, /symlinks/);
});

test("uncommitted edits are flagged, and --ref checks exactly what OIC would import", async () => {
  const dir = publisherRepo();
  git(dir, "init", "-q");
  git(dir, "add", ".");
  git(dir, "commit", "-qm", "profile");
  const commit = git(dir, "rev-parse", "HEAD");
  const imported = await createSnapshot(commit, ".oic/project.yaml", localReader(dir, commit));
  const pinned = await checkProfile(dir, { ref: "HEAD" });
  assert.equal(pinned.digest, imported.digest);

  const path = join(dir, ".oic/project.yaml");
  writeFileSync(path, readFileSync(path, "utf8").replace(/^summary: .*$/m, "summary: Edited but not committed."));
  const working = await checkProfile(dir);
  assert.ok(working.findings.some((f) => f.code === "uncommitted"));
  assert.notEqual(working.digest, imported.digest);
  assert.equal((await checkProfile(dir, { ref: "HEAD" })).digest, imported.digest);
});
