import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, posix } from "node:path";
import sharp from "sharp";
import {
  parseProfile,
  referencedFiles,
  normalizeProfile,
} from "../src/profile.ts";
export const digest = (v: string | Uint8Array) =>
  createHash("sha256").update(v).digest("hex");
export type ReadBlob = (path: string, limit: number) => Promise<Buffer>;
export type Snapshot = {
  commit: string;
  manifest: string;
  digest: string;
  files: Record<
    string,
    { digest: string; content: string; kind: "image" | "animation" | "text"; poster?: string; posterDigest?: string }
  >;
};
export async function createSnapshot(
  commit: string,
  manifestPath: string,
  read: ReadBlob,
): Promise<Snapshot> {
  if (!/^[a-f0-9]{40}$/.test(commit))
    throw Error("A full immutable commit SHA is required.");
  if (
    !/^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_-]+\.ya?ml$/.test(manifestPath) ||
    manifestPath.split("/").some((s) => s === ".." || s === ".")
  )
    throw Error("Invalid manifest path.");
  const manifest = (await read(manifestPath, 65536)).toString("utf8");
  const result = parseProfile(manifest);
  if (!result.project) throw Error(result.errors.join("; "));
  const files: Snapshot["files"] = {};
  let total = 0;
  if (result.project.schema === "oic/project/v2")
    for (const name of referencedFiles(result.project)) {
      const markdown = name.endsWith(".md");
      const data = await read(
        posix.join(dirname(manifestPath), name),
        markdown ? 20480 : 2 * 1024 * 1024,
      );
      if (data.length > (markdown ? 20480 : 2 * 1024 * 1024))
        throw Error(`File exceeds limit: ${name}`);
      total += data.length;
      if (total > 20 * 1024 * 1024) throw Error("Profile exceeds 20 MB.");
      if (markdown)
        files[name] = {
          digest: digest(data),
          content: data.toString("utf8"),
          kind: "text",
        };
      else {
        const animated = name.toLowerCase().endsWith(".gif");
        const image = sharp(data, {
          limitInputPixels: 12000000,
          animated,
        });
        const metadata = await image.metadata();
        if (animated) {
          const duration = (metadata.delay || []).reduce((sum, delay) => sum + delay, 0);
          if (metadata.format !== "gif" || (metadata.pages || 1) > 60 ||
              (metadata.width || 0) * (metadata.pageHeight || metadata.height || 0) > 2000000 ||
              (metadata.width || 0) * (metadata.pageHeight || metadata.height || 0) * (metadata.pages || 1) > 24000000 ||
              duration > 20000)
            throw Error("GIFs must be 60 frames or fewer, at most 2 MP per frame, 24 MP total decoded and 20 seconds long.");
          const clean = await image.webp({ quality: 75, effort: 4, loop: 0 }).toBuffer();
          if (clean.length > 6 * 1024 * 1024) throw Error("Converted GIF exceeds 6 MB.");
          const poster = await sharp(data, { page: 0, limitInputPixels: 2000000 }).webp({ quality: 82 }).toBuffer();
          files[name] = { digest: digest(clean), content: clean.toString("base64"), kind: "animation", poster: poster.toString("base64"), posterDigest: digest(poster) };
          continue;
        }
        if (!["png", "jpeg", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1)
          throw Error("Only static PNG, JPEG and WebP images or GIF animations are supported.");
        const clean = await image.rotate().webp({ quality: 88 }).toBuffer();
        files[name] = {
          digest: digest(clean),
          content: clean.toString("base64"),
          kind: "image",
        };
      }
    }
  const hash = digest(JSON.stringify({ manifest, files }));
  return { commit, manifest, digest: hash, files };
}
export function localReader(repo: string, commit: string): ReadBlob {
  return async (path, limit) => {
    const entry = execFileSync(
      "git",
      ["-C", repo, "ls-tree", commit, "--", path],
      { encoding: "utf8", maxBuffer: 4096 },
    ).trim();
    if (!entry.startsWith("100644 blob ") && !entry.startsWith("100755 blob "))
      throw Error(
        `Missing regular file (symlinks/submodules prohibited): ${path}`,
      );
    const hash = entry.split(/\s+/)[2];
    const size = Number(
      execFileSync("git", ["-C", repo, "cat-file", "-s", hash], {
        encoding: "utf8",
      }),
    );
    if (size > limit) throw Error(`File exceeds limit: ${path}`);
    return execFileSync("git", ["-C", repo, "cat-file", "blob", hash], {
      maxBuffer: limit + 1,
    });
  };
}
export function renderSnapshot(snapshot: Snapshot) {
  const result = parseProfile(snapshot.manifest);
  if (!result.project) throw Error(result.errors.join("; "));
  if (
    snapshot.digest !==
    digest(
      JSON.stringify({ manifest: snapshot.manifest, files: snapshot.files }),
    )
  )
    throw Error("Snapshot digest mismatch.");
  if (result.project.schema === "oic/project/v2")
    for (const path of referencedFiles(result.project))
      if (!snapshot.files[path]) throw Error(`Missing declared file: ${path}`);
  const resolved: Record<string, string> = {};
  for (const [path, f] of Object.entries(snapshot.files)) {
    if (
      digest(
        f.kind === "text" ? f.content : Buffer.from(f.content, "base64"),
      ) !== f.digest
    )
      throw Error(`Asset digest mismatch: ${path}`);
    if (f.kind === "animation") {
      if (!f.poster || !f.posterDigest || digest(Buffer.from(f.poster, "base64")) !== f.posterDigest)
        throw Error(`Poster digest mismatch: ${path}`);
      resolved[`${path}#poster`] = `/images/projects/${f.posterDigest}.webp`;
    }
    resolved[path] =
      f.kind === "text" ? f.content : `/images/projects/${f.digest}.webp`;
  }
  return normalizeProfile(result.project, resolved);
}
