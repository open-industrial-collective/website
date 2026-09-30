import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { admissionPreflight, type AdmissionFinding } from "../src/admission.ts";
import { parseProfile, referencedFiles } from "../src/profile.ts";
import {
  createSnapshot,
  localReader,
  renderSnapshot,
  type ReadBlob,
} from "./profile-snapshot.ts";

// A publisher-side check that runs the same importer and Charter preflight as
// OIC review, against a local checkout. It reads files only; nothing is
// fetched, published or approved, and a clean result is not an approval.

export type CheckResult = {
  id?: string;
  commit?: string;
  digest?: string;
  files: number;
  errors: string[];
  findings: AdmissionFinding[];
};

const git = (dir: string, args: string[]) =>
  execFileSync("git", ["-C", dir, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
const isRepo = (dir: string) => {
  try {
    return git(dir, ["rev-parse", "--is-inside-work-tree"]) === "true";
  } catch {
    return false;
  }
};

/** Working-tree files, with the importer's rules: regular files inside the repository, no symlinks. */
export function worktreeReader(dir: string): ReadBlob {
  const root = realpathSync(dir);
  return async (path, limit) => {
    const full = resolve(root, path);
    if (!full.startsWith(root + sep)) throw Error(`Path leaves the repository: ${path}`);
    let stat;
    try {
      stat = lstatSync(full);
    } catch {
      throw Error(`Missing file: ${path}`);
    }
    if (!stat.isFile() || realpathSync(full) !== full)
      throw Error(`Missing regular file (symlinks/submodules prohibited): ${path}`);
    if (stat.size > limit) throw Error(`File exceeds limit: ${path}`);
    return readFileSync(full);
  };
}

export async function checkProfile(
  dir: string,
  { path = ".oic/project.yaml", ref }: { path?: string; ref?: string } = {},
): Promise<CheckResult> {
  const result: CheckResult = { files: 0, errors: [], findings: [] };
  const repo = isRepo(dir);
  if (ref && !repo) {
    result.errors.push("--ref needs a git repository.");
    return result;
  }
  const commit = repo ? git(dir, ["rev-parse", ref ?? "HEAD"]) : "0".repeat(40);
  const read = ref ? localReader(dir, commit) : worktreeReader(dir);
  try {
    const snapshot = await createSnapshot(commit, path, read);
    const profile = renderSnapshot(snapshot);
    result.id = profile.id;
    result.commit = ref || repo ? commit : undefined;
    result.digest = snapshot.digest;
    result.files = Object.keys(snapshot.files).length;
    const authored = parseProfile(snapshot.manifest).project!;
    result.findings = admissionPreflight(authored);
    // OIC imports a pinned commit, so a profile that only passes with uncommitted edits isn't ready.
    if (!ref && repo) {
      const declared =
        authored.schema === "oic/project/v2"
          ? referencedFiles(authored).map((f) => posix.join(dirname(path), f))
          : [];
      const dirty = git(dir, ["status", "--porcelain", "--", path, ...declared]);
      if (dirty)
        result.findings.push({
          level: "review",
          code: "uncommitted",
          message: `Not committed yet: ${dirty
            .split("\n")
            .map((l) => l.slice(3))
            .join(", ")}. OIC reads the pushed commit, so commit and push these before submitting.`,
        });
    }
  } catch (e) {
    result.errors.push((e as Error).message);
  }
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const dir = args[0] && !args[0].startsWith("--") ? args[0] : ".";
  const path = option("--path") ?? ".oic/project.yaml";
  const strict = args.includes("--strict");
  if (args.includes("--help")) {
    console.log(
      "Usage: check-profile.ts [REPO_DIR] [--path .oic/project.yaml] [--ref COMMIT] [--strict] [--json]\n" +
        "Checks a listing profile with OIC's importer and Charter preflight. Reads the working tree unless --ref is given.",
    );
    process.exit(0);
  }
  const r = await checkProfile(dir, { path, ref: option("--ref") });
  const blocked = r.errors.length + r.findings.filter((f) => f.level === "block").length;
  const failed = blocked > 0 || (strict && r.findings.length > 0);
  if (args.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else {
    const where = relative(process.cwd(), resolve(dir, path)) || path;
    const annotate = process.env.GITHUB_ACTIONS === "true";
    for (const e of r.errors) console.log(annotate ? `::error file=${where}::${e}` : `✗ ${e}`);
    for (const f of r.findings)
      console.log(
        annotate
          ? `::${f.level === "block" ? "error" : "warning"} file=${where}::${f.message}`
          : `${f.level === "block" ? "✗" : "!"} ${f.message} (${f.code})`,
      );
    const review = r.findings.length - (blocked - r.errors.length);
    if (r.id)
      console.log(
        `${failed ? "✗" : "✓"} ${r.id}: ${r.files} declared file${r.files === 1 ? "" : "s"} imported, digest ${r.digest!.slice(0, 12)}` +
          (blocked ? `, ${blocked} blocking` : "") +
          (review ? `, ${review} for review` : "") +
          ". A clean check is not an approval.",
      );
  }
  process.exit(failed ? 1 : 0);
}
