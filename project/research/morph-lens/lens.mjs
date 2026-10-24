// Lens laws against htmx 4's outerMorph, in Chromium, Firefox and WebKit.
//   PutGet      after a morph, the page is the new render
//   Identity    an element whose id survives the render keeps its object
//   GetPut      a morph to the same render leaves every client-owned state alone
//   Complement  a morph that changes something else leaves client-owned state alone
// plus exhaustive matrices for form controls, unkeyed alignment and keyed moves.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fc = createRequire("/Users/tony/jt-digital/everyframe-composer/package.json")("fast-check");
const pw = createRequire("/Users/tony/jt-digital/fluent-html/package.json")("playwright-core");
const HTMX = "/Users/tony/jt-digital/everyframe-composer/public/js/htmx.min.js";
const KEEP_OPEN = "/Users/tony/jt-digital/everyframe-composer/public/js/htmx-keep-open.js";
const HARNESS = path.join(here, "harness.js");
const RUNS = Number(process.env.RUNS || 300);
const SEED = Number(process.env.SEED || 42);
const ENGINES = (process.env.ENGINES || "chromium,firefox,webkit").split(",");

// ---------- server renders as trees ----------
const GIF = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const ID = fc.constantFrom(undefined, undefined, undefined, "a", "b", "c", "d", "e");
const base = fc.record({ id: ID, class: fc.constantFrom(undefined, "x", "y"), "data-k": fc.constantFrom(undefined, "1", "2") });
const opt = (i, sel) => ({ tag: "option", attrs: { value: "o" + i, selected: sel === i ? "" : undefined }, kids: [{ text: "o" + i }] });

const leaf = fc.oneof(
  fc.constantFrom("one", "two", "three").map((text) => ({ text })),
  fc.tuple(base, fc.constantFrom(undefined, "v1", "v2")).map(([a, value]) => ({ tag: "input", attrs: { ...a, type: "text", value } })),
  fc.tuple(base, fc.boolean()).map(([a, c]) => ({ tag: "input", attrs: { ...a, type: "checkbox", checked: c ? "" : undefined } })),
  fc.tuple(base, fc.constantFrom("", "t1", "t2")).map(([a, t]) => ({ tag: "textarea", attrs: a, kids: [{ text: t }] })),
  fc.tuple(base, fc.constantFrom(-1, 0, 1, 2)).map(([a, s]) => ({ tag: "select", attrs: a, kids: [0, 1, 2].map((i) => opt(i, s)) })),
  base.map((a) => ({ tag: "img", attrs: { ...a, "data-src": GIF, alt: "" } })),
  base.map((a) => ({ tag: "button", attrs: { ...a, type: "button" }, kids: [{ text: "b" }] })),
  base.map((a) => ({ tag: "div", attrs: { ...a, class: "scroller", style: "overflow:auto;height:20px" }, kids: [{ tag: "div", attrs: { style: "height:200px" }, kids: [] }] })),
);

const { node } = fc.letrec((tie) => ({
  node: fc.oneof({ maxDepth: 3, depthIdentifier: "tree" }, leaf, tie("box")),
  box: fc.tuple(fc.constantFrom("div", "span", "section", "ul", "details"), base, fc.array(tie("node"), { maxLength: 3 }), fc.boolean())
    .map(([tag, attrs, kids, open]) => shape(tag, attrs, kids, open)),
}));

function shape(tag, attrs, kids, open) {
  if (tag === "ul") return { tag, attrs, kids: kids.map(li) };
  if (tag === "details") return { tag, attrs: { ...attrs, open: open ? "" : undefined }, kids: [{ tag: "summary", attrs: {}, kids: [{ text: "s" }] }, ...kids] };
  return { tag, attrs, kids };
}
const li = (k) => (k.tag === "li" ? k : { tag: "li", attrs: {}, kids: [k] });

const VOID = new Set(["input", "img"]);
const isEl = (n) => n && n.tag;
function html(n) {
  if (!isEl(n)) return n.text;
  const a = Object.entries(n.attrs).filter(([, v]) => v !== undefined).map(([k, v]) => (v === "" ? k : `${k}="${v}"`)).join(" ");
  const open = `<${n.tag}${a ? " " + a : ""}>`;
  return VOID.has(n.tag) ? open : `${open}${(n.kids || []).map(html).join("")}</${n.tag}>`;
}
const render = (kids) => kids.map(html).join("");
const clone = (x) => JSON.parse(JSON.stringify(x, (k, v) => (v === undefined ? null : v)), (k, v) => (v === null ? undefined : v));

