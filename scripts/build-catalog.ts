import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseProfile, normalizeProfile } from "../src/profile.ts";
import { renderSnapshot, type Snapshot } from "./profile-snapshot.ts";
import { parseDocument } from "yaml";
import { parseProject, type Listing } from "../src/catalog.ts";
import { admissionPreflight } from "../src/admission.ts";
const root = fileURLToPath(new URL("../", import.meta.url));
const reviewText = await readFile(
  resolve(root, "content/reviews.json"),
  "utf8",
);
// JSON.parse silently accepts duplicate IDs; a later entry could override a review.
const reviewDocument = parseDocument(reviewText, { uniqueKeys: true });
if (reviewDocument.errors.length || reviewDocument.warnings.length)
  throw new Error(
    `Invalid review records: ${[...reviewDocument.errors, ...reviewDocument.warnings].map((e) => e.message).join("; ")}`,
  );
const reviews = JSON.parse(reviewText);
const sources = JSON.parse(
  await readFile(resolve(root, "content/sources.json"), "utf8"),
);
const projects: Listing[] = [];
const seen = new Set<string>();
for (const filename of (await readdir(resolve(root, "content/projects")))
  .filter((f) => f.endsWith(".yaml"))
  .sort()) {
  const parsed = parseProfile(
    await readFile(resolve(root, "content/projects", filename), "utf8"),
  );
  let project = parsed.project ? normalizeProfile(parsed.project) : undefined;
  let errors = parsed.errors;
  let provenance:
    { repository: string; commit: string; digest: string } | undefined;
  try {
    const snapshot: Snapshot = JSON.parse(
      await readFile(
        resolve(root, "content/snapshots", filename.replace(".yaml", ".json")),
        "utf8",
      ),
    );
    if (
      snapshot.manifest !==
      (await readFile(resolve(root, "content/projects", filename), "utf8"))
    )
      throw new Error(
        "Author manifest differs from approved snapshot: " + filename,
      );
    project = renderSnapshot(snapshot);
    errors = [];
    if (sources[project.id])
      provenance = {
        repository: sources[project.id].repository,
        commit: snapshot.commit,
        digest: snapshot.digest,
      };
    await mkdir(resolve(root, "public/images/projects"), { recursive: true });
    for (const file of Object.values(snapshot.files))
      if (file.kind === "image")
        await writeFile(
          resolve(root, `public/images/projects/${file.digest}.webp`),
          Buffer.from(file.content, "base64"),
        );
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code !== "ENOENT" ||
      parsed.project?.schema === "oic/project/v2"
    )
      throw error;
  }
  if (!project) throw new Error(`${filename}: ${errors.join("; ")}`);
  if (!parsed.project) throw new Error(`${filename}: missing authored profile`);
  const admissionBlocks = admissionPreflight(parsed.project).filter(
    (finding) => finding.level === "block",
  );
  if (admissionBlocks.length)
    throw new Error(
      `${filename}: Charter preflight: ${admissionBlocks.map((finding) => finding.message).join("; ")}`,
    );
  if (seen.has(project.id))
    throw new Error(`Duplicate project ID: ${project.id}`);
  if (filename !== `${project.id}.yaml`)
    throw new Error(`${filename}: filename must match id`);
  seen.add(project.id);
  const review = reviews[project.id];
  if (
    !review ||
    !["curated", "community"].includes(review.origin) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewed)
  )
    throw new Error(`${filename}: missing maintainer review record`);
  // Publication decisions are separate from contributor-authored YAML.
  if (project.profile?.visibility !== "withdrawn")
    projects.push({
      ...project,
      listing: { ...review, ...(provenance ? { source: provenance } : {}) },
    });
}
for (const id of Object.keys(reviews))
  if (!seen.has(id)) throw new Error(`Stale review record: ${id}`);
await mkdir(resolve(root, "public/data"), { recursive: true });
const output = JSON.stringify(projects, null, 2) + "\n";
await writeFile(resolve(root, "src/catalog.generated.json"), output);
await writeFile(resolve(root, "public/data/catalog.json"), output);
await writeFile(
  resolve(root, "public/data/project-schema.json"),
  await readFile(resolve(root, "src/project-schema.json")),
);
console.log(`Validated and built ${projects.length} free project listings.`);

await writeFile(
  resolve(root, "public/data/project-v2.schema.json"),
  await readFile(resolve(root, "src/project-v2.schema.json")),
);
