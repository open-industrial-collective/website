// Expected catalog status labels, derived from the generated catalog so
// adding or withdrawing a listing never breaks the browser suites.
import { readFile } from "node:fs/promises";

export const catalog = JSON.parse(
  await readFile(new URL("../src/catalog.generated.json", import.meta.url), "utf8"),
);

/** The results status text the Explore page renders for listings matching `filter`. */
export function countLabel(filter = () => true) {
  const matched = catalog.filter(filter);
  const projects = matched.filter((p) => p.listing.origin === "community").length;
  const examples = matched.filter((p) => p.listing.origin === "curated").length;
  return (
    `${projects} ${projects === 1 ? "project" : "projects"}` +
    (examples ? ` · ${examples} ${examples === 1 ? "example" : "examples"}` : "")
  );
}

export const noPaidSoftware = (p) => p.software_requirements === "no-paid-required";
