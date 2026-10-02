// Reconciled hx-status object-config serializer (RFC-A-05 + RFC-A-08), probed against
// the beta6 and 4.0.0 HCON sources. Pure JS copy of the proposed contract.
import { readFileSync } from "node:fs";
const S = "<scratch>";
const E = await import(`${S}/wave3/RFC-A-05-security-escape/fix/dist/src/render/escape.js`);
const { escapeAttr, sanitizeHtmxUrl } = E;
const srcs = {
  b6: "fluent-html/node_modules/htmx.org/dist/htmx.js",
  ga: "projects-template/node_modules/.pnpm/htmx.org@4.0.0/node_modules/htmx.org/dist/htmx.js",
};
const HCONs = {};
for (const [k, p] of Object.entries(srcs)) {
  const s = readFileSync(p, "utf8");
  const a = s.indexOf("const HCON = {"), b = s.indexOf("\n    };\n", a) + 7;
  HCONs[k] = new Function(s.slice(a, b) + "; return HCON;")();
}
// ---- the contract ----
const HCON_BREAK_RE = /[\s,]/;
const HCON_TOKEN_RE = /^(?:"[^"]*"|'[^']*'|<(?:[^/]|\/(?!>))+\/>)$/;
function hconBare(v) {
  const s = typeof v === "string" ? v : String(v);
  if (s === "") return false;
  const c = s.charCodeAt(0);
  if (c === 34 || c === 39 || c === 60) return HCON_TOKEN_RE.test(s);
  return !HCON_BREAK_RE.test(s);
}
function hconUnwrap(s) { if (!HCON_TOKEN_RE.test(s)) return s; return s.charCodeAt(0) === 60 ? s.slice(1, -2) : s.slice(1, -1); }
const hconUrl = (u) => sanitizeHtmxUrl(hconUnwrap(u)).replace(/[\s,'"]/g, (c) => (c === "'" ? "%27" : encodeURIComponent(c)));
function pairsOf(cfg, GATE_EMPTY) {
  const pairs = [];
  if (cfg.swap) pairs.push(["swap", String(cfg.swap)]);
  if (cfg.target) pairs.push(["target", String(cfg.target)]);
  if (cfg.select) pairs.push(["select", String(cfg.select)]);
  for (const k of ["push", "replace"]) {
    const v = cfg[k];
    if (v === undefined) continue;
    if (typeof v === "string") { if (GATE_EMPTY && v === "") continue; pairs.push([k, hconUrl(v)]); }
    else pairs.push([k, v]);
  }
  if (cfg.transition !== undefined) pairs.push(["transition", cfg.transition]);
  return pairs;
}
function buildStatusConfig(cfg, GATE_EMPTY = true) {
  const pairs = pairsOf(cfg, GATE_EMPTY);
  let out = "";
  for (const [key, v] of pairs) {
    const bare = typeof v !== "string" || hconBare(v);
    if (!bare && v.includes('"')) return JSON.stringify(Object.fromEntries(pairs.map(([k, x]) => [k, typeof x === "string" ? hconUnwrap(x) : x])));
    out += (out === "" ? "" : " ") + key + ":" + (bare ? v : '"' + v + '"');
  }
  return out;
}
const attr = (cfg, g) => escapeAttr(buildStatusConfig(cfg, g));
// ---- named cases ----
const cases = {
  "A-08 pin spaced target + swap modifier": { swap: "outerHTML scroll:top", target: "closest form", push: false },
  "A-08 pin comma select": { select: "#a,#b" },
  "A-08 pin JSON fallback": { target: `closest [data-k="a"]`, push: false },
  "A-08 pin bare byte-identical": { select: `[name="q"]`, replace: "/r?a=1&b=2" },
  "A-08 sec pin inject via replace": { replace: "/q?x=1 target:#main" },
  "A-08 sec pin quote via select": { select: `a" target:"#main` },
  "A-08 row inject (replace)": { target: "#form", swap: "outerHTML", push: false, replace: "/q?x=1 target:#main swap:innerHTML" },
  "A-08 verdict pre-quoted double": { swap: "outerHTML", target: '"closest form"', push: false },
  "A-08 verdict pre-quoted single": { target: "'closest form'" },
  "A-08 verdict JSON unwraps whole token": { target: `closest [data-k="a"]`, select: '"form .errors"' },
  "A-05 H1 status push text:img": { push: "/ok text:'<img src=x onerror=alert(1)>'" },
  "A-05 H2 status push text:script": { push: "/ok text:'<script>x()</script>'" },
  "A-05 quote breaks HCON quote": { push: '/ok" text:"<script>x()</script>' },
  "A-05 W push spaced query": { push: "/ok?tab=a b" },
  "A-05 W push comma query": { push: "/ok?t=a,b" },
  "A-05 status push data:image": { push: "data:image/png,<img src=x onerror=alert(1)>" },
  "A-05 status replace js:": { replace: "js:alert(1)" },
  "spaced target + spaced push (JSON never forced by a URL)": { target: `closest [data-k="a b"]`, push: "/ok?tab=a b" },
  "fleet invalid shape": { swap: "outerMorph", target: "#login-form", push: false },
  "empty push alone": { push: "" },
  "empty push + replace": { push: "", replace: "/r" },
  "push true (OQ1, unchanged)": { push: true },
};
for (const [name, cfg] of Object.entries(cases)) {
  const v = buildStatusConfig(cfg);
  const parsed = Object.fromEntries(Object.entries(HCONs).map(([b, H]) => [b, (() => { try { return JSON.stringify(H.parse(v)); } catch (e) { return "THROW " + e; } })()]));
  console.log(JSON.stringify({ name, attr: attr(cfg), b6: parsed.b6, ga: parsed.ga, same: parsed.b6 === parsed.ga }));
}
// empty push with no gate (A-08 alignment) for comparison
console.log("no-gate empty push alone:", buildStatusConfig({ push: "" }, false), "| + replace:", buildStatusConfig({ push: "", replace: "/r" }, false),
  "| ga parse:", JSON.stringify(HCONs.ga.parse(buildStatusConfig({ push: "", replace: "/r" }, false))));
console.log("8.1.0 bytes empty push + replace: push: replace:/r -> ga parse", JSON.stringify(HCONs.ga.parse("push: replace:/r")), " b6:", JSON.stringify(HCONs.b6.parse("push: replace:/r")));
console.log("8.1.0 bytes lone push: -> ga", JSON.stringify(HCONs.ga.parse("push:")), "b6", JSON.stringify(HCONs.b6.parse("push:")), "| gated '' ->", JSON.stringify(HCONs.ga.parse("")));
// ---- round trip fuzz under the reconciled contract ----
const ALPHA = ["a", "b", "#", ".", "-", " ", "\t", "\n", ",", '"', "'", "<", ">", "/", ":", "{", "}", "[", "]", "=", "\\", "&", "x"];
let seed = 7; const rnd = (n) => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return (((t ^ (t >>> 14)) >>> 0) / 4294967296 * n) | 0; };
const gen = () => { let s = ""; const n = 1 + rnd(10); for (let i = 0; i < n; i++) s += ALPHA[rnd(ALPHA.length)]; return s; };
const coerce = (v) => { const t = v.trim(); try { return JSON.parse(t); } catch { return t; } };
let total = 0; const ok = {}, fail = {}; const forms = { bare: 0, quoted: 0, json: 0 }; const samples = []; let quoteInUrl = 0, extraKeys = 0;
for (let i = 0; i < 20000; i++) {
  const cfg = {};
  for (const k of ["swap", "target", "select", "push", "replace"]) if (rnd(2)) cfg[k] = gen();
  if (rnd(3) === 0) cfg.push = rnd(2) === 0;
  if (rnd(4) === 0) cfg.transition = true;
  const val = buildStatusConfig(cfg);
  forms[val.startsWith("{") ? "json" : /:["']/.test(val) ? "quoted" : "bare"]++;
  const want = {};
  for (const k of ["swap", "target", "select"]) if (cfg[k]) want[k] = hconUnwrap(cfg[k]);
  for (const k of ["push", "replace"]) if (cfg[k] !== undefined && cfg[k] !== "") want[k] = typeof cfg[k] === "string" ? hconUnwrap(hconUrl(cfg[k])) : cfg[k];
  if (cfg.transition !== undefined) want.transition = cfg.transition;
  total++;
  for (const [b, H] of Object.entries(HCONs)) {
    let got; try { got = H.parse(val); } catch (e) { got = { __throw: String(e) }; }
    const keysOk = JSON.stringify(Object.keys(got).sort()) === JSON.stringify(Object.keys(want).sort());
    if (!keysOk) extraKeys++;
    const valsOk = keysOk && Object.keys(want).every((k) => got[k] === want[k] || (typeof want[k] === "string" && JSON.stringify(got[k]) === JSON.stringify(coerce(want[k]))));
    if (keysOk && valsOk) ok[b] = (ok[b] ?? 0) + 1; else { fail[b] = (fail[b] ?? 0) + 1; if (samples.length < 6) samples.push({ b, cfg, val, got, want }); }
  }
}
console.log("roundtrip", { configs: total, forms, ok, fail, keyMismatches: extraKeys });
for (const s of samples) console.log(JSON.stringify(s));
