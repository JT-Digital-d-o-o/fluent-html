/**
 * Fixture suite for the storage-fields codemod
 * (`scripts/codemod/storage-fields.ts`) — reads migrate to the public
 * accessors, writes migrate to the typed setters, non-Tag receivers are
 * untouched, and accessor-less reads are reported, never guessed at.
 *
 * The stub library models the PRE-privatization surface (public storage
 * fields still resolve), which is what a consumer repo links when the codemod
 * runs. The stub must live in a file named `tag.ts` — the codemod verifies
 * receivers against fluent-html's `Tag` by symbol name + declaration file
 * basename.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Project, ts } from "ts-morph";

import { applyEdits, collectEdits, type Skip } from "../scripts/codemod/storage-fields.js";

const HEADER = 'import { Div, Form, Img, Svg } from "./lib/tag.js";\ndeclare const dyn: string;\n';

const PRE_TAG = `export class Tag {
  class?: string;
  htmx?: unknown;
  setClass(_v?: string): this { return this; }
}
export class FormTag extends Tag {
  enctype?: string;
  setEnctype(_v?: string): this { return this; }
}
export class ImgTag extends Tag {
  src?: string;
  setSrc(_v?: string): this { return this; }
}
export class SvgShapeTag extends Tag {
  'stroke-width'?: string;
}
export function Div(..._children: unknown[]): Tag { return new Tag(); }
export function Form(..._children: unknown[]): FormTag { return new FormTag(); }
export function Img(): ImgTag { return new ImgTag(); }
export function Svg(): SvgShapeTag { return new SvgShapeTag(); }
`;

type Result = { readonly out: string; readonly skips: readonly Skip[] };

function makeWorld(): (code: string) => Result {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
    },
  });
  project.createSourceFile("/lib/tag.ts", PRE_TAG);
  let n = 0;
  return (code) => {
    const file = project.createSourceFile(`/fixture-${n++}.ts`, HEADER + code);
    const { edits, skips } = collectEdits(file);
    applyEdits(file, edits);
    return { out: file.getFullText().slice(HEADER.length), skips };
  };
}

describe("storage-fields codemod", () => {
  const migrate = makeWorld();

  it("rewrites reads of the accessor-backed fields to getter calls, restoring lost flow narrowing", () => {
    // The second `t.class` was narrowed to `string` by the first; a call is not
    // flow-narrowed, so it gets the `?? ""` restoration (a runtime no-op).
    const { out, skips } = migrate('const t = Div();\nif (t.class && /cursor-/.test(t.class)) t.setClass("x");\n');
    assert.equal(out, 'const t = Div();\nif (t.getClass() && /cursor-/.test(t.getClass() ?? "")) t.setClass("x");\n');
    assert.equal(skips.length, 0);
  });

  it("parenthesizes the narrowed fallback form outside call-argument position", () => {
    const { out, skips } = migrate("const t = Div();\nif (t.class) { const n = t.class.length; void n; }\n");
    assert.equal(out, 'const t = Div();\nif (t.getClass()) { const n = (t.getClass() ?? "").length; void n; }\n');
    assert.equal(skips.length, 0);
  });

  it("uses a ! assertion for narrowed reads of a getter without a neutral fallback", () => {
    const { out, skips } = migrate('const f = Form();\nif (f.enctype && f.enctype.includes("multipart")) f.setClass("x");\n');
    assert.equal(out, 'const f = Form();\nif (f.getEnctype() && f.getEnctype()!.includes("multipart")) f.setClass("x");\n');
    assert.equal(skips.length, 0);
  });

  it("preserves optional chaining on reads", () => {
    const { out, skips } = migrate("const m = Math.random() ? Form() : undefined;\nconst e = m?.enctype;\nvoid e;\n");
    assert.equal(out, "const m = Math.random() ? Form() : undefined;\nconst e = m?.getEnctype();\nvoid e;\n");
    assert.equal(skips.length, 0);
  });

  it("rewrites the enctype guard the template's swap verbs use", () => {
    const { out, skips } = migrate('const f = Form();\nif (!f.enctype) f.setEnctype("multipart/form-data");\n');
    assert.equal(out, 'const f = Form();\nif (!f.getEnctype()) f.setEnctype("multipart/form-data");\n');
    assert.equal(skips.length, 0);
  });

  it("rewrites field writes to the typed setter, keeping the RHS", () => {
    const { out, skips } = migrate('const i = Img();\ni.src = dyn;\n');
    assert.equal(out, "const i = Img();\ni.setSrc(dyn);\n");
    assert.equal(skips.length, 0);
  });

  it("rewrites hyphenated SVG element-access writes through the irregular map", () => {
    const { out, skips } = migrate('Svg()["stroke-width"] = "2";\n');
    assert.equal(out, 'Svg().setStrokeWidth("2");\n');
    assert.equal(skips.length, 0);
  });

  it("a storage read inside a rewritten write's RHS still migrates", () => {
    const { out, skips } = migrate("const a = Div(), b = Div();\na.class = b.class;\n");
    assert.equal(out, "const a = Div(), b = Div();\na.setClass(b.getClass());\n");
    assert.equal(skips.length, 0);
  });

  it("leaves non-Tag receivers alone", () => {
    const src = 'const el = { src: "", class: "" };\nel.src = "x";\nconst c = el.class;\nvoid c;\n';
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 0);
  });

  it("does not touch setter calls (they were never field accesses)", () => {
    const src = 'Img().setSrc("/a.jpg");\n';
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 0);
  });

  it("reports an accessor-less read instead of guessing", () => {
    const src = "const h = Div().htmx;\nvoid h;\n";
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 1);
    assert.equal(skips[0]!.name, "htmx");
    assert.match(skips[0]!.reason, /no public accessor/);
  });

  it("reports compound assignments instead of emitting an invalid getter LHS", () => {
    const src = 'const t = Div();\nt.class += " extra";\n';
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 1);
    assert.equal(skips[0]!.name, "class");
    assert.match(skips[0]!.reason, /compound assignment/);
  });

  it("reports assignments whose value is used (setters return the tag, not the value)", () => {
    const src = 'const t = Div();\nconst c = (t.class = "x");\nvoid c;\n';
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 1);
    assert.equal(skips[0]!.name, "class");
    assert.match(skips[0]!.reason, /value is used/);
  });

  it("reports destructuring of storage names off a Tag-typed source", () => {
    const src = "const f = Form();\nconst { enctype } = f;\nvoid enctype;\n";
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 1);
    assert.equal(skips[0]!.name, "enctype");
    assert.match(skips[0]!.reason, /destructuring/);
  });

  it("ignores destructuring of non-Tag objects sharing storage names", () => {
    const src = 'const o = { enctype: "x", class: "y" };\nconst { enctype } = o;\nvoid enctype;\n';
    const { out, skips } = migrate(src);
    assert.equal(out, src);
    assert.equal(skips.length, 0);
  });
});
