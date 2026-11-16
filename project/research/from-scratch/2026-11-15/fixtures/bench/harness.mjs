// Bench harness for the from-scratch round (K2).
//
//   node --expose-gc harness.mjs [--rounds N] [--sample-ms MS] [--json] <arm.mjs> [<arm.mjs> ...]
//
// An arm module exports `name`, `build()` (the bench page as the arm's view value) and
// `render(view) => string`. The first arm is the reference for ratios (pass the
// fluent-html-8 arm first). Arms are measured interleaved, round by round, so machine
// drift hits every arm alike; each metric is the median over rounds, with the range.
//
// Metrics per arm:
//   buildRender  ops per CPU-second of render(build())  (the K2 metric: SSR rebuilds per request)
//   renderOnly   ops per CPU-second of render(prebuiltView)
//   allocB       bytes allocated per render(build()) (v8 total_allocated_bytes delta)
//   bytes/sha    output size and hash; `sameAsExpected` compares with expected.fh8.html
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import v8 from "node:v8";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
let rounds = 9;
let sampleMs = 400;
let asJson = false;
const armPaths = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--rounds") rounds = Number(args[++i]);
  else if (a === "--sample-ms") sampleMs = Number(args[++i]);
  else if (a === "--json") asJson = true;
  else armPaths.push(a);
}
if (armPaths.length === 0) {
  console.error("usage: node --expose-gc harness.mjs [--rounds N] [--sample-ms MS] [--json] <arm.mjs>...");
  process.exit(2);
}

const expected = readFileSync(resolve(here, "expected.fh8.html"), "utf8");
const squash = (s) => s.replace(/>\s+</g, "><").trim();

const arms = [];
for (const p of armPaths) {
  const mod = await import(pathToFileURL(resolve(p)).href);
  arms.push({ name: mod.name ?? p, build: mod.build, render: mod.render });
}

// Ops per CPU-second (process.cpuUsage, user+system, all threads so GC helpers count).
// Wall-clock ops/s is meaningless on a contended machine: a descheduled process looks slow.
// Wall ops/s is kept alongside for an idle machine.
function cpuMs() {
  const u = process.cpuUsage();
  return (u.user + u.system) / 1000;
}

function opsFor(fn, ms) {
  let n = 0;
  const c0 = cpuMs();
  const w0 = performance.now();
  let c = c0;
  while (c - c0 < ms) {
    for (let k = 0; k < 16; k++) fn();
    n += 16;
    c = cpuMs();
  }
  const w = performance.now();
  return { cpu: (n * 1000) / (c - c0), wall: (n * 1000) / (w - w0) };
}

function allocPerOp(fn, n) {
  globalThis.gc?.();
  const before = v8.getHeapStatistics().total_allocated_bytes;
  for (let i = 0; i < n; i++) fn();
  const after = v8.getHeapStatistics().total_allocated_bytes;
  return (after - before) / n;
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

let sink = 0;
for (const arm of arms) {
  const out = arm.render(arm.build());
  arm.bytes = Buffer.byteLength(out);
  arm.sha = createHash("sha256").update(out).digest("hex").slice(0, 16);
  arm.sameAsExpected = out === expected;
  arm.sameIgnoringWhitespace = squash(out) === squash(expected);
  arm.prebuilt = arm.build();
  arm.br = [];
  arm.brWall = [];
  arm.ro = [];
  arm.al = [];
  const br = () => { sink += arm.render(arm.build()).length; };
  const ro = () => { sink += arm.render(arm.prebuilt).length; };
  arm.fnBR = br;
  arm.fnRO = ro;
  opsFor(br, 1000);
  opsFor(ro, 500);
}

for (let r = 0; r < rounds; r++) {
  const order = r % 2 === 0 ? arms : [...arms].reverse();
  for (const arm of order) {
    globalThis.gc?.();
    const b = opsFor(arm.fnBR, sampleMs);
    arm.br.push(b.cpu);
    arm.brWall.push(b.wall);
    globalThis.gc?.();
    arm.ro.push(opsFor(arm.fnRO, sampleMs).cpu);
    arm.al.push(allocPerOp(arm.fnBR, 2000));
  }
}

const ref = arms[0];
const rows = arms.map((arm) => {
  const ratios = arm.br.map((v, i) => v / ref.br[i]);
  return {
    arm: arm.name,
    buildRenderOps: Math.round(median(arm.br)),
    buildRenderRange: [Math.round(Math.min(...arm.br)), Math.round(Math.max(...arm.br))],
    buildRenderWallOps: Math.round(median(arm.brWall)),
    renderOnlyOps: Math.round(median(arm.ro)),
    renderOnlyRange: [Math.round(Math.min(...arm.ro)), Math.round(Math.max(...arm.ro))],
    allocBytesPerBuildRender: Math.round(median(arm.al)),
    ratioVsFirst: Number(median(ratios).toFixed(3)),
    ratioRange: [Number(Math.min(...ratios).toFixed(3)), Number(Math.max(...ratios).toFixed(3))],
    outputBytes: arm.bytes,
    outputSha: arm.sha,
    sameAsExpected: arm.sameAsExpected,
    sameIgnoringWhitespace: arm.sameIgnoringWhitespace,
  };
});

const meta = { node: process.version, nodeEnv: process.env.NODE_ENV ?? null, loadavg: (await import("node:os")).loadavg(), rounds, sampleMs, gcExposed: typeof globalThis.gc === "function", sink: sink > 0 };
if (asJson) {
  console.log(JSON.stringify({ meta, rows }, null, 2));
} else {
  console.log(`node ${meta.node}, ${rounds} rounds x ${sampleMs} CPU-ms, gc exposed: ${meta.gcExposed}, NODE_ENV=${process.env.NODE_ENV ?? "(unset)"}`);
  console.table(rows.map((r) => ({
    arm: r.arm,
    "build+render ops/CPU-s": `${r.buildRenderOps} (${r.buildRenderRange.join("-")})`,
    "wall ops/s": r.buildRenderWallOps,
    "render-only ops/CPU-s": `${r.renderOnlyOps} (${r.renderOnlyRange.join("-")})`,
    "alloc B/op": r.allocBytesPerBuildRender,
    "ratio vs first": `${r.ratioVsFirst} (${r.ratioRange.join("-")})`,
    bytes: r.outputBytes,
    "same output": r.sameAsExpected ? "exact" : r.sameIgnoringWhitespace ? "whitespace" : "differs",
  })));
}
