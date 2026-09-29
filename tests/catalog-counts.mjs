import { readFile } from "node:fs/promises";
export const catalog = JSON.parse(
  await readFile(
    new URL("../src/catalog.generated.json", import.meta.url),
    "utf8",
  ),
);
export function countLabel(filter = () => true) {
  const count = catalog.filter(filter).length;
  return `${count} ${count === 1 ? "tool" : "tools"}`;
}
export const noPaidSoftware = (p) =>
  p.software_requirements === "no-paid-required";
