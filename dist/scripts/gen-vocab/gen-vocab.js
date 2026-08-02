/**
 * `npm run gen:vocab` — write (or with `--check`, verify) the generated vocab
 * artifacts: `src/core/tailwind-types.gen.ts` (vocab-driven type unions) and
 * `src/core/css-props.gen.ts` (the `.cssProp()` property-name union).
 *
 * `--check` (CI job 1, self-consistency): regenerate in memory and fail loudly
 * if a committed file differs — the vocab and the generated artifacts can
 * never drift silently.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { generatedPath, renderTailwindTypesGen } from "./emit-types.js";
import { cssPropsGeneratedPath, renderCssPropsGen } from "./emit-css-props.js";
import { variantObjectGeneratedPath, renderVariantObjectGen } from "./emit-variant-object.js";
const check = process.argv.includes("--check");
const artifacts = [
    { path: generatedPath(), next: renderTailwindTypesGen() },
    { path: cssPropsGeneratedPath(), next: renderCssPropsGen() },
    { path: variantObjectGeneratedPath(), next: renderVariantObjectGen() },
];
let failed = false;
for (const { path: outPath, next } of artifacts) {
    let current;
    try {
        current = readFileSync(outPath, "utf8");
    }
    catch {
        current = undefined;
    }
    if (check) {
        if (current === next) {
            console.log(`gen:vocab --check OK — ${outPath} is up to date.`);
        }
        else {
            console.error(`gen:vocab --check FAILED — ${outPath} is stale.\n` +
                "The class-vocab (or a generator source) changed without regenerating. Run `npm run gen:vocab` and commit the result.");
            failed = true;
        }
    }
    else if (current === next) {
        console.log(`gen:vocab — ${outPath} already up to date.`);
    }
    else {
        writeFileSync(outPath, next);
        console.log(`gen:vocab — wrote ${outPath}.`);
    }
}
if (failed)
    process.exit(1);
//# sourceMappingURL=gen-vocab.js.map