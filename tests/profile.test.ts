import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { parse, stringify } from "yaml";
import sharp from "sharp";
import {
  parseProfile,
  parseDraft,
  normalizeProfile,
  type Profile,
} from "../src/profile.ts";
import {
  createSnapshot,
  localReader,
  renderSnapshot,
} from "../scripts/profile-snapshot.ts";
const full = readFileSync(
  new URL("../public/templates/project-v2.yaml", import.meta.url),
  "utf8",
);
const base = parse(full) as Profile;
const minimal = () => {
  const p = structuredClone(base);
  delete p.branding;
  delete p.media;
  delete p.faq;
  delete p.release;
  delete p.links;
  return p;
};
test("incomplete v2 drafts reopen in the form without weakening publication validation", () => {
  const draft = minimal();
  draft.name = "Unfinished tool";
  draft.source.availability = "" as Profile["source"]["availability"];
  draft.actions[0].url = "";
  const yaml = stringify(draft);
  assert.deepEqual(parseDraft(yaml).draft, draft);
  assert.ok(parseProfile(yaml).errors.length > 0);
  assert.deepEqual(parseDraft(yaml + "\nid: duplicate\n").draft, undefined);
  assert.deepEqual(parseDraft(yaml + "\nx: !tag value").draft, undefined);
  assert.deepEqual(parseDraft("#".repeat(66000)).draft, undefined);
});
test("v2 rich and minimal profiles validate and round trip without losing optional fields", () => {
  for (const p of [base, minimal()]) {
    assert.deepEqual(parseProfile(stringify(p)).errors, []);
    assert.deepEqual(
      parseProfile(stringify(parseProfile(stringify(p)).project)).project,
      p,
    );
  }
  assert.equal(normalizeProfile(minimal()).profile?.media?.length, 0);
});
test("v2 resources preserve mixed packages and their distinct terms", () => {
  const p = minimal();
  p.resources = [
    {
      id: "repo",
      kind: "source",
      title: "Source repository",
      url: "https://example.org/repo",
      access: "public",
      license: { name: "MIT", url: "https://example.org/repo/LICENSE" },
    },
    {
      id: "module",
      kind: "download",
      title: "Ignition module",
      url: "https://example.org/release/tool.modl",
      format: ".modl",
      access: "public",
      setup: "Ignition Gateway license required",
      sha256: "a".repeat(64),
    },
    {
      id: "image",
      kind: "container",
      title: "Container",
      url: "https://example.org/packages/tool",
      image: "ghcr.io/example/tool@sha256:" + "b".repeat(64),
      access: "public",
    },
    {
      id: "manual",
      kind: "document",
      title: "Install guide",
      url: "https://example.org/install.pdf",
      access: "account-required",
    },
  ];
  assert.deepEqual(parseProfile(stringify(p)).errors, []);
  assert.deepEqual(normalizeProfile(p).profile?.resources, p.resources);
  const invalidResources = [
    [p.resources[1], { ...p.resources[0], id: "module" }],
    [{ ...p.resources[1], url: "javascript:alert(1)" }],
    [{ ...p.resources[1], sha256: "bad" }],
    [{ ...p.resources[2], image: undefined }],
    [{ ...p.resources[3], image: "ghcr.io/example/tool" }],
  ];
  for (const resources of invalidResources)
    assert.ok(
      parseProfile(stringify({ ...p, resources })).errors.length,
      JSON.stringify(resources),
    );
});
test("v2 rejects dangerous paths, invalid relationships, paid editions and forged publication decisions", () => {
  const bad = [
    { ...base, access: { ...base.access, cost: "paid" } },
    { ...base, reviewed: "today" },
    { ...base, actions: base.actions.map((a) => ({ ...a, primary: false })) },
    { ...base, actions: [...base.actions, ...base.actions] },
    { ...base, source: { availability: "open-source" } },
    { ...base, description: { file: "../private.md" } },
    { ...base, description: { file: "./a.md", text: "also text" } },
    {
      ...base,
      media: [
        {
          id: "x",
          type: "image",
          src: "https://example.org/track.png",
          alt: "x",
        },
      ],
    },
    {
      ...base,
      requirements: [
        {
          name: "x",
          kind: "software",
          cost: "free",
          notes: "okay",
          applies_to: ["missing"],
        },
      ],
    },
    { ...base, links: { wiki: "javascript:alert(1)" } },
  ];
  for (const p of bad)
    assert.ok(parseProfile(stringify(p)).errors.length, JSON.stringify(p));
  for (const s of [
    full + "\nid: duplicated\n",
    full + "\n---\n" + full,
    "#".repeat(66000),
    full + "\nx: !tag value",
  ])
    assert.ok(parseProfile(s).errors.length);
});
test("paid requirements apply to the relevant action, not an unrelated free demo", () => {
  const p = minimal();
  p.actions.push({
    id: "local",
    type: "install",
    primary: false,
    url: "https://example.org/local",
  });
  p.requirements = [
    {
      name: "Host",
      kind: "software",
      cost: "paid",
      notes: "Local only",
      applies_to: ["local"],
    },
  ];
  assert.equal(normalizeProfile(p).software_requirements, "no-paid-required");
  p.requirements[0].applies_to = ["demo"];
  assert.equal(
    normalizeProfile(p).software_requirements,
    "paid-platform-required",
  );
});
test("arbitrary second project resolves generic logo, image, video, FAQ and primary action", () => {
  const p = { ...base, id: "another-independent-tool" };
  const n = normalizeProfile(p, {
    "./media/logo-on-light.png": "/images/logo.webp",
    "./media/overview.webp": "/images/overview.webp",
  });
  assert.equal(n.id, p.id);
  assert.equal(n.profile?.branding?.logo.on_light, "/images/logo.webp");
  assert.equal(n.profile?.media?.[0].type, "image");
  assert.equal(n.profile?.media?.[1].type, "video");
  assert.deepEqual(n.profile?.faq, p.faq);
  assert.equal(n.get_started, p.actions[0].url);
});
test("pinned snapshots detect asset-only changes, reject symlinks and preserve committed state", async () => {
  const dir = mkdtempSync(join(tmpdir(), "oic-test-"));
  const git = (args: string[]) =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
  try {
    git(["init", "-q"]);
    git(["config", "user.name", "Test"]);
    git(["config", "user.email", "test@example.org"]);
    mkdirSync(join(dir, ".oic/media"), { recursive: true });
    const p = minimal();
    p.description = { file: "./overview.md" };
    p.media = [
      {
        id: "screen",
        type: "image",
        src: "./media/screen.png",
        alt: "Synthetic test image",
      },
    ];
    writeFileSync(join(dir, ".oic/project.yaml"), stringify(p));
    writeFileSync(
      join(dir, ".oic/overview.md"),
      "A committed overview for an unrelated project.",
    );
    const png = async (color: string) =>
      sharp({ create: { width: 2, height: 2, channels: 3, background: color } })
        .png()
        .toBuffer();
    writeFileSync(join(dir, ".oic/media/screen.png"), await png("red"));
    git(["add", "."]);
    git(["commit", "-qm", "first"]);
    const first = git(["rev-parse", "HEAD"]);
    const a = await createSnapshot(
      first,
      ".oic/project.yaml",
      localReader(dir, first),
    );
    writeFileSync(join(dir, ".oic/media/screen.png"), await png("blue"));
    assert.equal(
      (
        await createSnapshot(
          first,
          ".oic/project.yaml",
          localReader(dir, first),
        )
      ).digest,
      a.digest,
    );
    git(["add", "."]);
    git(["commit", "-qm", "image only"]);
    const second = git(["rev-parse", "HEAD"]);
    const b = await createSnapshot(
      second,
      ".oic/project.yaml",
      localReader(dir, second),
    );
    assert.notEqual(a.digest, b.digest);
    assert.equal(
      renderSnapshot(a).description,
      "A committed overview for an unrelated project.",
    );
    const tampered = structuredClone(a);
    tampered.files["./overview.md"].content = "changed";
    assert.throws(() => renderSnapshot(tampered), /digest/);
    rmSync(join(dir, ".oic/overview.md"));
    symlinkSync("../../secret", join(dir, ".oic/overview.md"));
    git(["add", "."]);
    git(["commit", "-qm", "symlink"]);
    const third = git(["rev-parse", "HEAD"]);
    await assert.rejects(
      createSnapshot(third, ".oic/project.yaml", localReader(dir, third)),
      /regular file/,
    );
    assert.equal(
      renderSnapshot(a).id,
      p.id,
      "last good snapshot remains usable",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("oversized files and unsupported image formats are rejected before publishing", async () => {
  const p = minimal();
  p.media = [{ id: "x", type: "image", src: "./x.png", alt: "x" }];
  await assert.rejects(
    createSnapshot("a".repeat(40), ".oic/project.yaml", async (path) =>
      Buffer.from(path.endsWith(".yaml") ? stringify(p) : "<svg/>"),
    ),
  );
});
test("reviewed GIF becomes a still preview and a bounded animated asset", async () => {
  const p = minimal();
  p.media = [
    {
      id: "motion",
      type: "image",
      src: "./motion.gif",
      alt: "A short synthetic workflow",
    },
  ];
  const gif = Buffer.from(
    "R0lGODlhAgACAPAAAP8AAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQAAAAAACwAAAAAAgACAAACAoRRACH5BAAAAAAALAAAAAACAAIAgAAA/wAAAAIChFEAOw==",
    "base64",
  );
  const snapshot = await createSnapshot(
    "a".repeat(40),
    ".oic/project.yaml",
    async (path) => (path.endsWith(".yaml") ? Buffer.from(stringify(p)) : gif),
  );
  assert.equal(snapshot.files["./motion.gif"].kind, "animation");
  const media = renderSnapshot(snapshot).profile?.media?.[0];
  assert.equal(media?.type, "image");
  if (media?.type === "image") {
    assert.match(media.src, /\.webp$/);
    assert.match(media.poster || "", /\.webp$/);
    assert.notEqual(media.src, media.poster);
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { ShowcasePreview } = await import("../src/ShowcasePreview.tsx");
    const html = renderToStaticMarkup(
      createElement(ShowcasePreview, { media: [media] }),
    );
    assert.match(html, /Play GIF/);
    assert.ok(html.includes(media.poster!));
  }
  const tampered = structuredClone(snapshot);
  tampered.files["./motion.gif"].poster = Buffer.from("bad").toString("base64");
  tampered.digest = (await import("../scripts/profile-snapshot.ts")).digest(
    JSON.stringify({ manifest: tampered.manifest, files: tampered.files }),
  );
  assert.throws(() => renderSnapshot(tampered), /Poster digest mismatch/);
  assert.ok(
    parseProfile(
      stringify({
        ...p,
        branding: { logo: { on_light: "./logo.gif", alt: "Logo" } },
      }),
    ).errors.length,
  );
});

test("generic React renderer displays a second project and suppresses HTML and unsafe Markdown links", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ProfileSections, ProfileText } =
    await import("../src/ProfileContent.tsx");
  const { ShowcasePreview } = await import("../src/ShowcasePreview.tsx");
  const p = { ...base, id: "other-maker-project" };
  const html = renderToStaticMarkup(
    createElement(ProfileSections, { profile: p }),
  );
  assert.match(html, /Questions &amp; answers/);
  assert.match(html, /Does this connect to my plant/);
  const gallery = renderToStaticMarkup(
    createElement(ShowcasePreview, { media: p.media }),
  );
  assert.match(gallery, /Choose media/);
  assert.match(gallery, /walkthrough/);
  const safe = renderToStaticMarkup(
    createElement(ProfileText, {
      children:
        "Hello <script>alert(1)</script> [bad](javascript:alert(1)) ![track](https://example.org/pixel.png)",
    }),
  );
  assert.doesNotMatch(safe, /<script|<img|href="javascript:/);
  const empty = renderToStaticMarkup(
    createElement(ShowcasePreview, { media: [] }),
  );
  assert.equal(empty, "");
});
