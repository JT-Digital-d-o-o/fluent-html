// K3 as a test: the shared XSS checker on this prototype's adapter, and a negative control that
// swaps three fluent-html 9 sinks back to fluent-html 8's unchecked forms to show the checker sees them.
//   node --test test/*.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const checker = `${root}../fixtures/xss/check.mjs`;
type Row = { ctx: string; xss: number; css: number; broken: number; unsupported: number };
type Report = { k3Escapes: number; summary: Row[]; results: unknown[] };

function run(adapter: string): Report {
  let out: string;
  try { out = execFileSync(process.execPath, [checker, adapter, "--json"], { encoding: "utf8", env: { ...process.env, NODE_ENV: "production" } }); }
  catch (e) { out = (e as { stdout: string }).stdout; }
  return JSON.parse(out) as Report;
}

test("K3: zero escapes, no benign value broken, nothing unsupported, all 206 cases", () => {
  const r = run(`${root}xss/adapter.mjs`);
  const total = r.summary.at(-1)!;
  assert.equal(r.k3Escapes, 0);
  assert.equal(total.broken, 0);
  assert.equal(total.unsupported, 0);
  assert.equal(r.results.length, 206);
});

test("negative control: the unchecked forms of the same sinks escape", () => {
  const src = readFileSync(`${root}xss/adapter.mjs`, "utf8")
    .replace("Div().setStyles({ color: p })", "Div()._attr(\"style\", `color: ${p}`)")
    .replace("Style(css`.x{color: ${p}}`)", "Style(`.x{color: ${p}}`)")
    .replace("Iframe().setSrcdoc(p)", "Iframe()._attr(\"srcdoc\", p)");
  const path = `${root}out/k3/adapter.unchecked.mjs`;
  writeFileSync(path, src.replaceAll('from "fluent-html"', `from "${root}pkg/dist/index.js"`).replaceAll('from "fluent-html/htmx"', `from "${root}pkg/dist/htmx.js"`));
  const r = run(path);
  const by = Object.fromEntries(r.summary.map((s) => [s.ctx, s.xss + s.css]));
  assert.ok(by["style-value"]! > 0, "style-value");
  assert.ok(by["style-element"]! > 0, "style-element");
  assert.ok(by["iframe-srcdoc"]! > 0, "iframe-srcdoc");
});
