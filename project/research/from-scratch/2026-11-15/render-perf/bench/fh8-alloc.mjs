// What fluent-html 8 allocates, split into tree construction and serialization, and per
// kind of node. Bytes are the delta of v8 total_allocated_bytes over N runs (no GC effect).
//   NODE_ENV=production node --expose-gc bench/fh8-alloc.mjs
import v8 from "node:v8";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fhArm = await import(pathToFileURL(resolve(here, "../../fixtures/bench/arms/fluent-html-8.mjs")).href);
const hhArm = await import("./hoisted-html.mjs");
const fh = await import(pathToFileURL(resolve(here, "../../../../../../dist/src/index.js")).href);
const { assetUrl } = await import(pathToFileURL(resolve(here, "../../../../../../dist/src/htmx.js")).href);
const { Div, Button, Img, render } = fh;

let sink = 0;
function alloc(fn, n = 20000) {
  for (let i = 0; i < 2000; i++) sink += fn() ? 1 : 0;
  globalThis.gc?.();
  const before = v8.getHeapStatistics().total_allocated_bytes;
  for (let i = 0; i < n; i++) sink += fn() ? 1 : 0;
  return Math.round((v8.getHeapStatistics().total_allocated_bytes - before) / n);
}

const prebuilt = fhArm.build();
const elements = (render(prebuilt).match(/<[a-z]/g) ?? []).length;
const rows = [];
const row = (what, bytes, per) => rows.push({ what, "B/op": bytes, "B/element": per === undefined ? "" : Math.round(bytes / per) });

const fhBuild = alloc(() => fhArm.build(), 3000);
const fhRender = alloc(() => render(prebuilt), 3000);
const fhBoth = alloc(() => render(fhArm.build()), 3000);
row(`fh8 bench page: build the tree (${elements} elements)`, fhBuild, elements);
row("fh8 bench page: serialize a prebuilt tree", fhRender, elements);
row("fh8 bench page: build + serialize", fhBoth, elements);
row("hoisted-html bench page: build + serialize", alloc(() => hhArm.render(hhArm.build()), 3000), elements);

row("fh8 Div()", alloc(() => Div()));
row('fh8 Div("x")', alloc(() => Div("x")));
row('fh8 Div("x").p("4")', alloc(() => Div("x").p("4")));
row('fh8 Div("x").p("4").bg("white").shadow("md")', alloc(() => Div("x").p("4").bg("white").shadow("md")));
row('fh8 Div("a", "b") (two children)', alloc(() => Div("a", "b")));
row('fh8 Img().addAttribute("src", s).addAttribute("alt", s)', alloc(() => Img().addAttribute("src", "/a.jpg").addAttribute("alt", "A")));
row('fh8 Button("x").setHtmx(assetUrl(u), {method, swap})', alloc(() => Button("x").setHtmx(assetUrl("/cart/add/1"), { method: "post", swap: "none" })));
const one = Div("x").p("4");
row('fh8 render(Div("x").p("4")) prebuilt', alloc(() => render(one)));
const nested = Div(Div("a").p("4"), Div("b").p("4"));
row("fh8 render(Div(Div, Div)) prebuilt, 3 elements", alloc(() => render(nested)), 3);

console.table(rows);
console.log("sink", sink > 0);
