// Supplementary to the K2 harness: the harness reads only `.length`, so V8 never flattens
// the result string. A server writes bytes, so this measures render(build()) plus the UTF-8
// encode (Buffer.from), interleaved, in ops per CPU-second, and the cold cost of compiling
// the templates.
//   NODE_ENV=production node --expose-gc bench/wire.mjs
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const fh = await import(pathToFileURL(resolve(here, "../../fixtures/bench/arms/fluent-html-8.mjs")).href);
const hh = await import("./hoisted-html.mjs");
const hj = await import("./hoisted-html-join.mjs");
const lit = await import(pathToFileURL(resolve(here, "../../fixtures/bench/arms/template-literal.mjs")).href);
const { compile } = await import("../src/hh.ts");

const cpuMs = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; };
let sink = 0;
function ops(fn, ms) {
  let n = 0; const c0 = cpuMs(); let c = c0;
  while (c - c0 < ms) { for (let k = 0; k < 16; k++) fn(); n += 16; c = cpuMs(); }
  return (n * 1000) / (c - c0);
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1]; };
const arms = [fh, hh, hj, lit].map((m) => ({ name: m.name, fn: () => { sink += Buffer.from(m.render(m.build()), "utf8").length; }, r: [] }));
for (const a of arms) ops(a.fn, 800);
const ROUNDS = 11;
for (let r = 0; r < ROUNDS; r++) {
  for (const a of r % 2 ? [...arms].reverse() : arms) { globalThis.gc?.(); a.r.push(ops(a.fn, 300)); }
}
console.table(arms.map((a) => ({
  arm: a.name,
  "build+render+encode ops/CPU-s": Math.round(median(a.r)),
  "ratio vs fh8 (median of per-round ratios)": Number(median(a.r.map((v, i) => v / arms[0].r[i])).toFixed(2)),
  range: a.r.map((v, i) => v / arms[0].r[i]).reduce((acc, v) => [Math.min(acc[0], v), Math.max(acc[1], v)], [Infinity, 0]).map((v) => Number(v.toFixed(2))).join("-"),
})));

// Cold compile: the four bench templates as raw string arrays, compiled N times.
const product = ['\n  <article class="border rounded-lg overflow-hidden">\n    <img class="w-full h-48 object-cover" src="/img/product-', '.jpg" alt="Product ', '">\n    <div class="p-4">\n      <h2 class="text-lg font-bold">Product ', '</h2>\n      <p class="text-green-600 font-bold">', '</p>\n      <p class="text-gray-500 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n      <button type="button" class="px-4 py-2 bg-blue-500 text-white rounded" hx-post="', '">Add to Cart</button>\n    </div>\n  </article>'];
const N = 2000;
const t0 = performance.now();
for (let i = 0; i < N; i++) sink += compile(product, false).statics.length;
console.log(`cold compile of the product card template (${product.join("").length} chars, 5 holes): ${(((performance.now() - t0) / N) * 1000).toFixed(1)} µs wall each, once per call site per process`);
console.log("sink", sink > 0);
