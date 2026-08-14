/**
 * Compile-contract probes for the ResolvedRoute brand (8.0.0): route-bearing
 * sinks (`hx()`, `setHtmx()`, `AnchorTag.setHref`) accept only a branded
 * `ResolvedRoute` or an `ExternalHref` literal. Concatenation strips the
 * brand, so hand-built query strings and raw user input fail to compile;
 * `.resolve()`, route callables, literal externals, and the escape
 * constructors (`assetUrl`/`externalUrl`) pass diagnostic-free. Runs the real
 * checker over `test/types/brand-probe/probe.ts` (excluded from the build
 * tsconfig) and pins the failing lines exactly — same harness as
 * test/setter-errors.test.ts.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";

import ts from "typescript";

type Probe = { readonly code: number; readonly message: string; readonly line: number; readonly text: string };

let probes: Probe[] = [];

before(() => {
  const fixture = resolve(process.cwd(), "test/types/brand-probe/probe.ts");
  const program = ts.createProgram([fixture], {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ES2020,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
  });
  const source = program.getSourceFile(fixture);
  assert.ok(source, "probe fixture must be part of the program");
  const lines = source.text.split("\n");
  probes = ts.getPreEmitDiagnostics(program, source).map((d) => {
    const line = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : -1;
    return {
      code: d.code,
      message: ts.flattenDiagnosticMessageText(d.messageText, " "),
      line,
      text: lines[line - 1] ?? "",
    };
  });
});

function probeOn(fragment: string): Probe {
  const hit = probes.find((p) => p.text.includes(fragment));
  assert.ok(hit, `expected a diagnostic on the line containing ${JSON.stringify(fragment)}; got:\n${probes.map((p) => `L${p.line} TS${p.code}: ${p.message}`).join("\n")}`);
  return hit;
}

describe("ResolvedRoute brand — unsafe route strings fail at the sink", () => {
  it("exactly the five unsafe shapes produce diagnostics — every sanctioned shape compiles", () => {
    assert.equal(probes.length, 5, probes.map((p) => `L${p.line} TS${p.code}: ${p.message}`).join("\n"));
  });

  it("concatenating onto .resolve() strips the brand (the '?offset=' shape)", () => {
    const p = probeOn('"?offset="');
    assert.match(p.message, /not assignable to parameter of type 'ResolvedRoute/);
  });

  it("a raw request-body string into setHref fails (the open-redirect shape)", () => {
    const p = probeOn("setHref(requestBody.redirect)");
    assert.match(p.message, /type 'string' is not assignable to parameter of type 'ResolvedRoute/i);
  });

  it("a raw request-body string into hx() fails", () => {
    probeOn("hx(requestBody.redirect)");
  });

  it("a hardcoded route string into hx() fails", () => {
    probeOn('hx("/tasks")');
  });

  it("a hand-written HTMX bag with a raw endpoint fails", () => {
    probeOn('endpoint: "/tasks"');
  });

  it("no sanctioned shape leaks a diagnostic (externals, #fragments, escape constructors, resolve, callables)", () => {
    for (const fragment of ['setHref("https://', 'setHref("mailto:', 'setHref("tel:', 'setHref("#top")', "assetUrl(", "externalUrl(", "routes.list.resolve())", "routes.detail({ id: 1 })"]) {
      const hit = probes.find((p) => p.text.includes(fragment));
      assert.equal(hit, undefined, `sanctioned shape ${JSON.stringify(fragment)} produced TS${hit?.code}: ${hit?.message}`);
    }
  });
});
