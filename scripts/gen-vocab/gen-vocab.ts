/**
 * `npm run gen:vocab` — write (or with `--check`, verify) the generated vocab
 * artifacts. Currently one: `src/core/tailwind-types.gen.ts`.
 *
 * `--check` (CI job 1, self-consistency): regenerate in memory and fail loudly
 * if the committed file differs — the vocab and the generated types can never
 * drift silently.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";

import { generatedPath, renderTailwindTypesGen } from "./emit-types.js";

const check = process.argv.includes("--check");
const outPath = generatedPath();
const next = renderTailwindTypesGen();

let current: string | undefined;
try {
  current = readFileSync(outPath, "utf8");
} catch {
  current = undefined;
}

if (check) {
  if (current === next) {
    console.log(`gen:vocab --check OK — ${outPath} is up to date.`);
  } else {
    console.error(
      `gen:vocab --check FAILED — ${outPath} is stale.\n` +
        "The class-vocab (or the types template) changed without regenerating. Run `npm run gen:vocab` and commit the result.",
    );
    process.exit(1);
  }
} else if (current === next) {
  console.log(`gen:vocab — ${outPath} already up to date.`);
} else {
  writeFileSync(outPath, next);
  console.log(`gen:vocab — wrote ${outPath}.`);
}