// Nodes the mutator may enter: never inside a control's own parts.
const SEALED = (n) => n.tag === "select" || n.tag === "textarea" || n.tag === "button" || (n.attrs && n.attrs.class === "scroller");
function walk(arr, fn) {
  arr.forEach((n, i) => {
    fn(n, arr, i);
    if (isEl(n) && n.kids && !SEALED(n)) walk(n.kids, fn);
  });
}
function slotsOf(tree) {
  const out = [{ arr: tree, min: 0, ul: false }];
  walk(tree, (n) => {
    if (!isEl(n) || !n.kids || SEALED(n)) return;
    if (["div", "span", "section", "li"].includes(n.tag)) out.push({ arr: n.kids, min: 0, ul: false });
    if (n.tag === "details") out.push({ arr: n.kids, min: 1, ul: false });
    if (n.tag === "ul") out.push({ arr: n.kids, min: 0, ul: true });
  });
  return out;
}
function dedupe(tree) {
  const seen = new Set();
  walk(tree, (n) => {
    if (!isEl(n) || !n.attrs.id) return;
    if (seen.has(n.attrs.id)) n.attrs.id = undefined;
    else seen.add(n.attrs.id);
  });
  return tree;
}
function nodesOf(tree, pred) {
  const out = [];
  walk(tree, (n, arr, i) => { if (pred(n, arr, i)) out.push({ n, arr, i }); });
  return out;
}
const pick = (xs, k) => xs[k % xs.length];

function mutate(tree0, ops) {
  const tree = clone(tree0);
  for (const { op, a, b, sub } of ops) {
    if (op === "attr") {
      const t = nodesOf(tree, (n) => isEl(n) && n.tag !== "summary");
      if (!t.length) continue;
      const { n } = pick(t, a);
      const key = pick(["class", "data-k", "title"], b);
      if (key === "class" && n.attrs.class === "scroller") continue;
      n.attrs[key] = pick([undefined, "x", "y", "1"], b >> 2);
    } else if (op === "state") {
      const t = nodesOf(tree, (n) => isEl(n) && ["input", "textarea", "select", "details"].includes(n.tag));
      if (!t.length) continue;
      const { n } = pick(t, a);
      if (n.tag === "input" && n.attrs.type === "text") n.attrs.value = pick([undefined, "v1", "v2"], [undefined, "v1", "v2"].indexOf(n.attrs.value) + 1);
      else if (n.tag === "input") n.attrs.checked = n.attrs.checked === "" ? undefined : "";
      else if (n.tag === "textarea") n.kids = [{ text: pick(["", "t1", "t2"], ["", "t1", "t2"].indexOf(n.kids[0].text) + 1) }];
      else if (n.tag === "select") {
        const s = n.kids.findIndex((o) => o.attrs.selected === "");
        n.kids = [0, 1, 2].map((i) => opt(i, ((s + 2) % 4) - 1));
      } else n.attrs.open = n.attrs.open === "" ? undefined : "";
    } else if (op === "text") {
      const t = nodesOf(tree, (n) => !isEl(n));
      if (!t.length) continue;
      const { arr, i } = pick(t, a);
      arr[i] = { text: pick(["one", "two", "three", "four"], b) };
    } else if (op === "del") {
      const t = nodesOf(tree, (n) => !(isEl(n) && n.tag === "summary"));
      if (!t.length) continue;
      const { arr, i } = pick(t, a);
      arr.splice(i, 1);
    } else if (op === "ins") {
      const s = pick(slotsOf(tree), a);
      const at = s.min + (b % (s.arr.length - s.min + 1));
      s.arr.splice(at, 0, s.ul ? li(clone(sub)) : clone(sub));
    } else if (op === "move") {
      const t = nodesOf(tree, (n) => isEl(n) && n.attrs.id && n.tag !== "summary");
      if (!t.length) continue;
      const { n, arr, i } = pick(t, a);
      arr.splice(i, 1);
      const s = pick(slotsOf(tree), b);
      const at = s.min + ((b >> 3) % (s.arr.length - s.min + 1));
      s.arr.splice(at, 0, s.ul && n.tag !== "li" ? li(n) : n);
    } else if (op === "swap") {
      const t = slotsOf(tree).filter((s) => s.arr.length - s.min >= 2);
      if (!t.length) continue;
      const s = pick(t, a);
      const i = s.min + (b % (s.arr.length - s.min - 1));
      [s.arr[i], s.arr[i + 1]] = [s.arr[i + 1], s.arr[i]];
    } else if (op === "id") {
      const t = nodesOf(tree, (n) => isEl(n) && n.tag !== "summary" && n.tag !== "option");
      if (!t.length) continue;
      pick(t, a).n.attrs.id = pick(["a", "b", "c", "d", "e", undefined], b);
    }
  }
  return dedupe(tree);
}

