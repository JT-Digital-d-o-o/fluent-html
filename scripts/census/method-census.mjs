#!/usr/bin/env node
/**
 * Fleet call-site census over the fluent-html surface — the evidence base for
 * the census-ranked README head (8.0.0) and for vocabulary governance
 * (promote/prune decisions run on this data, never on taste).
 *
 * Counts `.method(` call sites for every callable on Tag.prototype plus every
 * element-subclass setter, and `Name(` call sites for the standalone pattern
 * functions (ForEach, Match, …), across the consumer repos listed in ROOTS.
 * Skips node_modules/dist/generated files. Known JS/DOM collisions are
 * corrected (`Array.from`, `res.text()`, `el.focus()` — see COLLISION_GUARDS).
 *
 * Usage (after `npm run build`):
 *   node scripts/census/method-census.mjs                  # ranked counts, one per line
 *   node scripts/census/method-census.mjs --json           # machine-readable
 *   node scripts/census/method-census.mjs --markdown 50    # top-N markdown table for the README head
 *   node scripts/census/method-census.mjs --tail           # full-surface reference listing (markdown)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

// Consumer repos scanned (existing dirs only — a missing repo is skipped, not an error).
const ROOTS = [
  "/Users/tony/jt-digital/projects-template/templates/full-stack/src",
  "/Users/tony/jt-digital/projects-template/templates/web/src",
  "/Users/tony/jt-digital/rideshare/src",
  "/Users/tony/jt-digital/ttl/src",
  "/Users/tony/jt-digital/jt-vault/src",
  "/Users/tony/jt-digital/tela/src",
  "/Users/tony/jt-digital/everyframe/src",
  "/Users/tony/jt-digital/workshop-toni/src",
  "/Users/tony/jt-digital/jt-cut/src",
  "/Users/tony/jt-digital/jtdigital-landing-page/src",
  "/Users/tony/jt-digital/fluent-html-demos/src",
];

const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", "coverage"]);
const isSourceFile = (f) =>
  f.endsWith(".ts") && !f.endsWith(".d.ts") && !f.endsWith(".gen.ts") && !f.includes(".generated.");

/**
 * Collision guards — a fluent name shared with a JS/DOM idiom counts only when
 * the call shape is plausibly fluent. Verified against the fleet:
 *  - `from`  — `Array.from(`/`Buffer.from(`/`Object.from(` are excluded by receiver.
 *  - `text`  — fluent `.text(value)` always takes an argument; `res.text()` never does.
 *  - `focus` — fluent `.focus({…})` takes a style object; DOM `el.focus()` takes none.
 *  - `select`/`fill` — same argument-required rule (DOM `input.select()`, canvas `ctx.fill()`).
 */
const COLLISION_GUARDS = {
  from: { badReceivers: /(?:Array|Buffer|Object|Promise)\s*\.\s*from\s*\($/ },
  text: { requiresArg: true },
  focus: { requiresObjectArg: true },
  select: { requiresArg: true },
  fill: { requiresArg: true },
};

// Standalone pattern functions — counted as `Name(`, not `.name(`.
const STANDALONE = [
  "ForEach", "ForEachKeyed", "IfThen", "IfThenElse", "Match", "MatchValue",
  "Intersperse", "Repeat", "defineRoutes", "defineIds", "defineTheme", "hx",
  "Partial", "hxResponse", "externalUrl", "assetUrl",
];

// Member calls that live off Tag.prototype but belong to the package surface
// (route-callable properties).
const MEMBER_EXTRAS = ["resolve"];

async function methodUniverse() {
  const { Tag } = await import("../../dist/src/index.js");
  const elements = await import("../../dist/src/elements/index.js");
  const proto = new Set(
    Object.getOwnPropertyNames(Tag.prototype).filter(
      (n) => n !== "constructor" && !n.startsWith("_") && typeof Tag.prototype[n] === "function",
    ),
  );
  const setters = new Set();
  for (const exported of Object.values(elements)) {
    if (typeof exported !== "function" || !exported.prototype || !(exported.prototype instanceof Tag)) continue;
    for (const n of Object.getOwnPropertyNames(exported.prototype)) {
      if (n === "constructor" || n.startsWith("_") || proto.has(n)) continue;
      if (typeof exported.prototype[n] === "function") setters.add(n);
    }
  }
  return { proto: [...proto], setters: [...setters] };
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (isSourceFile(entry)) yield full;
  }
}

