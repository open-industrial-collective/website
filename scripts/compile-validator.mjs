import Ajv from "ajv";
import standalone from "ajv/dist/standalone/index.js";
import { readFileSync, writeFileSync } from "node:fs";
for (const [input, output] of [
  ["project-schema.json", "validate.generated.js"],
  ["project-v2.schema.json", "validate-v2.generated.js"],
]) {
  const schema = JSON.parse(
    readFileSync(new URL(`../src/${input}`, import.meta.url), "utf8"),
  );
  const ajv = new Ajv({ allErrors: true, code: { source: true, esm: true } });
  ajv.addFormat(
    "https-url",
    /^https:\/\/[^\s/@:]+(?::[0-9]+)?(?:[/?#][^\s]*)?$/,
  );
  // Ajv's ESM standalone output still emits a CommonJS reference for this helper.
  // Adapt that single documented runtime import for Node ESM and browser bundlers.
  const generated = standalone(ajv, ajv.compile(schema))
    .replaceAll(
      'require("ajv/dist/runtime/ucs2length").default',
      "(ucs2length.default ?? ucs2length)",
    )
    .replaceAll(
      'require("ajv/dist/runtime/equal").default',
      "(equal.default ?? equal)",
    );
  writeFileSync(
    new URL(`../src/${output}`, import.meta.url),
    'import equal from "ajv/dist/runtime/equal.js";\nimport ucs2length from "ajv/dist/runtime/ucs2length.js";\n' +
      generated,
  );
}
