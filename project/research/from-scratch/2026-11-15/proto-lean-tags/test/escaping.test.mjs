// Lean Tags' escaping on the round's XSS fixtures (K3).
//   node --test test/
// Two layers: the shared checker (parse5 + sink oracle) must find no escape and no broken benign
// case, and the escaper's output for text and attribute contexts must be exactly the entity-encoded
// payload, so a regression in esc() fails here even if the oracle would still call it safe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CASES } from "../../fixtures/xss/cases.mjs";
import { render } from "../xss/adapter.mjs";
import { a, div, input, tw, wire, button } from "lean-tags";

const checker = fileURLToPath(new URL("../../fixtures/xss/check.mjs", import.meta.url));
const adapter = fileURLToPath(new URL("../xss/adapter.mjs", import.meta.url));
let report;
try {
  report = JSON.parse(execFileSync(process.execPath, [checker, adapter, "--json"], { encoding: "utf8", maxBuffer: 1 << 26 }));
} catch (e) {
  report = JSON.parse(e.stdout);
}

test("the checker finds zero escapes (K3)", () => assert.equal(report.k3Escapes, 0));

test("every context is supported and no benign case breaks", () => {
  const total = report.summary.find((s) => s.ctx === "TOTAL");
  assert.equal(total.unsupported, 0);
  assert.equal(total.broken, 0);
  assert.equal(report.results.length, CASES.length);
});

for (const r of report.results) {
  test(`${r.benign ? "benign " : "hostile"} ${r.id}`, () => {
    const ok = r.benign ? ["safe"] : ["safe", "rejected"];
    assert.ok(ok.includes(r.verdict), `${r.verdict}: ${r.detail ?? ""}`);
  });
}

const ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const enc = (s) => s.replace(/[&<>"']/g, (c) => ENT[c]);
const exact = {
  text: (p) => `<div>${enc(p)}</div>`,
  "rcdata-textarea": (p) => `<textarea>${enc(p)}</textarea>`,
  "rcdata-title": (p) => `<title>${enc(p)}</title>`,
  "attr-title": (p) => `<div title="${enc(p)}"></div>`,
  "attr-data": (p) => `<div data-note="${enc(p)}"></div>`,
  "attr-id": (p) => `<div id="${enc(p)}"></div>`,
  "attr-input-value": (p) => `<input value="${enc(p)}">`,
};
for (const c of CASES.filter((c) => c.ctx in exact)) {
  test(`exact encoding ${c.id}`, () => assert.equal(render(c.ctx, c.payload), exact[c.ctx](c.payload)));
}

const DEC = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
test("a hostile URL never keeps a script-capable scheme, in any URL attribute", () => {
  const sinks = [(u) => a({ href: u }, "x"), (u) => div({ data: {} }, a({ href: u })), (u) => button({ type: "submit", formaction: u }, "x")];
  for (const c of CASES.filter((c) => c.ctx.startsWith("url-") && !c.benign)) {
    for (const sink of sinks) {
      const h = sink(c.payload).h;
      const value = /(?:href|formaction)="([^"]*)"/.exec(h)[1].replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (e) => DEC[e]);
      const parsed = value.replace(/^[\u0000- ]+/, "").replace(/[\t\n\r]/g, "");
      assert.ok(!/^((javascript|vbscript):|data:(text|image\/svg))/i.test(parsed), `${c.id}: ${h}`);
    }
  }
});

test("no side door: class, on*, hx-* and bad names throw instead of rendering", () => {
  assert.throws(() => div({ class: "x" }), /leading tw argument/);
  assert.throws(() => div({ onclick: "alert(1)" }), /inline event handlers/);
  assert.throws(() => div({ "hx-get": "/x" }), /route wire/);
  assert.throws(() => div({ "data-hx-get": "/x" }), /route wire/);
  assert.throws(() => div({ ['x" onload="alert(1)']: "1" }), /refused attribute name/);
  assert.throws(() => tw`p-4 ${"bg-primary"}`, /raw string is unchecked/);
  assert.throws(() => tw.token('a" onload="x'), /refused class token/);
  assert.throws(() => button(wire({ get: "js:alert(1)" }), "x"), /refused htmx URL/);
  assert.throws(() => div({ style: { color: "red; background: url(x)" } }), /refused CSS value/);
});

test("aria booleans render as the strings ARIA requires", () => {
  assert.equal(input({ "aria-invalid": true }).h, '<input aria-invalid="true">');
  assert.equal(button({ "aria-expanded": false }, "x").h, '<button aria-expanded="false" type="button">x</button>');
});