function countInSource(source, name, standalone) {
  const re = standalone
    ? new RegExp(`(?<![.\\w])${name}\\(`, "g")
    : new RegExp(`\\.${name}\\(`, "g");
  const guard = standalone ? undefined : COLLISION_GUARDS[name];
  let count = 0;
  for (const m of source.matchAll(re)) {
    if (guard) {
      const before = source.slice(Math.max(0, m.index - 40), m.index + m[0].length);
      const after = source.slice(m.index + m[0].length, m.index + m[0].length + 2);
      if (guard.badReceivers && guard.badReceivers.test(before)) continue;
      if (guard.requiresArg && after.startsWith(")")) continue;
      if (guard.requiresObjectArg && !after.trimStart().startsWith("{")) continue;
    }
    count += 1;
  }
  return count;
}

async function census() {
  const { proto, setters } = await methodUniverse();
  const counts = new Map();
  const kind = new Map();
  for (const n of proto) { counts.set(n, 0); kind.set(n, "tag"); }
  for (const n of setters) { if (!counts.has(n)) { counts.set(n, 0); kind.set(n, "setter"); } }
  for (const n of MEMBER_EXTRAS) { if (!counts.has(n)) { counts.set(n, 0); kind.set(n, "member"); } }
  for (const n of STANDALONE) { counts.set(n, 0); kind.set(n, "standalone"); }

  let files = 0;
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      files += 1;
      const source = readFileSync(file, "utf8");
      for (const [name] of counts) {
        const add = countInSource(source, name, kind.get(name) === "standalone");
        if (add) counts.set(name, counts.get(name) + add);
      }
    }
  }
  const ranked = [...counts.entries()]
    .map(([name, count]) => ({ name, count, kind: kind.get(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { ranked, files, roots: ROOTS.length };
}

const args = process.argv.slice(2);
const { ranked, files } = await census();
const total = ranked.reduce((s, r) => s + r.count, 0);

if (args.includes("--json")) {
  console.log(JSON.stringify({ files, total, ranked }, null, 2));
} else if (args.includes("--markdown")) {
  const n = Number(args[args.indexOf("--markdown") + 1]) || 50;
  const head = ranked.filter((r) => r.kind !== "standalone").slice(0, n);
  const headTotal = head.reduce((s, r) => s + r.count, 0);
  const tagTotal = ranked.filter((r) => r.kind !== "standalone").reduce((s, r) => s + r.count, 0);
  console.log(`<!-- generated by scripts/census/method-census.mjs --markdown ${n} · ${files} files · top ${n} = ${Math.round((headTotal / tagTotal) * 100)}% of ${tagTotal} method call sites -->`);
  for (const r of head) console.log(`| \`.${r.name}()\` | ${r.count} |`);
} else if (args.includes("--tail")) {
  const kindLabel = { tag: "Tag method", setter: "element setter", member: "route callable", standalone: "standalone" };
  console.log("<!-- GENERATED by `node scripts/census/method-census.mjs --tail > generated/full-surface.md` — do not edit by hand. -->");
  console.log("# fluent-html — full callable surface (census-ranked)");
  console.log("");
  console.log(`Every callable in the package (${ranked.length} names) with its fleet call-site count`);
  console.log(`(${files} source files scanned). The README head documents the top of this list;`);
  console.log("everything below it exists, autocompletes, and stays supported — zero-count names");
  console.log("are frozen (kept, undocumented, candidates for a future prune).");
  console.log("");
  console.log("| Callable | Call sites | Kind |");
  console.log("|---|---|---|");
  for (const r of ranked) {
    const label = r.kind === "standalone" ? `${r.name}()` : `.${r.name}()`;
    console.log(`| \`${label}\` | ${r.count} | ${kindLabel[r.kind] ?? r.kind} |`);
  }
} else {
  console.log(`# ${files} files scanned · ${total} call sites`);
  for (const r of ranked) console.log(`${String(r.count).padStart(7)}  ${r.kind === "standalone" ? "" : "."}${r.name}`);
}
