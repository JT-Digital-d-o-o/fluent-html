/**
 * Fixture suite for the canonical-names codemod
 * (`scripts/codemod/canonical-names.ts`) — renames, rewrites, variant-lambda
 * conversion, and the false-positive guards (formFor-style builders, non-Tag
 * receivers, shadowed `Tag` classes).
 *
 * Fixtures run against two stub libraries on an in-memory file system:
 *  - PRE_TAG  — the pre-rename surface (old names still resolve, v5-style)
 *  - POST_TAG — the 7.0.0 surface (old names gone), which exercises the
 *    transitive receiver check on error-poisoned chains
 * The stub must live in a file named `tag.ts` — the codemod verifies receivers
 * against fluent-html's `Tag` by symbol name + declaration file basename.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Project, ts } from "ts-morph";
import { applyEdits, collectEdits } from "../scripts/codemod/canonical-names.js";
const HEADER = 'import { Div } from "./lib/tag.js";\ndeclare const dyn: string;\n';
const PRE_TAG = `export class Tag {
  padding(..._a: (string | number)[]): this { return this; }
  margin(..._a: (string | number)[]): this { return this; }
  background(_v: string): this { return this; }
  textColor(_v: string): this { return this; }
  bold(): this { return this; }
  outlineHidden(): this { return this; }
  display(_v: string): this { return this; }
  position(_v: string): this { return this; }
  on(_name: string, _cb: (t: Tag) => Tag): this { return this; }
  at(_name: string, _cb: (t: Tag) => Tag): this { return this; }
  bg(_v: string): this { return this; }
  ring(_v?: string): this { return this; }
  w(..._a: (string | number)[]): this { return this; }
  underline(): this { return this; }
  setStyle(_v: string): this { return this; }
}
export function Div(..._children: unknown[]): Tag { return new Tag(); }
`;
const POST_TAG = `export class Tag {
  p(..._a: (string | number)[]): this { return this; }
  bg(_v: string): this { return this; }
  text(_v: string): this { return this; }
  font(_v: string): this { return this; }
  outline(_v: string): this { return this; }
  block(): this { return this; }
  absolute(): this { return this; }
  hover(_o: object): this { return this; }
  md(_o: object): this { return this; }
  dark(_o: object): this { return this; }
  variant(_n: string, _o: object): this { return this; }
}
export function Div(..._children: unknown[]): Tag { return new Tag(); }
`;
/** A migration harness over a stub library: code in → migrated code + skips out. */
function makeWorld(tagSource) {
    const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            strict: true,
        },
    });
    project.createSourceFile("/lib/tag.ts", tagSource);
    let n = 0;
    return (code) => {
        const file = project.createSourceFile(`/fixture-${n++}.ts`, HEADER + code);
        const { edits, skips } = collectEdits(file);
        applyEdits(file, edits);
        return { out: file.getFullText().slice(HEADER.length), skips };
    };
}
function skipSummaries(skips) {
    return skips
        .map((s) => ({ name: s.name, reason: s.reason }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.reason.localeCompare(b.reason));
}
describe("canonical-names codemod: renames & rewrites (pre-rename lib)", () => {
    const migrate = makeWorld(PRE_TAG);
    it("renames simple + merge sources through one chain", () => {
        const { out, skips } = migrate('Div().padding("4").background("red-500").textColor("white").bold();\n');
        assert.equal(out, 'Div().p("4").bg("red-500").text("white").font("bold");\n');
        assert.equal(skips.length, 0);
    });
    it('rewrites outlineHidden() to outline("hidden")', () => {
        const { out, skips } = migrate("Div().outlineHidden();\n");
        assert.equal(out, 'Div().outline("hidden");\n');
        assert.equal(skips.length, 0);
    });
    it("keyword-dispatch: display/position literals become no-arg methods", () => {
        const { out, skips } = migrate('Div().display("block");\nDiv().position("absolute");\nDiv().display("inline-flex");\n');
        assert.equal(out, "Div().block();\nDiv().absolute();\nDiv().inlineFlex();\n");
        assert.equal(skips.length, 0);
    });
    it("keyword-dispatch guards: non-literal and unknown values skip with a report", () => {
        const src = 'Div().display(dyn);\nDiv().position("bogus");\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [
            { name: "display", reason: "display() argument is not a single string literal" },
            { name: "position", reason: 'no canonical method for position("bogus")' },
        ]);
    });
});
describe("canonical-names codemod: variant lambdas → object form", () => {
    const migrate = makeWorld(PRE_TAG);
    it("converts .on() and normalizes legacy names inside the lambda", () => {
        const { out, skips } = migrate('Div().on("hover", (t) => t.background("blue-600"));\n');
        assert.equal(out, 'Div().hover({ bg: "blue-600" });\n');
        assert.equal(skips.length, 0);
    });
    it("routes directional spacing through the real directional row", () => {
        const { out } = migrate('Div().at("md", (t) => t.padding("x", "8"));\n');
        assert.equal(out, 'Div().md({ px: "8" });\n');
    });
    it("accepts long-form direction names (top → mt)", () => {
        const { out } = migrate('Div().on("hover", (t) => t.margin("top", "2"));\n');
        assert.equal(out, 'Div().hover({ mt: "2" });\n');
    });
    it("no-arg utilities become `true`; keyword dispatch folds in", () => {
        const { out } = migrate('Div().on("hover", (t) => t.underline().display("flex"));\n');
        assert.equal(out, 'Div().hover({ underline: true, flex: true });\n');
    });
    it("unit overloads become the bracket arm", () => {
        const { out } = migrate('Div().on("hover", (t) => t.w("px", 300));\n');
        assert.equal(out, 'Div().hover({ w: "[300px]" });\n');
    });
    it("nested tier-1 variants nest as object keys", () => {
        const { out } = migrate('Div().on("dark", (t) => t.on("hover", (u) => u.bg("blue-600")));\n');
        assert.equal(out, 'Div().dark({ hover: { bg: "blue-600" } });\n');
    });
    it("non-tier-1 prefixes route through .variant()", () => {
        const { out } = migrate('Div().on("aria-checked", (t) => t.bg("blue-600"));\n');
        assert.equal(out, 'Div().variant("aria-checked", { bg: "blue-600" });\n');
    });
    it("a repeated key chains a second variant call", () => {
        const { out } = migrate('Div().on("focus", (t) => t.ring("2").ring("blue-300"));\n');
        assert.equal(out, 'Div().focus({ ring: "2" }).focus({ ring: "blue-300" });\n');
    });
    it("an empty lambda drops the call; the rest of the chain still migrates", () => {
        const { out, skips } = migrate('Div().on("hover", (t) => t).padding("4");\n');
        assert.equal(out, 'Div().p("4");\n');
        assert.equal(skips.length, 0);
    });
    it("an empty lambda on an optional chain consumes the whole `?.`", () => {
        const { out, skips } = migrate('Div()?.on("hover", (t) => t);\n');
        assert.equal(out, "Div();\n");
        assert.equal(skips.length, 0);
    });
    it("an unconvertible link skips the lambda whole, but renames inside the failed span still apply", () => {
        const { out, skips } = migrate('Div().on("hover", (t) => t.padding("4").setStyle("color:red"));\n');
        assert.equal(out, 'Div().on("hover", (t) => t.p("4").setStyle("color:red"));\n');
        assert.deepEqual(skipSummaries(skips), [{ name: "on", reason: ".setStyle() has no variant-object key" }]);
    });
    it("a block-bodied callback is skipped", () => {
        const src = 'Div().on("hover", (t) => { return t.bg("blue-600"); });\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [{ name: "on", reason: "variant callback has a block body" }]);
    });
    it("a non-literal argument inside the lambda skips the conversion (canonical name in the reason)", () => {
        const { out, skips } = migrate('Div().at("md", (t) => t.padding(dyn));\n');
        assert.equal(out, 'Div().at("md", (t) => t.p(dyn));\n');
        assert.deepEqual(skipSummaries(skips), [{ name: "at", reason: ".p() has a non-literal argument" }]);
    });
    it("a nested non-tier-1 variant skips the whole conversion, reported once", () => {
        const src = 'Div().on("dark", (t) => t.on("aria-checked", (u) => u.bg("blue-600")));\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [
            { name: "on", reason: 'nested variant "aria-checked" is not a tier-1 member' },
        ]);
    });
});
describe("canonical-names codemod: false-positive guards", () => {
    const migrate = makeWorld(PRE_TAG);
    it("formFor-style builders are untouched — non-map names never match", () => {
        const src = "class FormBuilder { select(_n: string): this { return this; } }\nnew FormBuilder().select(\"country\");\n";
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.equal(skips.length, 0);
    });
    it("map-name calls on a non-Tag receiver are left untouched and reported", () => {
        const src = "class QueryBuilder { padding(_v: string): this { return this; } display(_v: string): this { return this; } }\n" +
            'const q = new QueryBuilder();\nq.padding("4");\nq.display("block");\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [
            { name: "display", reason: "receiver does not type as Tag" },
            { name: "padding", reason: "receiver does not type as Tag" },
        ]);
    });
    it("a user class named Tag declared outside tag.ts does not pass the receiver check", () => {
        const src = 'class Tag { padding(_v: string): this { return this; } }\nnew Tag().padding("4");\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [{ name: "padding", reason: "receiver does not type as Tag" }]);
    });
    it("free functions sharing a map name are ignored entirely", () => {
        const src = 'function padding(_v: string): void {}\npadding("4");\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.equal(skips.length, 0);
    });
});
describe("canonical-names codemod: transitive receiver check (post-rename lib)", () => {
    const migrate = makeWorld(POST_TAG);
    it("rewrites a chain of old names whose types are error-poisoned by the renamed lib", () => {
        const { out, skips } = migrate('Div().padding("4").textColor("red-500").bold();\n');
        assert.equal(out, 'Div().p("4").text("red-500").font("bold");\n');
        assert.equal(skips.length, 0);
    });
    it("converts variant lambdas although .on() no longer exists on Tag", () => {
        const { out, skips } = migrate('Div().on("hover", (t) => t.bg("blue-600"));\n');
        assert.equal(out, 'Div().hover({ bg: "blue-600" });\n');
        assert.equal(skips.length, 0);
    });
    it("a failed variant span suppresses receiver-check noise from its any-typed parameter", () => {
        const src = 'Div().on(dyn, (t) => t.padding("4"));\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [{ name: "on", reason: "variant name is not a string literal" }]);
    });
    it("a chain rooted at a non-Tag receiver stays guarded transitively", () => {
        const src = 'class Q { padding(_v: string): this { return this; } }\nnew Q().padding("4").padding("2");\n';
        const { out, skips } = migrate(src);
        assert.equal(out, src);
        assert.deepEqual(skipSummaries(skips), [
            { name: "padding", reason: "receiver does not type as Tag" },
            { name: "padding", reason: "receiver does not type as Tag" },
        ]);
    });
});
//# sourceMappingURL=codemod-canonical.test.js.map