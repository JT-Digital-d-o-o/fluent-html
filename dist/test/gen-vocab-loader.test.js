/**
 * Loader tests for scripts/gen-vocab/load-design-system.ts — deterministic
 * load and the exact-version pin the whole oracle rests on.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadDesignSystem, PINNED_TAILWIND_VERSION } from "../scripts/gen-vocab/load-design-system.js";
describe("gen-vocab design-system loader", () => {
    it("package.json pins tailwindcss to exactly the loader's version (no range)", () => {
        const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("../../package.json", import.meta.url)), "utf8"));
        assert.equal(pkg.devDependencies?.["tailwindcss"], PINNED_TAILWIND_VERSION, "devDependencies.tailwindcss must be the exact pin — no ^/~ range (the API is __unstable__)");
    });
    it("reports the pinned version for generated-file headers", async () => {
        const { tailwindVersion } = await loadDesignSystem();
        assert.equal(tailwindVersion, PINNED_TAILWIND_VERSION);
    });
    it("loads deterministically (two loads agree on the registry)", async () => {
        const a = await loadDesignSystem();
        const b = await loadDesignSystem();
        assert.equal(a.design.getClassList().length, b.design.getClassList().length);
        assert.equal(a.design.getVariants().length, b.design.getVariants().length);
        assert.deepEqual(a.design.utilities.keys("functional").sort(), b.design.utilities.keys("functional").sort());
        assert.deepEqual(a.design.utilities.keys("static").sort(), b.design.utilities.keys("static").sort());
    });
    it("loads the full registry the vocab work is scoped against", async () => {
        const { design } = await loadDesignSystem();
        assert.ok(design.getClassList().length >= 20000, "class list");
        assert.ok(design.getVariants().length >= 80, "variants");
        assert.ok(design.theme.namespace("--color").size >= 250, "color namespace");
        assert.equal(design.candidatesToCss(["bg-red-500"])[0]?.includes("background-color"), true);
        assert.equal(design.candidatesToCss(["bg-conic-undefined/longer"])[0], null, "oracle rejects invalid classes");
    });
});
//# sourceMappingURL=gen-vocab-loader.test.js.map