const treeArb = fc.array(node, { minLength: 1, maxLength: 4 }).map(dedupe);
const opsArb = fc.array(
  fc.record({ op: fc.constantFrom("attr", "state", "text", "del", "ins", "move", "swap", "id"), a: fc.nat(1000), b: fc.nat(1000), sub: node }),
  { minLength: 1, maxLength: 3 },
);
const pairArb = fc.tuple(treeArb, opsArb).map(([t, ops]) => ({ h1: render(t), h2: render(mutate(t, ops)), t, ops }));
const sameArb = treeArb.map((t) => ({ h1: render(t), h2: render(t) }));

// ---------- properties ----------
const KINDS = ["type", "check", "select", "textarea", "details", "attr", "child", "src", "scroll", "focus"];

function props() {
  const list = [
    {
      name: "PutGet: the page equals the new render",
      arb: fc.tuple(pairArb),
      input: ([p]) => ({ h1: p.h1, h2: p.h2, edits: [] }),
      judge: (o) => (o.canon === o.want ? "ok" : "violated"),
    },
    {
      name: "PutGet with a focused control",
      arb: fc.tuple(pairArb, fc.nat(1000)),
      input: ([p, k]) => ({ h1: p.h1, h2: p.h2, edits: [{ kind: "focus", pick: k }] }),
      judge: (o) => (o.edits[0].skipped ? "n/a" : o.canon === o.want ? "ok" : "violated"),
    },
    {
      name: "Identity: a surviving id keeps its element",
      arb: fc.tuple(pairArb),
      input: ([p]) => ({ h1: p.h1, h2: p.h2, edits: [] }),
      judge: (o) => (!o.ids.length ? "n/a" : o.ids.every((x) => x.kept) ? "ok" : "violated"),
    },
  ];
  for (const kind of KINDS) {
    list.push({
      name: `GetPut[${kind}]: a no-op morph keeps it`,
      arb: fc.tuple(sameArb, fc.nat(1000)),
      input: ([p, k]) => ({ h1: p.h1, h2: p.h2, edits: [{ kind, pick: k }] }),
      judge: (o) => (o.edits[0].skipped ? "n/a" : o.edits[0].holds ? "ok" : "violated"),
    });
  }
  for (const kind of KINDS.filter((k) => k !== "details")) {
    list.push({
      name: `Complement[${kind}]: an unrelated change keeps it`,
      arb: fc.tuple(pairArb, fc.nat(1000)),
      input: ([p, k]) => ({ h1: p.h1, h2: p.h2, edits: [{ kind, pick: k }] }),
      judge: (o) => {
        const e = o.edits[0];
        if (e.skipped || !e.connected || e.serverChanged) return "n/a";
        return e.holds ? "ok" : "violated";
      },
    });
  }
  return list;
}

async function measure(page, p) {
  const samples = fc.sample(p.arb, { numRuns: RUNS, seed: SEED });
  const tally = { ok: 0, violated: 0, "n/a": 0 };
  for (const s of samples) tally[p.judge(await page.evaluate((c) => T.run(c), p.input(s)))]++;
  let counterexample = null;
  if (tally.violated) {
    const r = await fc.check(
      fc.asyncProperty(p.arb, async (s) => p.judge(await page.evaluate((c) => T.run(c), p.input(s))) !== "violated"),
      { numRuns: RUNS * 3, seed: SEED },
    );
    if (r.failed) {
      const input = p.input(r.counterexample[0]);
      const out = await page.evaluate((c) => T.run(c), input);
      counterexample = { h1: input.h1, h2: input.h2, edits: input.edits, observed: out.edits, ids: out.ids.filter((x) => !x.kept), got: out.canon === out.want ? undefined : out.canon, want: out.canon === out.want ? undefined : out.want };
    }
  }
  return { tally, counterexample };
}

async function forms(page) {
  const rows = [];
  for (const control of ["text", "textarea", "checkbox", "select", "details"])
    for (const server of ["changes", "same"])
      for (const touched of [false, true])
        for (const focused of [false, true]) {
          if (control === "details" && server === "changes" && touched) continue;
          if (!touched && server === "same") continue;
          const r = await page.evaluate((c) => T.form(c), { control, server, touched, focused });
          rows.push({ control, server, touched, focused, ...r });
        }
  return rows;
}

