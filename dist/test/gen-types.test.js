/**
 * Types-emitter pins (llm-styling/vocab-generator, emitter 1).
 *
 *  1. Self-consistency: the committed `tailwind-types.gen.ts` byte-equals a
 *     fresh render — the vocab and the generated unions cannot drift (same
 *     check CI runs via `npm run gen:vocab -- --check`).
 *  2. Template integrity: every `@@UNION` marker resolves to a `literals`
 *     vocab row, and every `literals` row is rendered — either as a union
 *     source or as a follower whose list must equal its source's (unions
 *     shared by two methods, e.g. `blur`/`backdropBlur` → `TailwindBlur`).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classVocab } from "../src/class-vocab/index.js";
import { generatedPath, renderTailwindTypesGen, templateUnions, literalsOf } from "../scripts/gen-vocab/emit-types.js";
import { cssPropsGeneratedPath, renderCssPropsGen, cssPropertyNames } from "../scripts/gen-vocab/emit-css-props.js";
/** follower method → union-source method it must stay identical to. */
const SHARED_UNION_FOLLOWERS = new Map([
    ["backdropBlur", "blur"],
    ["gridAutoCols", "gridAutoRows"],
    ["breakAfter", "breakBefore"],
]);
describe("generated tailwind types", () => {
    it("committed tailwind-types.gen.ts matches a fresh render (run `npm run gen:vocab`)", () => {
        assert.equal(readFileSync(generatedPath(), "utf8"), renderTailwindTypesGen());
    });
    it("committed css-props.gen.ts matches a fresh render (run `npm run gen:vocab`)", () => {
        assert.equal(readFileSync(cssPropsGeneratedPath(), "utf8"), renderCssPropsGen());
    });
    it("css property names are kebab-case, deduped, and plausibly complete", () => {
        const names = cssPropertyNames();
        assert.ok(names.length >= 300, `expected ≥300 CSS properties, got ${names.length}`);
        assert.equal(new Set(names).size, names.length, "duplicate property names");
        for (const n of names) {
            assert.match(n, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, `"${n}" is not kebab-case`);
        }
        for (const expected of ["background-color", "mask-repeat", "float", "grid-template-columns"]) {
            assert.ok(names.includes(expected), `missing "${expected}"`);
        }
        assert.ok(!names.includes("css-text") && !names.includes("css-float"), "serialization accessors leaked");
    });
    it("every template union resolves to a literals vocab row", () => {
        const unions = templateUnions();
        assert.ok(unions.length >= 50, `template lost its union markers (found ${unions.length})`);
        for (const u of unions) {
            assert.ok(literalsOf(u.method).length > 0, `union ${u.typeName}: empty literals for ${u.method}`);
        }
    });
    it("union type names are unique and methods appear once", () => {
        const unions = templateUnions();
        const names = unions.map((u) => u.typeName);
        const methods = unions.map((u) => u.method);
        assert.equal(new Set(names).size, names.length, "duplicate type name in template");
        assert.equal(new Set(methods).size, methods.length, "one vocab row drives two unions — use a follower instead");
    });
    it("every literals row is rendered (union source or shared follower)", () => {
        const sources = new Set(templateUnions().map((u) => u.method));
        const missing = classVocab
            .filter((d) => d.values?.kind === "literals")
            .map((d) => d.method)
            .filter((m) => !sources.has(m) && !SHARED_UNION_FOLLOWERS.has(m));
        assert.deepEqual(missing, [], `literals rows not rendered into tailwind-types.gen.ts: ${missing.join(", ")} — add a template union or a SHARED_UNION_FOLLOWERS entry`);
    });
    it("shared-union followers stay identical to their source list", () => {
        for (const [follower, source] of SHARED_UNION_FOLLOWERS) {
            assert.deepEqual(literalsOf(follower), literalsOf(source), `values.literals of "${follower}" drifted from "${source}" — they render the same union type`);
        }
    });
});
//# sourceMappingURL=gen-types.test.js.map