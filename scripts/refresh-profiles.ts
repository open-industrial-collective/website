import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const sources = JSON.parse(
  await readFile(resolve(root, "content/sources.json"), "utf8"),
);
const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    timeout: 60000,
  });
let failures = 0;
if (Object.keys(sources).length > 25)
  throw Error(
    "Batch limit reached: split refresh jobs before adding more than 25 sources.",
  );
for (const [id, source] of Object.entries(sources) as [
  string,
  { path: string; repository: string },
][]) {
  try {
    run("npx", [
      "tsx",
      "scripts/sync-profile.ts",
      "fetch",
      id,
      "--path",
      source.path,
    ]);
    const path = resolve(root, `content/candidates/${id}.json`);
    const candidate = JSON.parse(await readFile(path, "utf8"));
    const approved = await readFile(
      resolve(root, `content/snapshots/${id}.json`),
      "utf8",
    )
      .then(JSON.parse)
      .catch((e) => {
        if (e.code === "ENOENT") return null;
        throw e;
      });
    if (candidate.digest === approved?.digest) {
      console.log(`${id}: unchanged`);
      continue;
    }
    const branch = `profile-update/${id}`;
    const existing = JSON.parse(
      run("gh", [
        "pr",
        "list",
        "--head",
        branch,
        "--state",
        "open",
        "--json",
        "number",
      ]),
    );
    if (existing.length) {
      console.log(
        `${id}: review already open; retaining the reviewed candidate until it is resolved`,
      );
      continue;
    }
    run("git", ["checkout", "-b", branch]);
    try {
      await mkdir(resolve(root, "content/candidates-for-review"), {
        recursive: true,
      });
      await writeFile(
        resolve(root, `content/candidates-for-review/${id}.json`),
        JSON.stringify(candidate, null, 2) + "\n",
      );
      run("git", ["add", `content/candidates-for-review/${id}.json`]);
      run("git", [
        "-c",
        "user.name=OIC profile updater",
        "-c",
        "user.email=41898282+github-actions[bot]@users.noreply.github.com",
        "commit",
        "-m",
        `Review profile update: ${id}`,
      ]);
      run("git", ["push", "origin", branch]);
      const bodyPath = resolve(root, "content/candidates", `${id}-review.md`);
      await writeFile(
        bodyPath,
        `Repository: https://github.com/${source.repository}\n\nPinned commit: ${candidate.commit}\n\nCandidate digest: ${candidate.digest}\n\nReview the complete manifest, destinations, terms and images. This PR contains a candidate only; merging it does not publish the candidate. After review, copy it to content/candidates/${id}.json and run npm run profile -- approve ${id} --digest ${candidate.digest}, then npm run check. Commit the resulting manifest and snapshot to this PR before merging.\n`,
      );
      run("gh", [
        "pr",
        "create",
        "--base",
        "main",
        "--head",
        branch,
        "--title",
        `Review profile update: ${id}`,
        "--body-file",
        bodyPath,
      ]);
    } finally {
      run("git", ["checkout", "main"]);
      run("git", ["branch", "-D", branch]);
    }
  } catch (e) {
    failures++;
    console.error(
      `${id}: ${e instanceof Error ? e.message : "refresh failed"}`,
    );
  }
}
if (failures) process.exitCode = 1;