const alignArb = fc.record({
  n: fc.integer({ min: 2, max: 5 }),
  op: fc.constantFrom("remove", "prepend", "remove+relabel", "prepend+relabel", "relabel"),
  i: fc.nat(10),
  j: fc.nat(10),
}).map(({ n, op, i, j }) => {
  const labels1 = "ABCDE".split("").slice(0, n);
  const at = i % n;
  let labels2 = [...labels1];
  if (op.startsWith("remove")) labels2.splice(at, 1);
  if (op.startsWith("prepend")) labels2.unshift("Z");
  const relabel = op.includes("relabel");
  if (relabel) labels2 = labels2.map((l) => l + "*");
  const keep = labels1.filter((_, k) => !(op.startsWith("remove") && k === at));
  const typedLabel = keep[j % keep.length];
  return { labels1, labels2, typed: labels1.indexOf(typedLabel), expect: relabel ? typedLabel + "*" : typedLabel, op };
});

async function align(page) {
  const samples = fc.sample(alignArb, { numRuns: RUNS, seed: SEED });
  const tally = { ok: 0, violated: 0 };
  const byOp = {};
  for (const s of samples) {
    const r = await page.evaluate((c) => T.align(c), s);
    const ok = r.nowUnder === s.expect;
    tally[ok ? "ok" : "violated"]++;
    byOp[s.op] ??= { ok: 0, violated: 0 };
    byOp[s.op][ok ? "ok" : "violated"]++;
  }
  const r = await fc.check(fc.asyncProperty(alignArb, async (s) => (await page.evaluate((c) => T.align(c), s)).nowUnder === s.expect), { numRuns: RUNS, seed: SEED });
  let counterexample = null;
  if (r.failed) {
    const s = r.counterexample[0];
    counterexample = { ...s, observed: await page.evaluate((c) => T.align(c), s) };
  }
  return { tally, byOp, counterexample };
}

async function moves(page) {
  const cases = [
    { name: "first to last", order1: [1, 2, 3, 4], order2: [2, 3, 4, 1], moved: 1 },
    { name: "last to first", order1: [1, 2, 3, 4], order2: [4, 1, 2, 3], moved: 4 },
    { name: "swap middle", order1: [1, 2, 3, 4], order2: [1, 3, 2, 4], moved: 2 },
    { name: "swap middle (other)", order1: [1, 2, 3, 4], order2: [1, 3, 2, 4], moved: 3 },
    { name: "reverse", order1: [1, 2, 3, 4], order2: [4, 3, 2, 1], moved: 2 },
  ];
  const out = [];
  for (const c of cases) out.push({ name: c.name, moved: c.moved, ...(await page.evaluate((x) => T.move(x), c)) });
  return out;
}

async function pageFor(browser, keepOpen) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("  pageerror:", e.message));
  await page.setContent("<!doctype html><html><head><meta charset=utf-8></head><body></body></html>");
  if (keepOpen) await page.evaluate(() => { window.__keepOpen = true; });
  await page.addScriptTag({ path: HTMX });
  if (keepOpen) await page.addScriptTag({ path: KEEP_OPEN });
  await page.addScriptTag({ path: HARNESS });
  return page;
}

const results = {};
for (const engine of ENGINES) {
  const browser = await pw[engine].launch();
  const version = browser.version();
  console.log(`\n=== ${engine} ${version}`);
  const page = await pageFor(browser, false);
  const r = { version, props: {}, forms: null, formsKeepOpen: null, align: null, moves: null };
  for (const p of props()) {
    const m = await measure(page, p);
    r.props[p.name] = m;
    const { ok, violated } = m.tally;
    console.log(`${violated ? "✗" : "✓"} ${p.name}  ok ${ok}  violated ${violated}  n/a ${m.tally["n/a"]}`);
  }
  r.forms = await forms(page);
  r.align = await align(page);
  console.log(`align (no ids): ok ${r.align.tally.ok} violated ${r.align.tally.violated}`, JSON.stringify(r.align.byOp));
  r.moves = await moves(page);
  for (const m of r.moves) console.log(`move ${m.name}: same ${m.same} focus ${m.focusKept} blurred ${m.blurred} scroll ${m.scrollKept} moveBefore ${m.moveBefore}`);
  const ko = await pageFor(browser, true);
  r.formsKeepOpen = (await forms(ko)).filter((x) => x.control === "details");
  results[engine] = r;
  await browser.close();
}
writeFileSync(path.join(here, "results.json"), JSON.stringify(results, null, 2));
console.log("\nwrote results.json");
