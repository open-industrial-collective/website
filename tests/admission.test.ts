import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { admissionPreflight } from "../src/admission.ts";
import type { Profile } from "../src/profile.ts";

const template = parse(
  readFileSync(
    new URL("../public/templates/project-v2.yaml", import.meta.url),
    "utf8",
  ),
) as Profile;

test("Charter preflight blocks placeholder and private destinations without making network requests", () => {
  const findings = admissionPreflight(template);
  assert.ok(
    findings.some((f) => f.level === "block" && f.code === "nonpublic-url"),
  );
  for (const host of ["localhost", "10.1.2.3", "service.local", "[::1]"]) {
    const p = structuredClone(template);
    p.actions[0].url = `https://${host}/download`;
    assert.ok(
      admissionPreflight(p).some(
        (f) => f.level === "block" && f.message.includes("Action demo"),
      ),
      host,
    );
  }
});

test("release integrity prompts remain review findings, not false security approval", () => {
  const p = structuredClone(template);
  p.resources = [
    {
      id: "module",
      kind: "download",
      title: "Module",
      url: "https://github.com/org/repo/releases/download/v1/module.modl",
      access: "public",
    },
    {
      id: "container",
      kind: "container",
      title: "Image",
      url: "https://github.com/org/repo/pkgs/container/app",
      image: "ghcr.io/org/app:latest",
      access: "public",
    },
  ];
  const findings = admissionPreflight(p);
  assert.ok(
    findings.some(
      (f) => f.code === "download-integrity" && f.level === "review",
    ),
  );
  assert.ok(
    findings.some((f) => f.code === "mutable-image" && f.level === "review"),
  );
});
