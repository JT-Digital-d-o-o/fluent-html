import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// Guards the packaging invariants fixed in 6.3.0 (audit findings architecture-1/2/3/6).
// The full fluent surface is attached to Tag.prototype by side-effect-only modules;
// these must survive tree-shaking (sideEffects array) and register from every barrel.
// Anchored at cwd (the package root) since the compiled test runs from dist/test/.
const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
describe("packaging invariants", () => {
    describe("sideEffects (architecture-1: bundlers must not drop the mixin modules)", () => {
        it("is an array, never the bare `false` that strips the fluent surface", () => {
            assert.ok(Array.isArray(pkg.sideEffects), "sideEffects must be an array, not false");
        });
        it("lists every effectful prototype-mixin module", () => {
            for (const mod of [
                "./dist/src/core/register.js",
                "./dist/src/core/tailwind-methods.js",
                "./dist/src/core/htmx-methods.js",
                "./dist/src/behaviors/emit.js",
                "./dist/src/core/overlay.js",
            ]) {
                assert.ok(pkg.sideEffects.includes(mod), `sideEffects must include ${mod}`);
            }
        });
    });
    describe("mixin registration is an invariant of every Tag-producing barrel (architecture-2)", () => {
        const surface = ["p", "setHtmx", "behavior", "overlay"];
        it("the ./elements subpath yields a fully-populated Tag", async () => {
            const m = await import("../src/elements/index.js");
            const d = m.Div("x");
            for (const method of surface) {
                assert.equal(typeof d[method], "function", `Div().${method}`);
            }
        });
        it("the ./core subpath yields a fully-populated Tag", async () => {
            const m = await import("../src/core/index.js");
            const d = m.El("div");
            for (const method of surface) {
                assert.equal(typeof d[method], "function", `El().${method}`);
            }
        });
        it("the ./control subpath registers the prototype surface", async () => {
            await import("../src/control/index.js");
            const { El } = await import("../src/core/utils.js");
            const d = El("div");
            for (const method of surface) {
                assert.equal(typeof d[method], "function", `El().${method}`);
            }
        });
    });
    describe("8.0.0 surface prune — the deleted methods stay deleted", () => {
        const PRUNED = [
            "hxDelete", "hxPut", "hxPatch",
            "backdropBrightness", "backdropContrast", "backdropGrayscale", "backdropHueRotate",
            "backdropInvert", "backdropSaturate", "backdropSepia",
            "mask", "maskFrom", "maskTo", "maskType",
            "rotateX", "rotateY", "rotateZ", "scaleX", "scaleY", "scaleZ", "scale3d",
            "skewX", "skewY", "perspectiveOrigin", "backface",
            "snap", "snapAlign", "snapStop", "scrollM",
            "placeContent", "placeItems", "placeSelf",
            "breakBefore", "breakAfter",
            "isolation", "hyphens", "scheme", "fieldSizing",
        ];
        it("none of the pruned methods is on Tag.prototype", async () => {
            const { Tag } = await import("../src/core/tag.js");
            await import("../src/index.js");
            for (const name of PRUNED) {
                assert.equal(name in Tag.prototype, false, `pruned method .${name}() resurfaced on Tag.prototype`);
            }
        });
        it("the census-verified live uses survived the prune", async () => {
            const { Tag } = await import("../src/core/tag.js");
            await import("../src/index.js");
            for (const name of ["backdropBlur", "breakInside", "hxGet", "hxPost", "rotate", "scale", "translate", "perspective", "transform", "isolate", "scroll", "scrollP", "breakAll"]) {
                assert.equal(typeof Tag.prototype[name], "function", `.${name}() must stay`);
            }
        });
    });
    describe("exports map (architecture-6)", () => {
        it("exposes ./package.json for tooling introspection", () => {
            assert.equal(pkg.exports["./package.json"], "./package.json");
        });
    });
});
//# sourceMappingURL=packaging.test.js.map